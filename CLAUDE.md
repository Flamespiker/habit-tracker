# Habit & Goal Tracker

Personal hobby app. Not commercial. Only user is me.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase — Postgres + Auth (structured data)
- MongoDB Atlas M0 — AI responses + preferences (flexible data)
- Vercel (Hobby plan — personal use)
- Playwright (E2E tests)
- GitHub Actions + Claude Code Action (CI/CD + PR reviews)

## Folder Structure
src/app/ → Next.js pages and API routes
src/components/ui/ → shadcn/ui (don't edit)
src/components/app/ → custom app components
src/lib/db/supabase/ → Supabase query functions
src/lib/db/mongo/ → MongoDB query functions
src/lib/auth/ → auth helpers
tests/ → Playwright tests
.github/workflows/ → CI/CD pipelines

## Conventions
- TypeScript strictly — no `any` types
- Server Components by default — Client only when needed
- DB queries ONLY in src/lib/db/ — never inline in components
- Auth logic ONLY in src/lib/auth/
- Supabase = relational data | MongoDB = AI/flexible data

## Commands
npm run dev → dev server
npm run build → production build
npx playwright test → E2E tests
npx tsc --noEmit → type check
```

---

