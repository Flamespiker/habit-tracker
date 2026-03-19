import { redirect } from 'next/navigation'
import { GoalsClient } from "@/components/app/goals/GoalsClient"
import { getGoals, toGoal } from "@/lib/db/supabase/goals"
import { getHabits, toHabit } from "@/lib/db/supabase/habits"
import { getCheckinsForPeriod } from "@/lib/db/supabase/checkins"
import { createClient } from "@/lib/db/supabase/server"

/**
 * Goals list page. Fetches goals, habits, and the last year of checkins server-side,
 * delegates list state to GoalsClient.
 */
export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [goalRows, habitRows, checkins] = await Promise.all([
    getGoals(user.id, supabase),
    getHabits(user.id, supabase),
    getCheckinsForPeriod(user.id, oneYearAgo, today, supabase),
  ])

  return (
    <GoalsClient
      initialGoals={goalRows.map(toGoal)}
      habits={habitRows.map((row) => toHabit(row, checkins))}
    />
  )
}
