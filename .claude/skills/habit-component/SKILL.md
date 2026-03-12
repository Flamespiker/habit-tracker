---
name: habit-component
description: Scaffold a new habit-related React component in src/components/app/habits/
argument-hint: <ComponentName>
---

Create a new TypeScript React component for the habit tracker app.

## File location
`src/components/app/habits/$ARGUMENTS.tsx`

## Rules
- Use `"use client"` only if the component needs interactivity (onClick, useState, etc.) — otherwise omit it (Server Component)
- Define a `Props` interface above the component — no `any` types
- Export the component as a named export
- Add a single TODO comment below the component name describing what it will do
- Use Tailwind CSS for styling — no inline styles
- Do not import anything that doesn't exist yet

## Template

```tsx
// TODO: describe what this component will do

interface $ARGUMENTSProps {
  // define props here
}

export function $ARGUMENTS({ }: $ARGUMENTSProps) {
  return (
    <div>
      <p>$ARGUMENTS</p>
    </div>
  );
}
```

Create the file, show the user what was created, and remind them whether it should be a Server or Client Component based on the name/purpose.
