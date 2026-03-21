# Habit & Goal Tracker

Personal hobby app. Not commercial. Only user is me.

## Stack
- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS + shadcn/ui
- next-themes — light/dark/system theming
- Supabase — Postgres + Auth (structured data)
- MongoDB Atlas M0 + Mongoose — AI responses, coaching insights, user preferences (flexible data)
- Vercel (Hobby plan — personal use)
- Playwright (E2E tests)
- GitHub Actions + Claude Code Action (CI/CD + PR reviews)

## shadcn/ui Components (installed)
badge, button, card, dialog, dropdown-menu, input, label, progress, skeleton, sonner, table

## Folder Structure
src/app/ → Next.js pages and API routes
src/app/layout.tsx → root layout — async Server Component; fetches session user via createClient() + getUser(), passes userEmail to Navigation
src/app/page.tsx → dashboard (route: /) — async Server Component; fetches habits + checkins (Supabase) and coaching history (MongoDB) in parallel via Promise.all; passes habits to HabitDashboard and 3 most recent coaching entries to DashboardCoachingPanel
src/app/loading.tsx → dashboard loading skeleton (stats cards, habit card grid, chart column)
src/app/habits/ → habits list — async Server Component fetching real data; delegates toggle state to HabitsClient + /[id]/page.tsx implemented (detail: metadata, streak, weekly grid; fetches real data via getHabitById + getCheckins in parallel; notFound() if habit missing or wrong user)
src/app/habits/loading.tsx → habits page loading skeleton (header, grid of HabitCardSkeletons)
src/app/habits/new/page.tsx → stub (TODO: habit creation form; POST /api/habits, redirect to /habits/[id])
src/app/habits/[id]/edit/page.tsx → stub (TODO: pre-populated edit form; PATCH /api/habits/[id]; DELETE /api/habits/[id] with redirect to /habits)
src/app/goals/ → goals list — async Server Component fetching real data; delegates list state to GoalsClient + /[id]/page.tsx implemented (title, status badge, target date, description, linked habits with category badge + streak)
src/app/goals/loading.tsx → goals page loading skeleton (header, list of GoalCardSkeletons)
src/app/goals/new/page.tsx → stub (TODO: goal creation form; POST /api/goals, redirect to /goals/[id])
src/app/goals/[id]/edit/page.tsx → stub (TODO: pre-populated edit form; PATCH /api/goals/[id]; mark completed/abandoned; delete)
src/app/log/ → daily log; habit check-in toggles with strikethrough, notes textarea; fetches GET /api/coaching?limit=1 on mount for historical nudge; "Log Day" button calls POST /api/ai with { journal_entry } — shows Loader2 spinner + "Generating nudge…" while waiting, displays returned nudge in "Coach's Note" card on success, shows error in text-destructive below button on failure
src/app/settings/ → settings page; Profile save disabled (Supabase not yet wired); Coaching Style auto-saves to MongoDB on click; Notifications saves to MongoDB on button click; preferences loaded from GET /api/preferences on mount
src/app/(auth)/login/page.tsx → login form (email + password); useActionState → signIn server action; links to /signup
src/app/(auth)/signup/page.tsx → sign-up form (email + password + confirm password); useActionState → signUp server action; links to /login
src/app/api/habits/route.ts → POST /api/habits (auth-gated: 401 if no session; creates habit for session user; returns mapped Habit)
src/app/api/goals/route.ts → POST /api/goals (auth-gated: 401 if no session; creates goal + goal_habits rows for session user; returns mapped Goal)
src/app/api/checkins/route.ts → POST /api/checkins (auth-gated: 401 if no session; upserts checkin by habit_id + date for session user; on completed=true fires a fire-and-forget placeholder daily_nudge write to MongoDB via saveCoachingResponse() — MongoDB failure never breaks the checkin response; real Claude call replaces placeholder in Phase 5)
src/app/api/preferences/route.ts → GET /api/preferences (returns MongoDB user preferences, falls back to schema defaults); PATCH /api/preferences (upserts coaching_style and/or notification_time; validates each field)
src/app/api/coaching/route.ts → GET /api/coaching (returns coaching history from MongoDB via getCoachingHistory(); accepts optional ?limit=N param, default 20, clamped 1–100); POST /api/coaching (saves a new coaching response via saveCoachingResponse(); body: { type, content, model, habit_context? }; validates type enum + required fields; returns 201)
src/app/api/ai/route.ts → POST /api/ai (auth-gated; fetches habits + today's checkins (Supabase) + user preferences (MongoDB) in parallel; loads daily-coaching-nudge prompt via loadPrompt(); calls Anthropic SDK (model from YAML); saves result to MongoDB via saveCoachingResponse(); returns { nudge: string }; @anthropic-ai/sdk installed)
src/app/api/health/route.ts → GET /api/health (checks Supabase + MongoDB connectivity in parallel; returns { supabase, mongodb, timestamp } with 200 if all ok, 503 if any fail)
src/components/ui/ → shadcn/ui (don't edit)
src/components/app/ → app components (see below)
src/components/app/Navigation.tsx → sticky site-wide nav bar; accepts `userEmail: string | null` prop from layout; shows truncated email + sign-out button (desktop: after ThemeToggle; mobile: bottom of dropdown); sign-out calls the `signOut` server action via `<form action={signOut}>`
src/components/app/theme-provider.tsx → next-themes provider (used in root layout)
src/components/app/theme-toggle.tsx → light/dark/system dropdown toggle
src/components/app/habit-dashboard.tsx → main dashboard (stats, habit list, weekly chart); accepts initialHabits: Habit[] prop from page.tsx; computes weeklyData (Mon–Sun of current UTC week mapped from habits' rolling weekly_data) and todayIndex (0=Mon…6=Sun) passed to WeeklyChart
src/components/app/DashboardCoachingPanel.tsx → Server Component; accepts entries: IAiCoaching[]; displays up to 3 most recent coaching entries — type label, truncated content preview (100 chars), relative date; shows "Coaching nudge pending" for null or placeholder content; data verification component, not final UI
src/components/app/stats-card.tsx → single metric card (icon + value + subtitle)
src/components/app/category-filter.tsx → pill buttons to filter habits by category
src/components/app/weekly-chart.tsx → bar chart of Mon–Sun completions for the current week; accepts `data: number[]` (Mon–Sun counts) and `todayIndex: number`; today's bar is full primary, others are primary/40; today's label shows "Today"
src/components/app/habits/HabitCard.tsx → card showing name (links to /habits/[id]), category badge, streak, progress bar, check-in toggle
src/components/app/habits/HabitCardSkeleton.tsx → loading skeleton matching HabitCard shape
src/components/app/habits/HabitsClient.tsx → Client Component managing toggle state; receives initialHabits from the Server Component page
src/components/app/habits/NewHabitDialog.tsx → trigger button + dialog form; POSTs to /api/habits and calls onAdd(habit) on success
src/components/app/goals/GoalsClient.tsx → Client Component managing goals state; receives initialGoals + habits from the Server Component page; wires onAdd to NewGoalDialog
src/components/app/goals/GoalCardSkeleton.tsx → loading skeleton matching goal row shape (title, linked habits, status badge, date)
src/components/app/goals/NewGoalDialog.tsx → trigger button + dialog form; POSTs to /api/goals and calls onAdd(goal) on success
src/lib/types/ → shared TypeScript types (Habit, Category, categoryColors, categoryLabels, Goal, GoalStatus) + database.types.ts (Supabase-generated; Tables<T>, TablesInsert<T>, TablesUpdate<T>)
src/lib/mock-data.ts → mock habits + goals for Stage 2 UI (replace with API calls in Stage 3)
src/lib/data.ts → re-export shim for mock-data.ts (backward compat)
src/lib/db/supabase/ → Supabase query functions: client.ts (browser), server.ts (SSR), admin.ts (service role — bypasses RLS; only used by health check, not app routes), habits.ts (getHabits, getHabitById, createHabit, updateHabit, deleteHabit, toHabit), goals.ts (getGoals, createGoal, updateGoal, createGoalHabits, toGoal), checkins.ts (getTodayCheckins, getCheckins, createCheckin, upsertCheckin, getCheckinsForPeriod, updateCheckin)
supabase/migrations/20260320000000_add_rls_policies.sql → enables RLS on habits, goals, checkins, goal_habits; adds SELECT/INSERT/UPDATE/DELETE policies scoped to auth.uid() = user_id for habits/goals/checkins; goal_habits policies check ownership via goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()); apply via Supabase SQL editor or supabase db push
src/lib/db/mongo/client.ts → cached Mongoose connection via `connectToMongoDB()`; caches on `global._mongooseCache` so the connection survives Next.js hot reloads and is reused across serverless invocations; reads MONGODB_URI env var
src/lib/db/mongo/models/AiCoaching.ts → Mongoose model for `ai_coaching` collection; fields: user_id, type (daily_nudge|weekly_summary|suggestion), habit_context (Mixed), content (Mixed), created_at, model
src/lib/db/mongo/models/UserPreferences.ts → Mongoose model for `user_preferences` collection; fields: user_id (unique), coaching_style (motivational|analytical|gentle), notification_time, focus_areas (string[]), custom_settings (Mixed)
src/lib/db/mongo/ai-coaching.ts → getCoachingHistory(userId, limit?), saveCoachingResponse(data)
src/lib/db/mongo/user-preferences.ts → getUserPreferences(userId), saveUserPreferences(userId, prefs) — upserts on user_id
src/lib/ai/prompts.ts → loadPrompt(name, variables): reads a YAML file from .claude/prompts/, parses it, interpolates {{variable}} placeholders, returns { model, system, user }
.claude/prompts/ → YAML prompt files: daily-coaching-nudge.yaml, weekly-summary.yaml, habit-suggestion.yaml, goal-adjustment.yaml — each has name, description, version, model, system, and user_template fields
src/lib/auth/actions.ts → Server Actions: signIn(prevState, formData), signUp(prevState, formData), signOut(); all use createClient() from server.ts
src/proxy.ts → Next.js 15 proxy convention (replaces middleware.ts); refreshes Supabase session on every request; redirects unauthenticated users to /login; redirects authenticated users away from /login and /signup
tests/ → Playwright tests
.github/workflows/ → CI/CD pipelines

## Skills
/habit-component <ComponentName> → scaffold a new component in src/components/app/habits/

## Theming
- ThemeProvider wraps the app in src/app/layout.tsx with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`
- `<html>` has `suppressHydrationWarning` to prevent next-themes hydration mismatch
- Components using `useTheme()` must be 'use client' and guard with a `mounted` state before rendering theme-dependent UI

## Habit Type Notes
- `completed_today`, `weekly_data`, and `streak` on `Habit` are UI-only — not stored in the `habits` table; all three are derived in `toHabit(row, checkins)` from a flat `CheckinRecord[]` array.
- `streak` = consecutive completed days counting back from today (UTC); if today is incomplete the count starts from yesterday so the streak isn't prematurely broken.
- `weekly_data` = 7-element array, index 0 = 6 days ago, index 6 = today; 1 if completed, 0 if not. Dates computed in UTC — TODO: format to local timezone when displayed on the client.
- Pages fetch the last 365 days of checkins via `getCheckinsForPeriod(userId, oneYearAgo, today)` in a single query and pass the result to every `toHabit()` call. New habits created via POST /api/habits pass `[]`.
- `Habit.target_days` is a `number` (count); the DB column `target_days` is `number[]` (day-of-week indices) — use `toHabit()` to map between them
- Habit components take `habit: Habit` (full object) + `onToggle: (id: string) => void` — never individual fields
- `toggleHabit` pattern: optimistic state update first (UI responds immediately), then fire `POST /api/checkins`. Errors logged but don't revert — page refresh re-syncs from DB. Date is always UTC: `new Date().toISOString().split('T')[0]`

## Goal Type Notes
- `GoalStatus` = `"active" | "completed" | "abandoned"` — "paused" is not a valid value
- `habit_ids: string[]` on `Goal` is UI-only — not stored in the `goals` table; derived from the `goal_habits` join table
- `habit_ids: []` means a standalone goal with no linked habits
- `description` on `Goal` is not in the DB schema — `toGoal()` stubs it to `null`; `status` is `string` in DB, cast to `GoalStatus` in `toGoal()`

## Conventions
- TypeScript strictly — no `any` types
- Server Components by default — Client only when needed
- When adding 'use client', put a comment on the line above explaining why
- Named export + default export on every component
- JSDoc on every exported component
- shadcn Select is NOT installed — use native `<select>` with Tailwind classes that mirror the `Input` component styling
- shadcn Textarea is NOT installed — use native `<textarea>` with the same Tailwind classes as `Input`, plus `resize-none` and `min-h-[...]`
- Dynamic route pages call `notFound()` from `next/navigation` for unknown IDs (typed `never`, so TypeScript narrows correctly)
- DB queries ONLY in src/lib/db/ — never inline in components
- Auth logic ONLY in src/lib/auth/
- Supabase = relational data | MongoDB = AI/flexible data
- To call a server action from a Client Component, use `<form action={serverAction}>` — do NOT wrap in useCallback or call imperatively unless you need useActionState for error feedback

## Data Layer Conventions
- Client Components → fetch API route → lib/db/
- Server Components → call lib/db/ directly, using `createClient()` from server.ts
- API routes: call `createClient()` → `supabase.auth.getUser()` → return 401 if no user → pass `supabase` to query functions
- Server Component pages: call `createClient()` → `getUser()` → `redirect('/login')` if no user → pass `supabase` to query functions
- Query functions accept an optional `client` param — always pass the authenticated server client explicitly; falls back to a fresh server client when omitted

## Server/Client Split Pattern
List pages with a creation dialog always split into two files:
1. `src/app/[route]/page.tsx` — async Server Component; calls `createClient()` + `getUser()`, fetches data, renders `<XxxClient initialItems={...} />`
2. `src/components/app/[domain]/XxxClient.tsx` — Client Component; holds `useState`, passes `onAdd={(item) => setItems(prev => [...prev, item])}` to the dialog
This is required because `async` server fetching and `useState` cannot coexist in one file.
Current examples: HabitsClient, GoalsClient, HabitDashboard (initialHabits prop).

## Commands
npm run dev → dev server
npm run build → production build
npx playwright test → E2E tests
npx tsc --noEmit → type check

---

