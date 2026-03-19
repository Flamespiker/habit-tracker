import { NextResponse } from 'next/server'
import { createHabit, toHabit } from '@/lib/db/supabase/habits'
import { createClient } from '@/lib/db/supabase/server'

/**
 * POST /api/habits
 * Creates a new habit and returns the mapped Habit object.
 * Body: { name: string; category: string; frequency: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, frequency } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }
    if (!category || !frequency) {
      return NextResponse.json(
        { error: 'category and frequency are required' },
        { status: 400 }
      )
    }

    const row = await createHabit({
      name: name.trim(),
      category,
      frequency,
      user_id: user.id,
      target_days: [],
    }, supabase)

    return NextResponse.json({ habit: toHabit(row) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/habits]', err)
    const message = err instanceof Error ? err.message : 'Failed to create habit'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
