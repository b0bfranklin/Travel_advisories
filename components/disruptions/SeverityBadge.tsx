import { cn } from '@/lib/utils'
import type { DisruptionSeverity } from '@/types'

interface SeverityBadgeProps {
  severity: DisruptionSeverity
  className?: string
  size?: 'sm' | 'md'
}

const SEVERITY_CONFIG: Record<
  DisruptionSeverity,
  { label: string; className: string; dotClassName: string }
> = {
  LOW: {
    label: 'Low',
    className:
      'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-400 dark:ring-green-500/30',
    dotClassName: 'fill-green-500 dark:fill-green-400',
  },
  MEDIUM: {
    label: 'Medium',
    className:
      'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-950 dark:text-yellow-400 dark:ring-yellow-500/30',
    dotClassName: 'fill-yellow-500 dark:fill-yellow-400',
  },
  HIGH: {
    label: 'High',
    className:
      'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-500/30',
    dotClassName: 'fill-orange-500 dark:fill-orange-400',
  },
  CRITICAL: {
    label: 'Critical',
    className:
      'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400 dark:ring-red-500/30',
    dotClassName: 'fill-red-500 dark:fill-red-400 animate-pulse',
  },
}

export function SeverityBadge({ severity, className, size = 'md' }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
      aria-label={`Severity: ${config.label}`}
    >
      <svg viewBox="0 0 6 6" aria-hidden="true" className={cn('h-1.5 w-1.5', config.dotClassName)}>
        <circle cx={3} cy={3} r={3} />
      </svg>
      {config.label}
    </span>
  )
}
