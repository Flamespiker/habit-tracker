import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { IAiCoaching } from '@/lib/db/mongo/models/AiCoaching'

const TYPE_LABELS: Record<IAiCoaching['type'], string> = {
  daily_nudge:     'Daily Nudge',
  weekly_summary:  'Weekly Summary',
  suggestion:      'Suggestion',
}

interface WeeklySummaryContent {
  overview: string
  highlights: string[]
  struggles: string[]
  recommendation: string
}

function isWeeklySummaryContent(v: unknown): v is WeeklySummaryContent {
  return (
    typeof v === 'object' &&
    v !== null &&
    'overview' in v &&
    'highlights' in v &&
    'struggles' in v &&
    'recommendation' in v
  )
}

function getContentPreview(content: unknown): string {
  if (content === null || content === undefined) return 'Coaching nudge pending'
  if (typeof content === 'object' && 'placeholder' in (content as Record<string, unknown>)) {
    return 'Coaching nudge pending'
  }
  const str = typeof content === 'string' ? content : JSON.stringify(content)
  return str.length > 120 ? str.slice(0, 120) + '…' : str
}

function relativeDate(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1)   return 'just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7)   return `${diffDays}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  entries: IAiCoaching[]
}

/**
 * Displays the 3 most recent coaching entries from MongoDB.
 * Data verification component — not final UI.
 */
export function DashboardCoachingPanel({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Recent Coaching</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No coaching history yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">Recent Coaching</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">
                {TYPE_LABELS[entry.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {relativeDate(entry.created_at)}
              </span>
            </div>
            {entry.type === 'weekly_summary' && isWeeklySummaryContent(entry.content) ? (
              <WeeklySummaryPreview content={entry.content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {getContentPreview(entry.content)}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Compact weekly summary preview for the dashboard coaching panel. */
function WeeklySummaryPreview({ content }: { content: WeeklySummaryContent }) {
  const overview = content.overview.length > 120
    ? content.overview.slice(0, 120) + '…'
    : content.overview
  return (
    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
      <p>{overview}</p>
      {content.highlights.length > 0 && (
        <p className="text-xs">
          <span className="font-medium text-foreground">Highlights: </span>
          {content.highlights.slice(0, 2).join(' · ')}
          {content.highlights.length > 2 ? ` · +${content.highlights.length - 2} more` : ''}
        </p>
      )}
    </div>
  )
}

export default DashboardCoachingPanel
