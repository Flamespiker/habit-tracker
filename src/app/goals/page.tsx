import { redirect } from 'next/navigation'
import { GoalsClient } from "@/components/app/goals/GoalsClient"
import { getGoals, toGoal } from "@/lib/db/supabase/goals"
import { getHabits, toHabit } from "@/lib/db/supabase/habits"
import { createClient } from "@/lib/db/supabase/server"

/**
 * Goals list page. Fetches goals and habits server-side, delegates list state to GoalsClient.
 */
export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [goalRows, habitRows] = await Promise.all([
    getGoals(user.id, supabase),
    getHabits(user.id, supabase),
  ])

  return (
    <GoalsClient
      initialGoals={goalRows.map(toGoal)}
      habits={habitRows.map((row) => toHabit(row))}
    />
  )
}
