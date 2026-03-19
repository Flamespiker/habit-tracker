import { redirect } from 'next/navigation'
import { HabitsClient } from '@/components/app/habits/HabitsClient'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getCheckinsForPeriod } from '@/lib/db/supabase/checkins'
import { createClient } from '@/lib/db/supabase/server'

/**
 * Habits list page. Fetches habits and the last year of checkins server-side,
 * passes fully-derived Habit objects (streak, weekly_data, completed_today) to HabitsClient.
 */
export default async function HabitsPage() {
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

  return <HabitsClient initialHabits={habits} />
}
