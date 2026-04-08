Product Requirements Document — Habit & Goal Tracker

Last updated: 2026-03-22 | Status: In development | Owner: Personal / solo use

---

Problem Statement

Building and sustaining habits is hard without visibility into progress and accountability. Generic habit apps are
bloated, have poor data ownership, or lack meaningful AI-driven insight. This app is a personal tool for tracking
daily habits, setting goals, logging mood and activity, and receiving AI coaching — built and owned by the developer.

---

User Stories

Habits

- As a user, I want to create habits with a name, frequency, and category so I can define what I want to track.
- As a user, I want to see all my active habits in one place so I can know what's on my plate.
- As a user, I want to view a habit's streak and completion calendar so I can see patterns over time.
- As a user, I want to archive habits I'm no longer tracking without losing their history.

Goals

- As a user, I want to create goals with a target date and link them to habits so I can tie daily actions to outcomes.
- As a user, I want to see progress toward each goal so I know if I'm on track.

Daily Log

- As a user, I want to check off today's habits in one place so the logging friction is low.
- As a user, I want to record a mood score and a journal note per day so I can track how I feel.
- As a user, I want AI coaching insights generated after I log so I can reflect on patterns.

Settings & Account

- As a user, I want to toggle light/dark theme and set notification preferences.
- As a user, I want to export my data and delete my account.

---

Core Features

0. Dashboard

- Overview of today's habits, stats (total habits, completed today, streak), and weekly activity chart
- Fetches habits + checkins (Supabase) and coaching history (MongoDB) in parallel via Promise.all
- Displays 3 most recent coaching entries via DashboardCoachingPanel; weekly_summary entries render as overview + highlights preview; daily_nudge/suggestion render as truncated text
- "Get nudge" button in sidebar streams a daily coaching nudge inline via POST /api/ai (flushSync + rAF pattern)
- Route: /

1. Habit Management

- Create / edit / archive habits
- Fields: name, frequency (daily / weekly / custom), category, target_days
- Routes: /habits, /habits/new, /habits/[id], /habits/[id]/edit

2. Goal Management

- Create / edit goals with target date and success criteria
- Link multiple habits to a goal
- Progress calculated from linked habit completion rates
- Routes: /goals, /goals/new, /goals/[id], /goals/[id]/edit

3. Daily Log / Check-in

- Checklist of today's habits — mark complete / incomplete
- Mood score input + free-text journal entry
- Displays most recent coaching nudge or weekly summary ("Coach's Note" / "Weekly Summary" card) fetched from GET /api/coaching on page load; weekly_summary entries render as structured sections (overview, highlights, struggles, recommendation)
- "Log Day" button: POST /api/ai → streams daily coaching nudge inline
- "Generate weekly summary" button: POST /api/weekly-summary → LangGraph agent fetches 7-day habit data + coaching history, generates structured WeeklySummaryContent, saves to MongoDB; coaching card refreshes automatically on completion
- Route: /log

4. AI Coaching

- Insights stored in MongoDB (flexible schema); types: daily_nudge, weekly_summary, suggestion
- Retrieved via GET /api/coaching; saved via POST /api/coaching
- Daily nudge: streamed via POST /api/ai (Vercel AI SDK v6 streamText + @ai-sdk/anthropic); surfaced on daily log and dashboard
- Weekly summary: LangGraph ReAct agent (src/lib/ai/weekly-summary-agent.ts) via POST /api/weekly-summary; structured WeeklySummaryContent (overview, highlights, struggles, recommendation)
- Support agent: LangGraph ReAct agent (src/lib/ai/support-agent.ts) via POST /api/support; answers questions about the app using getAppHelp, getUserHabits, and getCoachingHistory tools; returns plain text
- Support chat UI: floating widget (src/components/app/support-chat.tsx) fixed bottom-right on every page via root layout; chat bubble conversation history; hidden on login/signup
- Powered by Claude (claude-sonnet-4-6) via @langchain/anthropic (agents) and @ai-sdk/anthropic (streaming nudge)

5. Auth

