// TODO: Form dialog to create a new habit with name, category, and frequency fields.

// 'use client' required: manages form state (useState), submit handler, and dialog open/close.
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
import { Category, categoryLabels } from "@/lib/types"

// NOTE: shadcn Select is not installed — using native <select> styled to match Input.

export interface NewHabitFormData {
  name: string
  category: Category
  frequency: "daily" | "weekly" | "custom"
}

interface NewHabitDialogProps {
  /** Called with the submitted form values once the POST /api/habits route is wired up. */
  onAdd?: (data: NewHabitFormData) => void
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
 * Logs submitted data to the console until POST /api/habits is wired up.
 */
export function NewHabitDialog({ onAdd }: NewHabitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category>("health")
  const [frequency, setFrequency] = useState<NewHabitFormData["frequency"]>("daily")

  const resetForm = () => {
    setName("")
    setCategory("health")
    setFrequency("daily")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    setOpen(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const data: NewHabitFormData = { name: name.trim(), category, frequency }
    console.log("New habit:", data)
    onAdd?.(data)
    resetForm()
    setOpen(false)
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
                setFrequency(e.target.value as NewHabitFormData["frequency"])
              }
              className={selectClassName}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-habit-form">
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewHabitDialog
