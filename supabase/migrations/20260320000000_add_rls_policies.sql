-- =============================================================================
-- Migration: add_rls_policies
-- Created:   2026-03-20
-- =============================================================================
-- Enables Row Level Security on all four application tables and adds
-- SELECT / INSERT / UPDATE / DELETE policies so that authenticated users
-- can only access their own data.
--
-- habits, goals, checkins: all have a user_id column — policies compare
-- directly against auth.uid().
--
-- goal_habits: has no user_id column (only goal_id + habit_id). Ownership
-- is established by checking that the referenced goal belongs to the
-- current user via a subquery on the goals table.
--
-- The anon role receives no policies on any table — unauthenticated
-- requests are blocked at the DB level regardless of app-layer auth checks.
--
-- Apply via: Supabase SQL editor, or `supabase db push` once the CLI is
-- configured for this project.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits: select own"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habits: insert own"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits: update own"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits: delete own"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals: select own"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "goals: insert own"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals: update own"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals: delete own"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- checkins
-- ---------------------------------------------------------------------------
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkins: select own"
  ON checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "checkins: insert own"
  ON checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins: update own"
  ON checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkins: delete own"
  ON checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- goal_habits (no user_id column — ownership checked via goals subquery)
-- ---------------------------------------------------------------------------
ALTER TABLE goal_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goal_habits: select own"
  ON goal_habits FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "goal_habits: insert own"
  ON goal_habits FOR INSERT
  TO authenticated
  WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "goal_habits: update own"
  ON goal_habits FOR UPDATE
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "goal_habits: delete own"
  ON goal_habits FOR DELETE
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE user_id = auth.uid()
    )
  );