- Supabase Auth (email/password)
- Protected routes via src/middleware.ts (Next.js middleware — refreshes Supabase session tokens on every request)
- Sign-out button + truncated email in Navigation (visible when authenticated)
- Routes: /(auth)/login, /(auth)/signup

6. Settings

- Profile: display name, avatar (Supabase)
- Preferences: theme, coaching style (motivational / analytical / gentle), notification time (MongoDB)
- Data export + account deletion
- Route: /settings

---

Technical Constraints

┌───────────────────────┬───────────────────────────────────────────────────────────────────────┐
│ Constraint │ Detail │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Hosting │ Vercel Hobby — no long-running processes, 10s serverless timeout │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Database (relational) │ Supabase Postgres — habits, goals, logs, users │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Database (flexible) │ MongoDB Atlas M0 — free tier, AI responses, preferences │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Auth │ Supabase Auth only — no third-party OAuth required │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Frontend │ Next.js App Router, Server Components by default │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Styling │ Tailwind CSS + shadcn/ui only — no other component libraries │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Types │ TypeScript strict mode, no any │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ DB access │ All queries in src/lib/db/ — never inline in components or API routes │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Tests │ Playwright E2E only — no unit test framework currently │
├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Budget │ $0 — all free tiers │
└───────────────────────┴───────────────────────────────────────────────────────────────────────┘

---

Success Metrics

Since this is a personal tool, success is measured by usefulness and completion:

┌─────────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Metric │ Target │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Daily log completion │ Able to complete a full daily check-in end-to-end │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Streak accuracy │ Streaks reflect actual completion history correctly │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ AI insights │ At least one meaningful insight generated per log submission │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Page load (habits list) │ < 1s on Vercel (Server Component, no client waterfall) │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ Build passing │ npm run build and npx tsc --noEmit always green │
├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ E2E coverage │ Core flows (login, create habit, log day) covered by Playwright │
└─────────────────────────┴─────────────────────────────────────────────────────────────────┘

---

Out of Scope

- Multi-user / social features
- Native mobile app
- Push notifications (beyond browser)
- Offline mode
- Paid features or monetization

---

## Data Model

### Supabase (Postgres)

**`users`** — managed by Supabase Auth; extended with profile fields

| Field          | Type           | Description                 |
| -------------- | -------------- | --------------------------- |
| `id`           | `uuid` PK      | Supabase Auth user ID       |
| `display_name` | `text`         | User's chosen display name  |
| `avatar_url`   | `text \| null` | URL to profile avatar image |
| `created_at`   | `timestamptz`  | Account creation timestamp  |

---

**`habits`** — one row per habit per user

| Field         | Type              | Description                                                                     |
| ------------- | ----------------- | ------------------------------------------------------------------------------- |
| `id`          | `uuid` PK         | Unique habit ID                                                                 |
| `user_id`     | `uuid` FK → users | Owner of the habit                                                              |
| `name`        | `text`            | Display name of the habit                                                       |
| `frequency`   | `text`            | `daily`, `weekly`, or `custom`                                                  |
| `category`    | `text`            | Habit category (`fitness`, `health`, `mindfulness`, `productivity`, `learning`) |
| `target_days` | `int[]`           | Target days of the week to complete this habit                                  |
| `archived`    | `bool`            | Whether the habit is archived (hidden from active list)                         |
| `created_at`  | `timestamptz`     | When the habit was created                                                      |

