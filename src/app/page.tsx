import { HabitDashboard } from '@/components/app/habit-dashboard'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * Dashboard page. Fetches habits and today's checkins server-side, passes them to the client dashboard.
 */
export default async function Home() {
  // TODO (Week 6): replace with authenticated user ID from session
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!
  // TODO (Week 6): replace admin client with authenticated server client once RLS is in place
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  console.log('[page.tsx] TEST_USER_ID:', userId)

  const [habitRows, todayCheckins] = await Promise.all([
    getHabits(userId, supabase),
    getTodayCheckins(userId, today, supabase),
  ])

  console.log('[page.tsx] habits from getHabits():', habitRows)

  const habits = habitRows.map((row) => toHabit(row, todayCheckins))

  return <HabitDashboard initialHabits={habits} />
}
