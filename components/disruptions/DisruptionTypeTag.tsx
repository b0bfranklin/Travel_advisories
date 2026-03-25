import { cn } from '@/lib/utils'
import type { DisruptionType } from '@/types'

interface DisruptionTypeTagProps {
  type: DisruptionType
  className?: string
}

const TYPE_CONFIG: Record<DisruptionType, { label: string; className: string }> = {
  DELAY: {
    label: 'Delay',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
  DIVERTED: {
    label: 'Diverted',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  ROUTE_CHANGE: {
    label: 'Route Change',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  GATE_CHANGE: {
    label: 'Gate Change',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  },
  GROUND_STOP: {
    label: 'Ground Stop',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  },
  UNKNOWN: {
    label: 'Disruption',
    className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
}

export function DisruptionTypeTag({ type, className }: DisruptionTypeTagProps) {
  const config = TYPE_CONFIG[type]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
