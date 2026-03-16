import { createClient } from './server'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types'

/** A single habit check-in record — matches the `checkins` table exactly. */
export type Checkin = Tables<'checkins'>

type CreateCheckinInput = TablesInsert<'checkins'>
type UpdateCheckinInput = Pick<TablesUpdate<'checkins'>, 'completed' | 'notes'>

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
