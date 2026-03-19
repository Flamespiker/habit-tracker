import { redirect } from 'next/navigation'
import { HabitDashboard } from '@/components/app/habit-dashboard'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getCheckinsForPeriod } from '@/lib/db/supabase/checkins'
import { createClient } from '@/lib/db/supabase/server'

/**
 * Dashboard page. Fetches habits and the last year of checkins server-side,
 * passes fully-derived Habit objects (streak, weekly_data, completed_today) to the client dashboard.
 */
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const todayDate = new Date()
  const today = todayDate.toISOString().split('T')[0]
  const oneYearAgo = new Date(todayDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [habitRows, checkins] = await Promise.all([
    getHabits(user.id, supabase),
    getCheckinsForPeriod(user.id, oneYearAgo, today, supabase),
  ])

  const habits = habitRows.map((row) => toHabit(row, checkins))

  return <HabitDashboard initialHabits={habits} />
}
