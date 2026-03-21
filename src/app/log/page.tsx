import { redirect } from 'next/navigation'
import { createClient } from '@/lib/db/supabase/server'
import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getTodayCheckins } from '@/lib/db/supabase/checkins'
import LogClient from '@/components/app/log/LogClient'

/**
 * Daily log page — Server Component wrapper.
 * Fetches today's habits with completion state from Supabase and passes them to LogClient.
 */
export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const [habitRows, checkins] = await Promise.all([
    getHabits(user.id, supabase),
    getTodayCheckins(user.id, today, supabase),
  ])

  const habits = habitRows.map((row) => toHabit(row, checkins))

  return <LogClient initialHabits={habits} />
}
