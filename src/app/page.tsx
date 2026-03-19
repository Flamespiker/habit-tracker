import { redirect } from 'next/navigation'
import { HabitDashboard } from '@/components/app/habit-dashboard'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { createClient } from '@/lib/db/supabase/server'

/**
 * Dashboard page. Fetches habits and today's checkins server-side, passes them to the client dashboard.
 */
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [habitRows, todayCheckins] = await Promise.all([
    getHabits(user.id, supabase),
    getTodayCheckins(user.id, today, supabase),
  ])

  const habits = habitRows.map((row) => toHabit(row, todayCheckins))

  return <HabitDashboard initialHabits={habits} />
}
