 Product Requirements Document — Habit & Goal Tracker

  Last updated: 2026-03-15 | Status: In development | Owner: Personal / solo use

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
  - On submit: POST /api/log → triggers AI insight generation via /api/ai
  - Route: /log

  4. AI Coaching

  - Insights stored in MongoDB (flexible schema)
  - Generated per log entry; surfaced on goal detail pages
  - Powered by Claude API (inferred from stack)

  5. Auth

  - Supabase Auth (email/password)
  - Protected routes via middleware.ts
  - Routes: /(auth)/login, /(auth)/signup

  6. Settings

  - Profile: display name, avatar (Supabase)
  - Preferences: theme, notifications (MongoDB)
  - Data export + account deletion
  - Route: /settings

  ---
  Technical Constraints

  ┌───────────────────────┬───────────────────────────────────────────────────────────────────────┐
  │      Constraint       │                                Detail                                 │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Hosting               │ Vercel Hobby — no long-running processes, 10s serverless timeout      │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Database (relational) │ Supabase Postgres — habits, goals, logs, users                        │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Database (flexible)   │ MongoDB Atlas M0 — free tier, AI responses, preferences               │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Auth                  │ Supabase Auth only — no third-party OAuth required                    │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Frontend              │ Next.js App Router, Server Components by default                      │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Styling               │ Tailwind CSS + shadcn/ui only — no other component libraries          │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Types                 │ TypeScript strict mode, no any                                        │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ DB access             │ All queries in src/lib/db/ — never inline in components or API routes │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Tests                 │ Playwright E2E only — no unit test framework currently                │
  ├───────────────────────┼───────────────────────────────────────────────────────────────────────┤
  │ Budget                │ $0 — all free tiers                                                   │
  └───────────────────────┴───────────────────────────────────────────────────────────────────────┘

  ---
  Success Metrics

  Since this is a personal tool, success is measured by usefulness and completion:

  ┌─────────────────────────┬─────────────────────────────────────────────────────────────────┐
  │         Metric          │                             Target                              │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Daily log completion    │ Able to complete a full daily check-in end-to-end               │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Streak accuracy         │ Streaks reflect actual completion history correctly             │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ AI insights             │ At least one meaningful insight generated per log submission    │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Page load (habits list) │ < 1s on Vercel (Server Component, no client waterfall)          │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ Build passing           │ npm run build and npx tsc --noEmit always green                 │
  ├─────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │ E2E coverage            │ Core flows (login, create habit, log day) covered by Playwright │
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

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Supabase Auth user ID |
| `display_name` | `text` | User's chosen display name |
| `avatar_url` | `text \| null` | URL to profile avatar image |
| `created_at` | `timestamptz` | Account creation timestamp |

---

**`habits`** — one row per habit per user

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Unique habit ID |
| `user_id` | `uuid` FK → users | Owner of the habit |
| `name` | `text` | Display name of the habit |
| `frequency` | `text` | `daily`, `weekly`, or `custom` |
| `category` | `text` | Habit category (`fitness`, `health`, `mindfulness`, `productivity`, `learning`) |
| `target_days` | `int` | Target number of days to complete per frequency period |
| `streak` | `int` | Cached consecutive completion streak (derived from `checkins`) |
| `archived` | `bool` | Whether the habit is archived (hidden from active list) |
| `created_at` | `timestamptz` | When the habit was created |

