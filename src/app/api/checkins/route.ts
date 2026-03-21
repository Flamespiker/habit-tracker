import { NextResponse } from 'next/server'
import { upsertCheckin } from '@/lib/db/supabase/checkins'
import { createClient } from '@/lib/db/supabase/server'
import { saveCoachingResponse } from '@/lib/db/mongo/ai-coaching'

/**
 * POST /api/checkins
 * Creates or updates a check-in for a habit on a given date.
 * Body: { habit_id: string; date: string; completed: boolean }
 *
 * Dual-DB write pattern: on a completed check-in, also writes a placeholder
 * coaching response to MongoDB. The real Claude API call replaces this in Phase 5.
 * The MongoDB write is fire-and-forget — a failure there never breaks the checkin.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { habit_id, date, completed } = body

    if (!habit_id || typeof habit_id !== 'string') {
      return NextResponse.json({ error: 'habit_id is required' }, { status: 400 })
    }
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
    }
    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 })
    }

    const checkin = await upsertCheckin({ habit_id, date, completed, user_id: user.id }, supabase)

    // Fire-and-forget: write a placeholder coaching nudge to MongoDB on completion.
    // Phase 5 replaces this with a real Claude API call via loadPrompt('daily-coaching-nudge').
    if (completed) {
      saveCoachingResponse({
        user_id: user.id,
        type: 'daily_nudge',
        habit_context: { habit_id, date },
        content: {
          placeholder: true,
          message: 'Real coaching insight will be generated via Claude API in Phase 5.',
        },
        model: 'claude-sonnet-4-6',
      }).catch((err) => console.error('[POST /api/checkins] MongoDB nudge write failed:', err))
    }

    return NextResponse.json({ checkin }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/checkins]', err)
    const message = err instanceof Error ? err.message : 'Failed to save check-in'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
