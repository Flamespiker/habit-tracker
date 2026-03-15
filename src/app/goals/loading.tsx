import { Skeleton } from "@/components/ui/skeleton"
import { GoalCardSkeleton } from "@/components/app/goals/GoalCardSkeleton"

/**
 * Goals page loading state. Mirrors the layout of GoalsPage:
 * page header with New Goal button placeholder, then a list of goal card skeletons.
 */
export default function GoalsLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-48" />
        </div>
        {/* New Goal button placeholder */}
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Goals list */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
