import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
}

/**
 * Displays a single summary statistic with an icon, value, and optional subtitle.
 * Used in the dashboard header row for habit metrics (total, streaks, completion).
 */
export function StatsCard({ title, value, subtitle, icon: Icon }: StatsCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
