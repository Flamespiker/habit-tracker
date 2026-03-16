import { createClient } from './server'

/** A single habit check-in record. Mirrors the `checkins` table in Supabase. */
export interface Checkin {
  id: string
  habit_id: string
  user_id: string
  /** ISO date string: YYYY-MM-DD */
  date: string
  completed: boolean
  notes: string | null
  created_at: string
}

type CreateCheckinInput = Omit<Checkin, 'id' | 'created_at'>
type UpdateCheckinInput = Partial<Pick<Checkin, 'completed' | 'notes'>>

/**
 * Fetches check-ins for a habit within an inclusive date range.
 * Dates must be ISO date strings (YYYY-MM-DD).
 */
export async function getCheckins(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<Checkin[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Inserts a new check-in and returns the created row.
 */
export async function createCheckin(checkin: CreateCheckinInput): Promise<Checkin> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .insert(checkin)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates `completed` or `notes` on an existing check-in and returns the updated row.
 */
export async function updateCheckin(id: string, updates: UpdateCheckinInput): Promise<Checkin> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
