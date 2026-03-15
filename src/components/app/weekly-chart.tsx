import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface WeeklyChartProps {
  /** Completion counts for each day of the week (Mon–Sun, 7 values). */
  data: number[]
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Bar chart showing how many habits were completed on each day of the current week.
 * Heights are computed proportionally relative to the day with the most completions.
 */
export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxValue = Math.max(...data, 1)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-end justify-between gap-2">
          {data.map((value, index) => (
            <div key={days[index]} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary transition-all"
                style={{ height: `${Math.max((value / maxValue) * 80, 4)}px` }}
              />
              <span className="text-xs text-muted-foreground">{days[index]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default WeeklyChart
