import { redirect } from 'next/navigation'
import { HabitsClient } from '@/components/app/habits/HabitsClient'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import { createClient } from '@/lib/db/supabase/server'

/**
 * Habits list page. Fetches habits and today's checkins server-side, passes them to HabitsClient.
 */
export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [habitRows, todayCheckins] = await Promise.all([
    getHabits(user.id, supabase),
    getTodayCheckins(user.id, today, supabase),
  ])

  const habits = habitRows.map((row) => toHabit(row, todayCheckins))

  return <HabitsClient initialHabits={habits} />
}
