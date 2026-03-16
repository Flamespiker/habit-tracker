import { HabitDashboard } from '@/components/app/habit-dashboard'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * Dashboard page. Fetches habits server-side and passes them to the client dashboard.
 */
export default async function Home() {
  // TODO (Week 6): replace with authenticated user ID from session
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!
  // TODO (Week 6): replace admin client with authenticated server client once RLS is in place
  const rows = await getHabits(userId, createAdminClient())
  console.log('[page.tsx] TEST_USER_ID:', userId)
  console.log('[page.tsx] habits from getHabits():', rows)
  const habits = rows.map(toHabit)

  return <HabitDashboard initialHabits={habits} />
}
