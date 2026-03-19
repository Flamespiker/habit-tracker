import { createClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types'
import type { Database } from '@/lib/types/database.types'

type Client = SupabaseClient<Database>

/** A single habit check-in record — matches the `checkins` table exactly. */
export type Checkin = Tables<'checkins'>

type CreateCheckinInput = TablesInsert<'checkins'>
type UpdateCheckinInput = Pick<TablesUpdate<'checkins'>, 'completed' | 'notes'>

/** Input for upsert — required fields only; no id or created_at. */
type UpsertCheckinInput = {
  habit_id: string
  date: string
  completed: boolean
  user_id: string
}

/**
 * Fetches all check-ins for a user on a specific date.
 * Used to derive completed_today for all habits in a single query.
 */
export async function getTodayCheckins(
  userId: string,
  date: string,
  client?: Client
): Promise<Checkin[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw error
  return data
}

/**
 * Fetches check-ins for a habit within an inclusive date range.
 * Dates must be ISO date strings (YYYY-MM-DD).
 */
export async function getCheckins(
  habitId: string,
  startDate: string,
  endDate: string,
  client?: Client
): Promise<Checkin[]> {
  const supabase = client ?? await createClient()
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
export async function createCheckin(checkin: CreateCheckinInput, client?: Client): Promise<Checkin> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .insert(checkin)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Upserts a check-in for a given habit and date.
 * Inserts if no row exists for (habit_id, date); updates completed otherwise.
 * Requires a unique constraint on (habit_id, date) in the DB.
 */
export async function upsertCheckin(checkin: UpsertCheckinInput, client?: Client): Promise<Checkin> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .upsert(checkin, { onConflict: 'habit_id,date' })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches all check-ins for a user within an inclusive date range.
 * Use this to derive streak and weekly_data for all habits in a single query.
 * Dates must be ISO date strings (YYYY-MM-DD).
 */
export async function getCheckinsForPeriod(
  userId: string,
  startDate: string,
  endDate: string,
  client?: Client
): Promise<Checkin[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Updates `completed` or `notes` on an existing check-in and returns the updated row.
 */
export async function updateCheckin(id: string, updates: UpdateCheckinInput, client?: Client): Promise<Checkin> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('checkins')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