> **UI-only fields** (not stored in `habits`): `completed_today` (derived from today's `checkins` row) and `weekly_data` (derived from the last 7 `checkins` rows). These exist on the `Habit` TypeScript type for convenience but are never written to this table.

---

**`goals`** — one row per goal per user

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Unique goal ID |
| `user_id` | `uuid` FK → users | Owner of the goal |
| `title` | `text` | Short goal title |
| `description` | `text \| null` | Longer description or success criteria |
| `target_date` | `date \| null` | Target completion date |
| `status` | `text` | `active`, `completed`, or `abandoned` |
| `created_at` | `timestamptz` | When the goal was created |

---

**`goal_habits`** — join table linking goals to habits (many-to-many)

| Field | Type | Description |
|---|---|---|
| `goal_id` | `uuid` FK → goals | The goal |
| `habit_id` | `uuid` FK → habits | The linked habit |

---

**`checkins`** — one row per habit per day per user

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Unique check-in ID |
| `user_id` | `uuid` FK → users | Owner of the check-in |
| `habit_id` | `uuid` FK → habits | Which habit was logged |
| `date` | `date` | The calendar date of the check-in |
| `completed` | `bool` | Whether the habit was completed that day |
| `note` | `text \| null` | Optional per-habit note |
| `created_at` | `timestamptz` | When the record was created |

---

**`daily_logs`** — one row per day per user (mood + journal)

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` PK | Unique log ID |
| `user_id` | `uuid` FK → users | Owner of the log |
| `date` | `date` | The calendar date (unique per user) |
| `mood_score` | `int \| null` | Mood rating 1–10 |
| `journal` | `text \| null` | Free-text journal entry for the day |
| `created_at` | `timestamptz` | When the log was submitted |

---

### MongoDB (Atlas M0)

**`ai_coaching`** — one document per AI insight generated

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | MongoDB document ID |
| `user_id` | `string` | Supabase user UUID |
| `daily_log_id` | `string` | FK to Supabase `daily_logs.id` |
| `goal_id` | `string \| null` | Goal this insight relates to, if any |
| `insight` | `string` | The AI-generated coaching text |
| `prompt_summary` | `string` | Summary of the prompt sent to Claude |
| `model` | `string` | Claude model used (e.g. `claude-sonnet-4-6`) |
| `created_at` | `Date` | When the insight was generated |

---

**`user_preferences`** — one document per user

| Field | Type | Description |
|---|---|---|
| `_id` | `ObjectId` | MongoDB document ID |
| `user_id` | `string` | Supabase user UUID (unique index) |
| `theme` | `string` | `light`, `dark`, or `system` |
| `notifications_enabled` | `bool` | Whether browser notifications are on |
| `updated_at` | `Date` | Last time preferences were changed |

---
## API Routes

Auth is handled entirely by Supabase — no custom auth routes needed.
All routes require an authenticated session. User ID is always read server-side from the session, never from the request body.

### Habits

| Method | Path | What it does | DB |
|---|---|---|---|
| `GET` | `/api/habits` | List all habits for the current user | Supabase |
| `POST` | `/api/habits` | Create a new habit | Supabase |
| `GET` | `/api/habits/[id]` | Get a single habit with its completion history | Supabase |
| `PATCH` | `/api/habits/[id]` | Update habit fields (name, frequency, archived, etc.) | Supabase |
| `DELETE` | `/api/habits/[id]` | Delete a habit and its checkins | Supabase |

### Goals

| Method | Path | What it does | DB |
|---|---|---|---|
| `GET` | `/api/goals` | List all goals for the current user | Supabase |
| `POST` | `/api/goals` | Create a new goal and link habits via `goal_habits` | Supabase |
| `GET` | `/api/goals/[id]` | Get a single goal with linked habits and AI insights | Supabase + MongoDB |
| `PATCH` | `/api/goals/[id]` | Update goal fields or status | Supabase |
| `DELETE` | `/api/goals/[id]` | Delete a goal and its `goal_habits` rows | Supabase |

### Daily Log

| Method | Path | What it does | DB |
|---|---|---|---|
| `GET` | `/api/log` | Get today's `daily_log` and all `checkins` for the current user | Supabase |
| `POST` | `/api/log` | Upsert today's `daily_log` (mood, journal) and batch-upsert `checkins` | Supabase |

### AI

| Method | Path | What it does | DB |
|---|---|---|---|
| `POST` | `/api/ai` | Generate a coaching insight from today's log; store result in `ai_coaching` | MongoDB (write), Supabase (read log data) |
| `GET` | `/api/ai/[goalId]` | Fetch past AI insights for a specific goal | MongoDB |

### Settings

| Method | Path | What it does | DB |
|---|---|---|---|
| `GET` | `/api/settings` | Get current user's profile and preferences | Supabase + MongoDB |
| `PATCH` | `/api/settings` | Update profile (display name, avatar) and/or preferences (theme, notifications) | Supabase + MongoDB |

---
## Build Order

Each stage ends with something fully usable — not just wired up, but shippable for personal use.

| Stage | Weeks | What you build | What's usable after |
|---|---|---|---|
| **1 — Scaffold & Deploy** | 1–2 | Next.js project, Vercel deploy, GitHub repo, CI skeleton, page routes scaffolded | A live URL exists. Every page loads (even if blank). You can push code and see it deploy. |
| **2 — UI with mock data** (in progress) | 3–4 | Habit dashboard, HabitCard, check-in toggle, streak display, habit detail page, goal list + detail, NewHabitDialog, NewGoalDialog, site-wide Navigation, loading skeletons — all with mock data. Remaining: log page, settings page, auth pages. | The full app is navigable and looks real. You can demo the UI without a backend. |
| **3 — Supabase backend** | 5–6 | Postgres schema, Supabase client, all API routes for habits/goals/checkins, RLS policies, auth (email/password only), middleware protection | You can sign up, log in, create habits and goals, and check in — data persists. The core loop works end-to-end. |
| **4 — MongoDB + dual DB** | 7–8 | MongoDB Atlas cluster, Mongoose models, `ai_coaching` and `user_preferences` collections, API routes wired to both DBs | Settings (theme, notifications) persist. The app reads/writes both databases. The AI data layer is ready to receive responses. |
| **5 — AI coaching** | 9–10 | Claude API integration, streaming coaching nudge on daily log submit, coaching history display, weekly LangChain summary agent | After checking in, you get a real AI coaching message. Past insights are visible on goal detail pages. The app is genuinely useful. |
| **6 — Tests & CI/CD** | 11–12 | Playwright test suite (login, habit creation, check-in, goal creation), GitHub Actions pipeline, Claude PR review agent | Every push runs tests automatically. PRs get AI review. Broken builds are caught before merge. |
| **7 — Automation** | 13–14 | n8n local workflows, daily 8am cron → fetch habits → call Claude → save nudge to MongoDB, LangGraph weekly summary agent | The app coaches you without you opening it. Daily nudges and weekly summaries arrive automatically. |
| **8 — Polish & v1.0** | 15–16 | RLS audit, query optimisation, image optimisation, Claude Cowork daily journal, custom Skills, full end-to-end review | A fast, secure, fully automated personal app. Every page works, every flow is tested. This is v1.0. |

## Open decisions / unknowns
  Things you haven't decided yet: How is streak calculated (UTC midnight? local time?)? What does the AI prompt look
  like? What triggers a goal as "completed"? Parking these explicitly prevents them from becoming silent assumptions in
  the code.

- Goal → habit linking: using `habit_ids: string[]` (UI-only array) in Phase 2 mock data. Phase 3 will implement via join table in Supabase.
- GoalStatus values: `active | completed | abandoned` (not `paused` — removed from type definition).

## What "done" looks like for v1
I can open the app on my phone, log all my habits for the day, 
see my current streaks, and get a coaching nudge — with no 
placeholder pages and no console errors.