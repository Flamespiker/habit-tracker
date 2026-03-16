# Habit & Goal Tracker

Personal hobby app. Not commercial. Only user is me.

## Stack
- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS + shadcn/ui
- next-themes — light/dark/system theming
- Supabase — Postgres + Auth (structured data)
- MongoDB Atlas M0 — AI responses, coaching insights, user preferences (flexible data)
- Vercel (Hobby plan — personal use)
- Playwright (E2E tests)
- GitHub Actions + Claude Code Action (CI/CD + PR reviews)

## shadcn/ui Components (installed)
badge, button, card, dialog, dropdown-menu, input, label, progress, skeleton, sonner, table

## Folder Structure
src/app/ → Next.js pages and API routes
src/app/page.tsx → dashboard (route: /) — async Server Component; fetches habits from Supabase via getHabits()
src/app/loading.tsx → dashboard loading skeleton (stats cards, habit card grid, chart column)
src/app/habits/ → habits list — async Server Component fetching real data; delegates toggle state to HabitsClient + /[id]/page.tsx implemented (detail: metadata, streak, weekly grid)
src/app/habits/loading.tsx → habits page loading skeleton (header, grid of HabitCardSkeletons)
src/app/habits/new/page.tsx → stub (TODO: habit creation form; POST /api/habits, redirect to /habits/[id])
src/app/habits/[id]/edit/page.tsx → stub (TODO: pre-populated edit form; PATCH /api/habits/[id]; DELETE /api/habits/[id] with redirect to /habits)
src/app/goals/ → goals list — async Server Component fetching real data; delegates list state to GoalsClient + /[id]/page.tsx implemented (title, status badge, target date, description, linked habits with category badge + streak)
src/app/goals/loading.tsx → goals page loading skeleton (header, list of GoalCardSkeletons)
src/app/goals/new/page.tsx → stub (TODO: goal creation form; POST /api/goals, redirect to /goals/[id])
src/app/goals/[id]/edit/page.tsx → stub (TODO: pre-populated edit form; PATCH /api/goals/[id]; mark completed/abandoned; delete)
src/app/log/ → daily log implemented (habit check-in toggles with strikethrough, notes textarea, disabled submit until Stage 3)
src/app/settings/ → settings implemented (Profile: display name; Coaching Style: 3 selectable options; Notifications: time input — all saves disabled until Stage 3/4)
src/app/(auth)/ → login, signup
src/app/api/habits/route.ts → POST /api/habits (create habit, uses admin client, returns mapped Habit)
src/app/api/goals/route.ts → POST /api/goals (create goal + goal_habits rows, uses admin client, returns mapped Goal)
src/app/api/checkins/route.ts → POST /api/checkins (upsert checkin by habit_id + date, uses admin client)
src/components/ui/ → shadcn/ui (don't edit)
src/components/app/ → app components (see below)
src/components/app/Navigation.tsx → sticky site-wide nav bar (links to /, /habits, /goals, /log, /settings; active route highlighting; mobile hamburger menu)
src/components/app/theme-provider.tsx → next-themes provider (used in root layout)
src/components/app/theme-toggle.tsx → light/dark/system dropdown toggle
src/components/app/habit-dashboard.tsx → main dashboard (stats, habit list, weekly chart); accepts initialHabits: Habit[] prop from page.tsx
src/components/app/stats-card.tsx → single metric card (icon + value + subtitle)
src/components/app/category-filter.tsx → pill buttons to filter habits by category
src/components/app/weekly-chart.tsx → bar chart of completions over the last 7 days
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
src/lib/db/supabase/ → Supabase query functions: client.ts (browser), server.ts (SSR), admin.ts (service role — bypasses RLS, temp until Week 6), habits.ts (getHabits, createHabit, updateHabit, deleteHabit, toHabit), goals.ts (getGoals, createGoal, updateGoal, createGoalHabits, toGoal), checkins.ts (getTodayCheckins, getCheckins, createCheckin, upsertCheckin, updateCheckin)
src/lib/db/mongo/ → MongoDB query functions
src/lib/auth/ → auth helpers
middleware.ts → Supabase auth route protection
tests/ → Playwright tests
.github/workflows/ → CI/CD pipelines

## Skills
/habit-component <ComponentName> → scaffold a new component in src/components/app/habits/

## Theming
- ThemeProvider wraps the app in src/app/layout.tsx with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`
- `<html>` has `suppressHydrationWarning` to prevent next-themes hydration mismatch
- Components using `useTheme()` must be 'use client' and guard with a `mounted` state before rendering theme-dependent UI

## Habit Type Notes
- `completed_today`, `weekly_data`, and `streak` on `Habit` are UI-only — not stored in the `habits` table; computed from `checkins`. `completed_today` is now real (derived via `getTodayCheckins` + `toHabit(row, todayCheckins)`). `streak` and `weekly_data` still stubbed — TODO Week 6.
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

## Data Layer Conventions
- Client Components → fetch API route → lib/db/
- Server Components → call lib/db/ directly
- Until Week 6 auth: all lib/db/ callers pass `createAdminClient()` (bypasses RLS). Query functions accept an optional `client` param — pass admin client explicitly, falls back to server client when omitted.

## Server/Client Split Pattern
List pages with a creation dialog always split into two files:
1. `src/app/[route]/page.tsx` — async Server Component; fetches data with admin client, renders `<XxxClient initialItems={...} />`
2. `src/components/app/[domain]/XxxClient.tsx` — Client Component; holds `useState`, passes `onAdd={(item) => setItems(prev => [...prev, item])}` to the dialog
This is required because `async` server fetching and `useState` cannot coexist in one file.
Current examples: HabitsClient, GoalsClient, HabitDashboard (initialHabits prop).

## Commands
npm run dev → dev server
npm run build → production build
npx playwright test → E2E tests
npx tsc --noEmit → type check

---

