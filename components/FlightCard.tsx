'use client'

import { Plane, Clock, MapPin, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from '@/components/CountdownTimer'
import type { FlightLeg } from '@/data/trip'
import type { FlightStatusData } from '@/types'
import {
  formatLocalTime,
  formatLocalDate,
  statusLabel,
  statusColor,
  checkInStatus,
  checkInOpensAt,
  formatLocalDateTime,
  cn,
} from '@/lib/utils'
import { EMIRATES_LINKS } from '@/data/trip'

interface FlightCardProps {
  leg: FlightLeg
  status: FlightStatusData | null
}

function CheckInBadge({ departure, timezone }: { departure: string; timezone: string }) {
  const ciStatus = checkInStatus(departure)
  const opensAt = checkInOpensAt(departure)

  if (ciStatus === 'departed') return null

  if (ciStatus === 'open') {
    return (
      <a
        href={EMIRATES_LINKS.checkIn}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
      >
        <CheckCircle2 className="h-3 w-3" />
        Check-in open — click to check in
      </a>
    )
  }

  if (ciStatus === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
        <AlertCircle className="h-3 w-3" />
        Check-in closed — go to airport counter
      </span>
    )
  }

  // not-open
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      Check-in opens {formatLocalDateTime(opensAt.toISOString(), timezone)}
    </span>
  )
}

export function FlightCard({ leg, status }: FlightCardProps) {
  const depTime = formatLocalTime(leg.scheduledDeparture, leg.from.timezone)
  const arrTime = formatLocalTime(leg.scheduledArrival, leg.to.timezone)
  const depDate = formatLocalDate(leg.scheduledDeparture, leg.from.timezone)

  const flightStatus = status?.status ?? 'scheduled'
  const delayMins = status?.departure.delay ?? null
  const gate = status?.departure.gate ?? null
  const terminal = status?.departure.terminal ?? null
  const actualDep = status?.departure.actual ?? status?.departure.estimated ?? null

  const isPast = new Date(leg.scheduledDeparture).getTime() < Date.now()

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        flightStatus === 'active' && 'ring-2 ring-green-500/50',
        flightStatus === 'cancelled' && 'opacity-75 ring-2 ring-red-500/50'
      )}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D71920] text-white">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">{leg.flightNumber}</span>
                <Badge variant="outline" className={cn('text-xs', statusColor(flightStatus))}>
                  {statusLabel(flightStatus)}
                </Badge>
                {delayMins && delayMins > 0 && (
                  <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                    +{delayMins}m delay
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {leg.aircraft} · {leg.cabin}
              </div>
            </div>
          </div>
          {!isPast && (
            <CountdownTimer
              targetIso={leg.scheduledDeparture}
              label="Departs in"
              className="text-right text-xs"
            />
          )}
        </div>

        {/* Route */}
        <div className="mt-4 flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums">{depTime}</div>
            <div className="text-sm font-semibold">{leg.from.iata}</div>
            <div className="text-xs text-muted-foreground">{leg.from.city}</div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="text-xs text-muted-foreground">{depDate}</div>
            <div className="flex w-full items-center gap-1">
              <div className="h-px flex-1 bg-border" />
              <Plane className="h-3 w-3 -rotate-90 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.floor(leg.durationMinutes / 60)}h {leg.durationMinutes % 60}m
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums">{arrTime}</div>
            <div className="text-sm font-semibold">{leg.to.iata}</div>
            <div className="text-xs text-muted-foreground">{leg.to.city}</div>
          </div>
        </div>

        {/* Live status row (gate, terminal, actual time) */}
        {(gate || terminal || actualDep) && (
          <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
            {terminal && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Terminal {terminal}
              </span>
            )}
            {gate && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Gate {gate}
              </span>
            )}
            {actualDep && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Actual dep:{' '}
                {formatLocalTime(actualDep, leg.from.timezone)}
              </span>
            )}
          </div>
        )}

        {/* Check-in status */}
        <div className="mt-3">
          <CheckInBadge departure={leg.scheduledDeparture} timezone={leg.from.timezone} />
        </div>

        {/* Lounge info */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{leg.loungeInfo}</span>
        </div>

        {/* Quick links */}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`${EMIRATES_LINKS.flightStatus}?flightNumber=${leg.flightNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
          >
            Emirates status →
          </a>
          <a
            href={EMIRATES_LINKS.manageBooking}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
          >
            Manage booking →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
