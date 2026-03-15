# Habit Tracker — Claude Memory

## Key Files
- `src/lib/types/index.ts` — `Habit`, `Category`, `categoryColors`, `categoryLabels`
- `src/lib/data.ts` — `initialHabits` mock data (replace with API fetching later)
- `src/components/app/habits/HabitCard.tsx` — stub with TODO; props: `{ id, name, streak, completedToday }`

## Component Conventions
- Server Components by default; `'use client'` only for hooks/events/browser APIs, with a comment explaining why
- Named export + default export on every component
- JSDoc on every exported component
- Shadcn/ui components used for all UI primitives (Button, Card, etc.)
- TypeScript interfaces for all props (no `any`)

## Architecture Notes
- Client Components fetch via API route → `src/lib/db/`; Server Components call `src/lib/db/` directly
- `@/lib/types` resolves to `src/lib/types/index.ts`
- `habit-dashboard` uses local state with `initialHabits`; TODO: replace with `/api/habits` fetch
- `toggleHabit` in dashboard is wired up but HabitCard is a stub (no onToggle prop yet)

## Installed shadcn/ui Components
badge, button, card, dialog, input, label, progress, sonner, table
