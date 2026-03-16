import { GoalsClient } from "@/components/app/goals/GoalsClient"
import { getGoals, toGoal } from "@/lib/db/supabase/goals"
import { getHabits, toHabit } from "@/lib/db/supabase/habits"
import { createAdminClient } from "@/lib/db/supabase/admin"

/**
 * Goals list page. Fetches goals and habits server-side, delegates list state to GoalsClient.
 */
export default async function GoalsPage() {
  // TODO (Week 6): replace with authenticated user ID from session
  const userId = process.env.NEXT_PUBLIC_TEST_USER_ID!
  // TODO (Week 6): replace admin client with authenticated server client once RLS is in place
  const supabase = createAdminClient()

  const [goalRows, habitRows] = await Promise.all([
    getGoals(userId, supabase),
    getHabits(userId, supabase),
  ])

  return (
    <GoalsClient
      initialGoals={goalRows.map(toGoal)}
      habits={habitRows.map(toHabit)}
    />
  )
}
