import { NextResponse } from 'next/server'
import { createHabit, toHabit } from '@/lib/db/supabase/habits'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * POST /api/habits
 * Creates a new habit and returns the mapped Habit object.
 * Body: { name: string; category: string; frequency: string }
 */
export async function POST(request: Request) {
  try {
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

    // TODO (Week 6): replace with authenticated user ID from session
    const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!

    // TODO (Week 6): replace admin client with the authenticated server client once
    // RLS policies are in place — the admin client bypasses all row-level security.
    const supabase = createAdminClient()

    const row = await createHabit({
      name: name.trim(),
      category,
      frequency,
      user_id: userId,
      target_days: [],
    }, supabase)

    return NextResponse.json({ habit: toHabit(row) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/habits]', err)
    const message = err instanceof Error ? err.message : 'Failed to create habit'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
