import { createClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types'
import type { Database } from '@/lib/types/database.types'
import type { Goal, GoalStatus } from '@/lib/types'

type Client = SupabaseClient<Database>

/** DB-level goal row — matches the `goals` table exactly. */
export type GoalRow = Tables<'goals'>

type CreateGoalInput = TablesInsert<'goals'>
type UpdateGoalInput = Omit<TablesUpdate<'goals'>, 'id' | 'user_id' | 'created_at'>

/**
 * Maps a DB goal row to the app-level Goal type.
 * `description` is not in the DB schema — stubbed to null.
 * `habit_ids` is UI-only, derived from the `goal_habits` join table — stubbed to [].
 */
export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: null,
    target_date: row.target_date,
    status: row.status as GoalStatus,
    created_at: row.created_at,
    habit_ids: [],
  }
}

/**
 * Fetches all goals for a given user, ordered by creation date.
 * Returns DB rows — callers must merge `habit_ids` from the `goal_habits` join table.
 * Pass `client` to override the default server client (e.g. the admin client in Server Components).
 */
export async function getGoals(userId: string, client?: Client): Promise<GoalRow[]> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Inserts a new goal and returns the created row.
 * Pass `client` to override the default server client (e.g. the admin client in API routes).
 */
export async function createGoal(goal: CreateGoalInput, client?: Client): Promise<GoalRow> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Inserts rows into the `goal_habits` join table to link habits to a goal.
 * Pass `client` to override the default server client.
 */
export async function createGoalHabits(
  goalId: string,
  habitIds: string[],
  client?: Client
): Promise<void> {
  if (habitIds.length === 0) return
  const supabase = client ?? await createClient()
  const { error } = await supabase
    .from('goal_habits')
    .insert(habitIds.map((habitId) => ({ goal_id: goalId, habit_id: habitId })))

  if (error) throw error
}

/**
 * Updates fields on an existing goal and returns the updated row.
 * Pass `client` to override the default server client.
 */
export async function updateGoal(id: string, updates: UpdateGoalInput, client?: Client): Promise<GoalRow> {
  const supabase = client ?? await createClient()
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
