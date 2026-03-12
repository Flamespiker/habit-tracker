# Habit & Goal Tracker

Personal hobby app. Not commercial. Only user is me.

## Stack
- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS + shadcn/ui
- Supabase — Postgres + Auth (structured data)
- MongoDB Atlas M0 — AI responses, coaching insights, user preferences (flexible data)
- Vercel (Hobby plan — personal use)
- Playwright (E2E tests)
- GitHub Actions + Claude Code Action (CI/CD + PR reviews)

## shadcn/ui Components (installed)
badge, button, card, dialog, input, label, progress, sonner, table

## Folder Structure
src/app/ → Next.js pages and API routes
src/app/habits/ → habits list/detail
src/app/goals/ → goals list/detail
src/app/log/ → activity log
src/app/settings/ → user settings
src/app/(auth)/ → login, signup
src/app/api/→ API routes (habits, goals, logs, ai)
src/components/ui/ → shadcn/ui (don't edit)
src/components/app/ → layout/, dashboard/, habits/, goals/, log/, ai/
src/lib/types/ → shared TypeScript types
src/lib/db/supabase/ → Supabase query functions
src/lib/db/mongo/ → MongoDB query functions
src/lib/auth/ → auth helpers
middleware.ts → Supabase auth route protection
tests/ → Playwright tests
.github/workflows/ → CI/CD pipelines

## Skills
/habit-component <ComponentName> → scaffold a new component in src/components/app/habits/

## Conventions
- TypeScript strictly — no `any` types
- Server Components by default — Client only when needed
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

