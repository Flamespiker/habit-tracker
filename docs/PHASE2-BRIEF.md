# Habit Tracker — Codebase Status & Phase 2 Brief
_Generated 2026-03-14_

---

## What Exists

### App Pages (14 files — all scaffolds)
Every route in `src/app/` exists as a file but renders only a heading or placeholder text. The routes that have been stubbed out are:

- **Dashboard** (`/`) — static title card, no data
- **Auth** — `/login` and `/signup` both render a single `<h1>`, no forms
- **Habits** — list (`/habits`), create (`/habits/new`), detail (`/habits/[id]`), edit (`/habits/[id]/edit`) — all TODO
- **Goals** — same four-page pattern as habits (`/goals`, `/goals/new`, `/goals/[id]`, `/goals/[id]/edit`) — all TODO
- **Log** (`/log`) — daily check-in page, no form or logic
- **Settings** (`/settings`) — no form or persistence logic

Each page file contains detailed TODO comments describing the intended behaviour, so the intent is well-documented even though nothing is implemented.

### Components
- **shadcn/ui** (`src/components/ui/`) — 9 components fully installed and production-ready: `badge`, `button`, `card`, `dialog`, `input`, `label`, `progress`, `sonner`, `table`. These are complete and should not be edited.
- **HabitCard** (`src/components/app/habits/HabitCard.tsx`) — one custom component, a stub that accepts `id`, `name`, `streak`, and `completedToday` props but renders nothing useful yet.

### Infrastructure
- `src/app/globals.css` — full design-system theme (OKLch colour tokens, light/dark modes) ✅
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge) ✅
- `package.json` / config — Next.js 16, React 19, Tailwind, shadcn/ui, Supabase client, Playwright all installed ✅

---

## What Is Missing

Everything beneath the UI layer is absent. Specifically:

| Layer | Missing |
|---|---|
| **API routes** | `src/app/api/` does not exist — no endpoints for habits, goals, log, auth, AI, or settings |
| **Middleware** | `middleware.ts` does not exist — all routes are currently unprotected |
| **Supabase DB layer** | `src/lib/db/supabase/` does not exist — no query functions for any entity |
| **MongoDB DB layer** | `src/lib/db/mongo/` does not exist — no AI/coaching/preferences storage |
| **Auth helpers** | `src/lib/auth/` does not exist — no session utilities or server-side auth checks |
| **TypeScript types** | `src/lib/types/` does not exist — no shared types for `Habit`, `Goal`, `LogEntry`, `User`, etc. |
| **App components** | Only `HabitCard` exists (as a stub); every other component folder (`dashboard/`, `goals/`, `log/`, `ai/`, `layout/`) is empty or absent |
| **Database schema** | No Supabase migrations or seed files are present |
| **Tests** | `tests/` contains no Playwright test files |
| **CI/CD** | `.github/workflows/` — no workflow files present |

---

## What Phase 2 Needs to Address

### 1. Shared Foundation (do this first, everything depends on it)
- Define TypeScript types in `src/lib/types/` for `Habit`, `Goal`, `LogEntry`, `DailyLog`, `User`, `CoachingInsight`
- Write Supabase schema migrations (habits, goals, log_entries tables with RLS policies)
- Implement `src/lib/db/supabase/` query functions (CRUD for each entity)
- Implement `src/lib/auth/` helpers (`getSession`, `requireAuth`, `getCurrentUser`)
- Add `middleware.ts` to protect all non-auth routes

### 2. API Routes
Build out `src/app/api/` with REST endpoints: `habits` (GET/POST), `habits/[id]` (GET/PATCH/DELETE), `goals`, `goals/[id]`, `log` (GET/POST), `settings` (GET/PATCH), and `auth/login` + `auth/signup`.

### 3. Auth UI
Implement the login and signup forms — email/password fields, Supabase `signInWithPassword` / `signUp` calls, inline validation, and post-auth redirect.

### 4. Core Feature Pages & Components
Build the actual UI, in roughly this order:
- **Habits list & HabitCard** — fetch from Supabase, render cards with streak + today's status, link to detail
- **Habit create/edit forms** — name, description, frequency, target count, color/icon
- **Habit detail** — streak display, completion calendar/history, log-today button
- **Goals** — same create/edit/detail pattern; progress bar using the `progress` shadcn component; link habits to goals
- **Daily Log** — habit checklist for today, mood score, journal note, POST to `/api/log`
- **Dashboard** — aggregate view: today's habits due, streak summary, goal progress

### 5. MongoDB + AI Layer
- Set up `src/lib/db/mongo/` for coaching insights and user preferences
- Implement `/api/ai` route to generate and store coaching insights after each log submission
- Surface insights on the Goal detail page

### 6. Settings Page
Profile editing, theme toggle (light/dark via `next-themes`), notification preferences (stored in MongoDB), data export, and account deletion.

### 7. Tests & CI/CD
- Write Playwright E2E tests covering auth, habit CRUD, and daily log flow
- Add GitHub Actions workflows for lint + type-check on PR, and Playwright on merge to main

---

## Priority Order for Phase 2

`Types → DB schema → lib/db/ + lib/auth/ → middleware → API routes → Auth UI → Habits → Log → Goals → Dashboard → AI/coaching → Settings → Tests → CI`
