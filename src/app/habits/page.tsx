import { HabitsClient } from '@/components/app/habits/HabitsClient'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { createAdminClient } from '@/lib/db/supabase/admin'

/**
 * Habits list page. Fetches habits server-side and passes them to HabitsClient for toggle state.
 */
export default async function HabitsPage() {
  // TODO (Week 6): replace with authenticated user ID from session
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!
  // TODO (Week 6): replace admin client with authenticated server client once RLS is in place
  const rows = await getHabits(userId, createAdminClient())
  const habits = rows.map(toHabit)

  return <HabitsClient initialHabits={habits} />
}
