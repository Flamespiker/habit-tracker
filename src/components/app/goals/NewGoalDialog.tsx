// TODO: Wire up onAdd to POST /api/goals once Stage 3 Supabase routes are built.

// 'use client' required: manages form state (useState), checkbox multi-select, and dialog open/close.
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
import { GoalStatus, Habit } from "@/lib/types"

// NOTE: shadcn Select is not installed — using native <select> styled to match Input.
// NOTE: "paused" is not a valid GoalStatus — using active | completed | abandoned per the type.

export interface NewGoalFormData {
  title: string
  target_date: string | null
  status: GoalStatus
  habit_ids: string[]
}

interface NewGoalDialogProps {
  /** Habit list passed from the Server Component page for the linked-habits multi-select. */
  habits: Habit[]
  /** Called with submitted form values once POST /api/goals is wired up. */
  onAdd?: (data: NewGoalFormData) => void
}

const selectClassName = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm",
  "cursor-pointer transition-colors outline-none",
  "focus:border-ring focus:ring-2 focus:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
)

/**
 * A 'New Goal' trigger button that opens a dialog form for creating a goal.
 * Supports linking one or more existing habits via checkboxes.
 * Logs submitted data to the console until POST /api/goals is wired up.
 */
export function NewGoalDialog({ habits, onAdd }: NewGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [status, setStatus] = useState<GoalStatus>("active")
  const [habitIds, setHabitIds] = useState<string[]>([])

  const resetForm = () => {
    setTitle("")
    setTargetDate("")
    setStatus("active")
    setHabitIds([])
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    setOpen(next)
  }

  const toggleHabit = (id: string) => {
    setHabitIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const data: NewGoalFormData = {
      title: title.trim(),
      target_date: targetDate || null,
      status,
      habit_ids: habitIds,
    }
    console.log("New goal:", data)
    onAdd?.(data)
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Goal
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Goal</DialogTitle>
          <DialogDescription>
            Define something you want to achieve. You can edit it later.
          </DialogDescription>
        </DialogHeader>

        <form id="new-goal-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              placeholder="e.g. Run a 5K"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-target-date">
              Target Date{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-status">Status</Label>
            <select
              id="goal-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Link Habits{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex flex-col gap-2 rounded-lg border border-input p-3">
              {habits.map((habit) => (
                <label
                  key={habit.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={habitIds.includes(habit.id)}
                    onChange={() => toggleHabit(habit.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {habit.name}
                </label>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-goal-form">
            Add Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewGoalDialog
