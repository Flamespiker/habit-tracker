-- Migration: add query-path indexes
-- Generated: 2026-04-08
--
-- Covers every column used in .eq() / .gte() / .lte() / .order() in
-- src/lib/db/supabase/{habits,goals,checkins}.ts that is not a PK
-- and has no existing index.
--
-- Apply via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------

-- getHabits: WHERE user_id = ? ORDER BY created_at ASC
-- Composite index lets Postgres satisfy both the filter and the sort in one scan.
CREATE INDEX IF NOT EXISTS habits_user_id_created_at_idx
  ON habits (user_id, created_at ASC);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------

-- getGoals: WHERE user_id = ? ORDER BY created_at ASC
CREATE INDEX IF NOT EXISTS goals_user_id_created_at_idx
  ON goals (user_id, created_at ASC);

-- ---------------------------------------------------------------------------
-- goal_habits
-- ---------------------------------------------------------------------------

-- getGoalHabitIds: WHERE goal_id = ?
-- Postgres does NOT auto-index foreign key columns; without this every goal
-- detail page does a full table scan on goal_habits.
CREATE INDEX IF NOT EXISTS goal_habits_goal_id_idx
  ON goal_habits (goal_id);

-- ---------------------------------------------------------------------------
-- checkins
-- ---------------------------------------------------------------------------

-- getTodayCheckins:    WHERE user_id = ? AND date = ?
-- getCheckinsForPeriod: WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date
-- Composite covers both queries with user_id as the selective leading column.
CREATE INDEX IF NOT EXISTS checkins_user_id_date_idx
  ON checkins (user_id, date);

-- getCheckins: WHERE user_id = ? AND habit_id = ? AND date >= ? AND date <= ? ORDER BY date
-- Three-column composite. The existing UNIQUE(habit_id, date) index does not help here
-- because user_id is absent from it, so Postgres cannot verify ownership without a heap fetch.
CREATE INDEX IF NOT EXISTS checkins_user_id_habit_id_date_idx
  ON checkins (user_id, habit_id, date);
