import { ExternalLink, PlaneTakeoff, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SeverityBadge } from './SeverityBadge'
import { DisruptionTypeTag } from './DisruptionTypeTag'
import { LastUpdated } from './LastUpdated'
import { cn } from '@/lib/utils'
import type { Disruption } from '@/types'

interface DisruptionCardProps {
  disruption: Disruption
  className?: string
}

const SEVERITY_BORDER: Record<string, string> = {
  LOW: 'border-l-4 border-l-green-500',
  MEDIUM: 'border-l-4 border-l-yellow-500',
  HIGH: 'border-l-4 border-l-orange-500',
  CRITICAL: 'border-l-4 border-l-red-500',
}

export function DisruptionCard({ disruption, className }: DisruptionCardProps) {
  const {
    flightNumber,
    airlineName,
    originIata,
    destinationIata,
    originName,
    destinationName,
    disruptionType,
    severity,
    reason,
    delayMinutes,
    updatedAt,
    airlineStatusUrl,
    rebookUrl,
    refundUrl,
  } = disruption

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-md dark:hover:shadow-zinc-800',
        SEVERITY_BORDER[severity],
        className
      )}
      role="article"
      aria-label={`${flightNumber} — ${disruptionType.replace('_', ' ').toLowerCase()}`}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="font-mono text-sm font-bold tracking-wider">{flightNumber}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">{airlineName}</span>
          </div>
          <div className="flex items-center gap-2">
            <DisruptionTypeTag type={disruptionType} />
            <SeverityBadge severity={severity} />
          </div>
        </div>

        {/* Route */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="text-center">
            <div className="font-bold">{originIata}</div>
            <div
              className="max-w-[100px] truncate text-xs text-muted-foreground"
              title={originName}
            >
              {originName}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="text-center">
            <div className="font-bold">{destinationIata}</div>
            <div
              className="max-w-[100px] truncate text-xs text-muted-foreground"
              title={destinationName}
            >
              {destinationName}
            </div>
          </div>
          {delayMinutes !== null && delayMinutes > 0 && (
            <span className="ml-auto shrink-0 rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
              +{delayMinutes} min
            </span>
          )}
        </div>

        {/* Reason */}
        {reason && (
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Reason: </span>
            {reason}
          </p>
        )}

        {/* Footer — last updated + action links */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 dark:border-zinc-800">
          <LastUpdated timestamp={updatedAt} isLive={!disruption.isResolved} />

          <div className="flex flex-wrap gap-2 text-xs">
            {airlineStatusUrl && (
              <a
                href={airlineStatusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                aria-label={`Check ${airlineName} flight status (opens in new tab)`}
              >
                Status <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {rebookUrl && (
              <a
                href={rebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                aria-label={`Rebook with ${airlineName} (opens in new tab)`}
              >
                Rebook <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {refundUrl && (
              <a
                href={refundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                aria-label={`Request refund from ${airlineName} (opens in new tab)`}
              >
                Refund <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
