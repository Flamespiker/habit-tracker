import { NextResponse } from 'next/server'
import { upsertCheckin } from '@/lib/db/supabase/checkins'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * POST /api/checkins
 * Creates or updates a check-in for a habit on a given date.
 * Body: { habit_id: string; date: string; completed: boolean }
 */
export async function POST(request: Request) {
  try {
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

    // TODO (Week 6): replace with authenticated user ID from session
    const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!

    // TODO (Week 6): replace admin client with the authenticated server client once
    // RLS policies are in place — the admin client bypasses all row-level security.
    const supabase = createAdminClient()

    const checkin = await upsertCheckin({ habit_id, date, completed, user_id: userId }, supabase)

    return NextResponse.json({ checkin }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/checkins]', err)
    const message = err instanceof Error ? err.message : 'Failed to save check-in'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
