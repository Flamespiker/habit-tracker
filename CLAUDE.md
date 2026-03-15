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
badge, button, card, dialog, dropdown-menu, input, label, progress, sonner, table

## Folder Structure
src/app/ → Next.js pages and API routes
src/app/habits/ → habits list (stub) + /[id]/page.tsx implemented (detail: metadata, streak, weekly grid)
src/app/goals/ → goals list/detail
src/app/log/ → activity log
src/app/settings/ → user settings
src/app/(auth)/ → login, signup
src/app/api/→ API routes (habits, goals, logs, ai)
src/components/ui/ → shadcn/ui (don't edit)
src/components/app/ → app components (see below)
src/components/app/theme-provider.tsx → next-themes provider (used in root layout)
src/components/app/theme-toggle.tsx → light/dark/system dropdown toggle
src/components/app/habit-dashboard.tsx → main dashboard (stats, habit list, weekly chart)
src/components/app/stats-card.tsx → single metric card (icon + value + subtitle)
src/components/app/category-filter.tsx → pill buttons to filter habits by category
src/components/app/weekly-chart.tsx → bar chart of completions over the last 7 days
src/components/app/habits/HabitCard.tsx → card showing name (links to /habits/[id]), category badge, streak, progress bar, check-in toggle
src/components/app/habits/NewHabitDialog.tsx → trigger button + dialog form to create a habit (name, category, frequency)
src/lib/types/ → shared TypeScript types (Habit, Category, categoryColors, categoryLabels)
src/lib/mock-data.ts → mock habits for Stage 2 UI (replace with GET /api/habits later)
src/lib/data.ts → re-export shim for mock-data.ts (backward compat)
src/lib/db/supabase/ → Supabase query functions
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
- `completed_today` and `weekly_data` on `Habit` are UI-only — not stored in the `habits` table; derived from `checkins`
- Habit components take `habit: Habit` (full object) + `onToggle: (id: string) => void` — never individual fields

## Conventions
- TypeScript strictly — no `any` types
- Server Components by default — Client only when needed
- When adding 'use client', put a comment on the line above explaining why
- Named export + default export on every component
- JSDoc on every exported component
- shadcn Select is NOT installed — use native `<select>` with Tailwind classes that mirror the `Input` component styling
- Dynamic route pages call `notFound()` from `next/navigation` for unknown IDs (typed `never`, so TypeScript narrows correctly)
- DB queries ONLY in src/lib/db/ — never inline in components
- Auth logic ONLY in src/lib/auth/
- Supabase = relational data | MongoDB = AI/flexible data

## Data Layer Conventions
- Client Components → fetch API route → lib/db/
- Server Components → call lib/db/ directly

## Commands
npm run dev → dev server
npm run build → production build
npx playwright test → E2E tests
npx tsc --noEmit → type check
```

---

