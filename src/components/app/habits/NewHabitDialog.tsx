// 'use client' required: manages form state (useState), async submit handler, and dialog open/close.
"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Category, categoryLabels, Habit } from "@/lib/types"

// NOTE: shadcn Select is not installed — using native <select> styled to match Input.

interface NewHabitDialogProps {
  /** Called with the newly created habit after a successful save. */
  onAdd?: (habit: Habit) => void
}

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm",
  "cursor-pointer transition-colors outline-none",
  "focus:border-ring focus:ring-2 focus:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
)

/**
 * A 'New Habit' trigger button that opens a dialog form for creating a habit.
 * Persists the new habit via POST /api/habits on submit.
 */
export function NewHabitDialog({ onAdd }: NewHabitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category>("health")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName("")
    setCategory("health")
    setFrequency("daily")
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    setOpen(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category, frequency }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Failed to create habit.')
        return
      }
      onAdd?.(json.habit as Habit)
      resetForm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create habit.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Habit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Habit</DialogTitle>
          <DialogDescription>
            Add a habit you want to build. You can edit it later.
          </DialogDescription>
        </DialogHeader>

        <form id="new-habit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-category">Category</Label>
            <select
              id="habit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={selectClassName}
            >
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-frequency">Frequency</Label>
            <select
              id="habit-frequency"
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as "daily" | "weekly" | "custom")
              }
              className={selectClassName}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="new-habit-form" disabled={submitting}>
            {submitting ? "Adding…" : "Add Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewHabitDialog
