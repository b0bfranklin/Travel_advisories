import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FlightStatus, AdvisoryLevel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a UTC ISO string as local time at a given IANA timezone
export function formatLocalTime(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoString))
}

// Format a UTC ISO string as a short date (e.g. "Sun 10 May")
export function formatLocalDate(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(isoString))
}

// Format a UTC ISO string as full date + time
export function formatLocalDateTime(isoString: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoString))
}

// Returns a human-readable countdown string from now to a future ISO date
export function timeUntil(isoString: string): { label: string; urgent: boolean } {
  const diff = new Date(isoString).getTime() - Date.now()
  if (diff <= 0) return { label: 'Departed', urgent: false }

  const totalMinutes = Math.floor(diff / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    return {
      label: `${days}d ${hours}h`,
      urgent: days <= 1,
    }
  }
  if (hours > 0) {
    return {
      label: `${hours}h ${minutes}m`,
      urgent: hours <= 3,
    }
  }
  return { label: `${minutes}m`, urgent: true }
}

// Check-in opens 48 hours before departure
export function checkInOpensAt(scheduledDeparture: string): Date {
  return new Date(new Date(scheduledDeparture).getTime() - 48 * 60 * 60 * 1000)
}

export function checkInStatus(
  scheduledDeparture: string
): 'not-open' | 'open' | 'closed' | 'departed' {
  const now = Date.now()
  const departure = new Date(scheduledDeparture).getTime()
  const checkInOpens = departure - 48 * 60 * 60 * 1000
  const checkInCloses = departure - 60 * 60 * 1000 // closes 1h before

  if (now > departure) return 'departed'
  if (now >= checkInOpens && now < checkInCloses) return 'open'
  if (now >= checkInCloses) return 'closed'
  return 'not-open'
}

export function statusLabel(status: FlightStatus): string {
  const labels: Record<FlightStatus, string> = {
    scheduled: 'Scheduled',
    active: 'In Air',
    landed: 'Landed',
    cancelled: 'Cancelled',
    diverted: 'Diverted',
    incident: 'Incident',
    unknown: 'Unknown',
  }
  return labels[status]
}

export function statusColor(status: FlightStatus): string {
  if (status === 'active') return 'text-green-600 dark:text-green-400'
  if (status === 'landed') return 'text-blue-600 dark:text-blue-400'
  if (status === 'cancelled') return 'text-red-600 dark:text-red-400'
  if (status === 'diverted' || status === 'incident') return 'text-orange-600 dark:text-orange-400'
  return 'text-muted-foreground'
}

export const ADVISORY_LEVEL_CONFIG: Record<
  AdvisoryLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  1: {
    label: 'Exercise normal safety precautions',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
  },
  2: {
    label: 'Exercise a high degree of caution',
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  3: {
    label: 'Reconsider your need to travel',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
  },
  4: {
    label: 'Do not travel',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
}
