import { HabitsClient } from '@/components/app/habits/HabitsClient'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * Habits list page. Fetches habits and today's checkins server-side, passes them to HabitsClient.
 */
export default async function HabitsPage() {
  // TODO (Week 6): replace with authenticated user ID from session
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!
  // TODO (Week 6): replace admin client with authenticated server client once RLS is in place
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [habitRows, todayCheckins] = await Promise.all([
    getHabits(userId, supabase),
    getTodayCheckins(userId, today, supabase),
  ])

  const habits = habitRows.map((row) => toHabit(row, todayCheckins))

  return <HabitsClient initialHabits={habits} />
}