> **UI-only fields** (not stored in `habits`): `completed_today` (derived from today's `checkins` row) and `weekly_data` (derived from the last 7 `checkins` rows). These exist on the `Habit` TypeScript type for convenience but are never written to this table.

---

**`goals`** — one row per goal per user

| Field         | Type              | Description                            |
| ------------- | ----------------- | -------------------------------------- |
| `id`          | `uuid` PK         | Unique goal ID                         |
| `user_id`     | `uuid` FK → users | Owner of the goal                      |
| `title`       | `text`            | Short goal title                       |
| `description` | `text \| null`    | Longer description or success criteria |
| `target_date` | `date \| null`    | Target completion date                 |
| `status`      | `text`            | `active`, `completed`, or `abandoned`  |
| `created_at`  | `timestamptz`     | When the goal was created              |

---

**`goal_habits`** — join table linking goals to habits (many-to-many)

| Field      | Type               | Description      |
| ---------- | ------------------ | ---------------- |
| `goal_id`  | `uuid` FK → goals  | The goal         |
| `habit_id` | `uuid` FK → habits | The linked habit |

---

**`checkins`** — one row per habit per day per user

| Field        | Type               | Description                              |
| ------------ | ------------------ | ---------------------------------------- |
| `id`         | `uuid` PK          | Unique check-in ID                       |
| `user_id`    | `uuid` FK → users  | Owner of the check-in                    |
| `habit_id`   | `uuid` FK → habits | Which habit was logged                   |
| `date`       | `date`             | The calendar date of the check-in        |
| `completed`  | `bool`             | Whether the habit was completed that day |
| `notes`      | `text \| null`     | Optional per-habit note                  |
| `created_at` | `timestamptz`      | When the record was created              |

---

**`daily_logs`** — one row per day per user (mood + journal)

| Field        | Type              | Description                         |
| ------------ | ----------------- | ----------------------------------- |
| `id`         | `uuid` PK         | Unique log ID                       |
| `user_id`    | `uuid` FK → users | Owner of the log                    |
| `date`       | `date`            | The calendar date (unique per user) |
| `mood_score` | `int \| null`     | Mood rating 1–10                    |
| `journal`    | `text \| null`    | Free-text journal entry for the day |
| `created_at` | `timestamptz`     | When the log was submitted          |

---

### MongoDB (Atlas M0)

**`ai_coaching`** — one document per AI insight generated

| Field           | Type       | Description                                                     |
| --------------- | ---------- | --------------------------------------------------------------- |
| `_id`           | `ObjectId` | MongoDB document ID                                             |
| `user_id`       | `string`   | Supabase user UUID (indexed)                                    |
| `type`          | `string`   | `daily_nudge`, `weekly_summary`, or `suggestion`                |
| `habit_context` | `Mixed`    | Snapshot of habit data sent to the model — shape varies by type |
| `content`       | `Mixed`    | The generated coaching output — shape varies by type            |
| `model`         | `string`   | Claude model used (e.g. `claude-sonnet-4-6`)                    |
| `created_at`    | `Date`     | When the insight was generated                                  |

---

**`user_preferences`** — one document per user

| Field               | Type       | Description                                                        |
| ------------------- | ---------- | ------------------------------------------------------------------ |
| `_id`               | `ObjectId` | MongoDB document ID                                                |
| `user_id`           | `string`   | Supabase user UUID (unique index)                                  |
| `coaching_style`    | `string`   | `motivational`, `analytical`, or `gentle` — default `motivational` |
| `notification_time` | `string`   | Time to send daily nudge, e.g. `"08:00"` — default `"08:00"`       |
| `focus_areas`       | `string[]` | Habit categories or topics the user wants to focus on              |
| `custom_settings`   | `Mixed`    | Catch-all for future preference fields without schema migrations   |

---

## API Routes

Auth is handled entirely by Supabase — no custom auth routes needed.
All routes require an authenticated session. User ID is always read server-side from the session, never from the request body.
Exception: `/api/internal/*` routes use a shared secret (`INTERNAL_API_SECRET`) instead of a Supabase session, and resolve the user via `INTERNAL_USER_ID` — intended for server-to-server calls from automation tools (e.g. n8n).

### Habits

| Method   | Path               | What it does                                          | DB       |
| -------- | ------------------ | ----------------------------------------------------- | -------- |
| `GET`    | `/api/habits`      | List all habits for the current user                  | Supabase |
| `POST`   | `/api/habits`      | Create a new habit                                    | Supabase |
| `GET`    | `/api/habits/[id]` | Get a single habit with its completion history        | Supabase |
| `PATCH`  | `/api/habits/[id]` | Update habit fields (name, frequency, archived, etc.) | Supabase |
| `DELETE` | `/api/habits/[id]` | Delete a habit and its checkins                       | Supabase |

### Goals

| Method   | Path              | What it does                                         | DB                 |
| -------- | ----------------- | ---------------------------------------------------- | ------------------ |
| `GET`    | `/api/goals`      | List all goals for the current user                  | Supabase           |
| `POST`   | `/api/goals`      | Create a new goal and link habits via `goal_habits`  | Supabase           |
| `GET`    | `/api/goals/[id]` | Get a single goal with linked habits and AI insights | Supabase + MongoDB |
| `PATCH`  | `/api/goals/[id]` | Update goal fields or status                         | Supabase           |
| `DELETE` | `/api/goals/[id]` | Delete a goal and its `goal_habits` rows             | Supabase           |

### Daily Log

| Method | Path       | What it does                                                           | DB       |
| ------ | ---------- | ---------------------------------------------------------------------- | -------- |
| `GET`  | `/api/log` | Get today's `daily_log` and all `checkins` for the current user        | Supabase |
| `POST` | `/api/log` | Upsert today's `daily_log` (mood, journal) and batch-upsert `checkins` | Supabase |

### AI Coaching

| Method | Path                     | What it does                                                                                                                                                                                                                     | DB                               |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `GET`  | `/api/coaching` ✅       | Fetch coaching history for the current user; accepts optional `?limit=N` (default 20, max 100)                                                                                                                                   | MongoDB                          |
| `POST` | `/api/coaching` ✅       | Save a coaching response; body: `{ type, content, model, habit_context? }`; validates type enum; returns 201                                                                                                                     | MongoDB                          |
| `POST` | `/api/ai` ✅             | Stream a daily coaching nudge via Vercel AI SDK v6 `streamText` + `@ai-sdk/anthropic`; fetches habits + checkins + preferences in parallel; `onFinish` saves completed nudge to MongoDB; returns `text/plain` streaming response | MongoDB (write), Supabase (read) |
| `POST` | `/api/weekly-summary` ✅ | Run LangGraph weekly summary agent; fetches 7-day habit data + coaching history; saves `WeeklySummaryContent` to MongoDB as `type: 'weekly_summary'`; returns `{ summary }` 201                                                  | MongoDB (write), Supabase (read) |
| `POST` | `/api/support` ✅        | Run LangGraph support agent; body: `{ question: string }`; 400 if missing; agent selectively calls `getAppHelp`, `getUserHabits`, `getCoachingHistory` tools; returns `{ answer }` plain text 200                                | MongoDB (read), Supabase (read)  |
| `POST` | `/api/internal/coaching` ✅ | Save coaching response without Supabase session; authenticated via `x-internal-secret` header (must match `INTERNAL_API_SECRET` env var); `user_id` read from `INTERNAL_USER_ID` env var; same body + validation as `/api/coaching`; returns 201 — used by n8n / automation workflows | MongoDB                          |
| `POST` | `/api/internal/weekly-summary` ✅ | Run weekly summary agent without Supabase session; authenticated via `x-internal-secret` header; `user_id` read from `INTERNAL_USER_ID` env var; calls `runWeeklySummaryAgent(userId)`; returns saved document 201 — used by n8n / automation workflows | MongoDB (write), Supabase (read via service role) |
| `GET`  | `/api/ai/[goalId]`       | Fetch past AI insights for a specific goal                                                                                                                                                                                       | MongoDB                          |

### Preferences

| Method  | Path                  | What it does                                       | DB      |
| ------- | --------------------- | -------------------------------------------------- | ------- |
| `GET`   | `/api/preferences` ✅ | Get coaching style, notification time, focus areas | MongoDB |
| `PATCH` | `/api/preferences` ✅ | Update coaching style and/or notification time     | MongoDB |

### Settings (profile — not yet implemented)

| Method  | Path            | What it does                      | DB       |
| ------- | --------------- | --------------------------------- | -------- |
| `GET`   | `/api/settings` | Get display name and avatar       | Supabase |
| `PATCH` | `/api/settings` | Update display name and/or avatar | Supabase |

### Utilities

| Method | Path             | What it does                                                                      | DB   |
| ------ | ---------------- | --------------------------------------------------------------------------------- | ---- |
| `GET`  | `/api/health` ✅ | Check Supabase + MongoDB connectivity; returns `{ supabase, mongodb, timestamp }` | Both |

---

## Build Order

Each stage ends with something fully usable — not just wired up, but shippable for personal use.

| Stage                        | Weeks | What you build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | What's usable after                                                                                                                                                                    |
| ---------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Scaffold & Deploy**    | 1–2   | Next.js project, Vercel deploy, GitHub repo, CI skeleton, page routes scaffolded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | A live URL exists. Every page loads (even if blank). You can push code and see it deploy.                                                                                              |
| **2 — UI with mock data** ✅ | 3–4   | Habit dashboard, HabitCard, check-in toggle, streak display, habit detail page, goal list + detail, NewHabitDialog, NewGoalDialog, daily log, settings, site-wide Navigation, loading skeletons — all with mock data. Remaining: auth pages only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | The full app is navigable and looks real. You can demo the UI without a backend.                                                                                                       |
| **3 — Supabase backend** ✅  | 5–6   | Postgres schema ✅, Supabase client ✅, generated DB types ✅, habits/goals/checkins query functions ✅, getHabitById + getGoalById + getGoalHabitIds (ownership-scoped) ✅, POST /api/habits ✅, POST /api/goals ✅ (incl. goal_habits), POST /api/checkins ✅ (upsert by habit_id+date), dashboard + habits + goals pages fetch real data ✅, habits/[id] + goals/[id] pages wired to real Supabase data ✅, check-in toggle persists to Supabase on dashboard and log page ✅, completed_today derived from real checkins ✅, email/password auth (login + signup pages + Server Actions) ✅, middleware.ts route protection ✅, all routes use authenticated server client + session user ID ✅, sign-out button + email indicator in Navigation ✅, streak + weekly_data derived from checkins in toHabit() ✅, weekly chart shows correct Mon–Sun week with today highlighted ✅, RLS migration written (supabase/migrations/20260320000000_add_rls_policies.sql) ✅ — apply via Supabase SQL editor to enforce DB-level access control | You can sign up, log in, create habits and goals, and check in — data persists. The core loop works end-to-end. RLS enforces ownership at the DB level.                                |
| **4 — MongoDB + dual DB**    | 7–8   | MongoDB Atlas cluster ✅, Mongoose models (`AiCoaching`, `UserPreferences`) ✅, query functions (`ai-coaching.ts`, `user-preferences.ts`) ✅, `GET /api/preferences` + `PATCH /api/preferences` ✅, settings page wired (coaching style + notification time persist) ✅, prompt library (`src/lib/ai/prompts.ts` + `.claude/prompts/`) ✅, `GET /api/coaching` + `POST /api/coaching` ✅, daily log displays most recent coaching nudge ✅, checkins dual-DB write (placeholder nudge to MongoDB on completion) ✅, dashboard fetches Supabase + MongoDB in parallel + DashboardCoachingPanel ✅ — remaining: `/api/ai` (Claude API call)                                                                                                                                                                                                                                                                                                                                                                                                     | Settings, coaching history, and dual-DB writes all work. The dashboard surfaces MongoDB data alongside Supabase. The AI data layer is fully wired and ready for real Claude responses. |
| **5 — AI coaching** ✅       | 9–10  | `@anthropic-ai/sdk` + Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`) installed ✅, `POST /api/ai` streams via `streamText` + `toTextStreamResponse()` ✅, `onFinish` saves to MongoDB ✅, daily log wired to real Supabase habits (Server/Client split: LogClient) ✅, placeholder nudge write removed from checkins route ✅, "Log Day" streams via fetch + ReadableStream + flushSync + rAF ✅, dashboard "Get nudge" button streams inline ✅, LangGraph weekly summary agent (`src/lib/ai/weekly-summary-agent.ts`) ✅, `POST /api/weekly-summary` ✅, "Generate weekly summary" button in LogClient with structured WeeklySummaryView ✅, LangGraph support agent (`src/lib/ai/support-agent.ts`) ✅, `POST /api/support` ✅, floating support chat widget (`src/components/app/support-chat.tsx`) in root layout ✅ — remaining: coaching history on goal detail pages                                                                                                                                                                    | A real AI coaching nudge is generated from live habit data. Weekly summaries, support chat, and dashboard nudges all work end-to-end.                                                  |
| **6 — Tests & CI/CD** ✅     | 11–12 | Playwright test suite: auth ✅, habits ✅, goals ✅, checkins ✅, connectivity ✅ — playwright.config.ts: 120s timeout, 1280×900 viewport, globalSetup + storageState pattern, webServer builds + starts production server in CI ✅ — .github/workflows/ci.yml: Node 20, Next.js build cache, Playwright chromium, 8 secrets, artifact upload on failure ✅ — .github/workflows/claude-pr-review.yml: `custom_instructions` input, `id-token: write` permission, reviews TS, DB usage, RLS, tests, conventions ✅ — eslint step directly in CI (Trunk removed) ✅ — CI auth timeout fix: `fetchWithTimeout` (30s AbortController) on `global.fetch` in Supabase server client; explicit `timeout: 60000` on all auth `waitForURL` calls ✅ — globalSetup logs in once and saves session to `.auth/user.json`; spec files use storageState override for unauthenticated tests ✅ — dialog cancel buttons use `page.keyboard.press('Escape')` to bypass viewport constraints ✅ — afterAll teardown in habits + goals spec files deletes test rows via Supabase JS client (no signOut — global scope would invalidate storageState mid-run) ✅                                                                                                                                                                                 | Every push runs tests automatically. PRs get AI review. Broken builds are caught before merge.                                                                                         |
| **7 — Automation**           | 13–14 | n8n local workflows, daily 8am cron → fetch habits → call Claude → save nudge to MongoDB, LangGraph weekly summary agent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The app coaches you without you opening it. Daily nudges and weekly summaries arrive automatically.                                                                                    |
| **8 — Polish & v1.0**        | 15–16 | RLS audit, query optimisation, image optimisation, Claude Cowork daily journal, custom Skills, full end-to-end review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | A fast, secure, fully automated personal app. Every page works, every flow is tested. This is v1.0.                                                                                    |

## Open decisions / unknowns

Things you haven't decided yet: What triggers a goal as "completed"?
Parking these explicitly prevents them from becoming silent assumptions in the code.

- AI prompt structure: resolved — prompts live in `.claude/prompts/` as YAML files with `system` and `user_template` fields; loaded and interpolated at runtime by `src/lib/ai/prompts.ts`.

- Goal → habit linking: `goal_habits` join table writes implemented (POST /api/goals inserts rows). Reads implemented via `getGoalHabitIds()` — used in goals/[id]/page.tsx to fetch linked habits for display.
- GoalStatus values: `active | completed | abandoned` (not `paused` — removed from type definition).
- Category DB constraint (`habits_category_check`): was missing `fitness` — manually added. Constraint now matches the `Category` TS type: `health | fitness | mindfulness | productivity | learning`. Keep these in sync when adding categories.
- Streak storage: streak is **not stored** in the `habits` table. It is computed at read time in `toHabit()` from the checkins passed in. Rule: consecutive completed days counting back from today (UTC). If today is incomplete the count starts from yesterday. Dates use UTC throughout — local-timezone display is a client-side TODO.
- Checkins upsert: `POST /api/checkins` uses `upsertCheckin` with `onConflict: 'habit_id,date'` — requires a `UNIQUE(habit_id, date)` constraint on the `checkins` table in Supabase.

## What "done" looks like for v1

I can open the app on my phone, log all my habits for the day,
see my current streaks, and get a coaching nudge — with no
placeholder pages and no console errors.
