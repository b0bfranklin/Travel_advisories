'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { FlightCard } from '@/components/FlightCard'
import { WeatherStrip } from '@/components/WeatherStrip'
import { AdvisoryPanel } from '@/components/AdvisoryPanel'
import { EmiratiesInfo } from '@/components/EmiratiesInfo'
import { FLIGHTS } from '@/data/trip'
import type { FlightStatusData, WeatherData, AdvisoryData } from '@/types'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

interface DashboardProps {
  initialFlights: FlightStatusData[] | null
  initialWeather: (WeatherData | null)[] | null
  initialAdvisories: AdvisoryData[] | null
}

export function Dashboard({ initialFlights, initialWeather, initialAdvisories }: DashboardProps) {
  const [flights, setFlights] = useState<FlightStatusData[] | null>(initialFlights)
  const [weather, setWeather] = useState<(WeatherData | null)[] | null>(initialWeather)
  const [advisories, setAdvisories] = useState<AdvisoryData[] | null>(initialAdvisories)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [fRes, wRes, aRes] = await Promise.allSettled([
        fetch('/api/flights').then((r) => r.json()),
        fetch('/api/weather').then((r) => r.json()),
        fetch('/api/advisories').then((r) => r.json()),
      ])
      if (fRes.status === 'fulfilled') setFlights(fRes.value.data)
      if (wRes.status === 'fulfilled') setWeather(wRes.value.data)
      if (aRes.status === 'fulfilled') setAdvisories(aRes.value.data)
      setLastRefreshed(new Date())
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh])

  // Outbound flights (EK407, EK055)
  const outbound = FLIGHTS.filter((f) => f.direction === 'outbound')
  // Return flights (EK056, EK408)
  const returnLegs = FLIGHTS.filter((f) => f.direction === 'return')

  function getStatus(flightNumber: string): FlightStatusData | null {
    return flights?.find((s) => s.flightNumber === flightNumber) ?? null
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      {/* Refresh indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">✈ Emirates Trip — May 2026</h1>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
          title="Refresh all data"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing
            ? 'Refreshing…'
            : `Updated ${new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }).format(lastRefreshed)}`}
        </button>
      </div>

      {/* Outbound flights */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Outbound — Melbourne → Düsseldorf
        </h2>
        <div className="space-y-3">
          {outbound.map((leg) => (
            <FlightCard key={leg.flightNumber} leg={leg} status={getStatus(leg.flightNumber)} />
          ))}
        </div>
      </section>

      {/* Return flights */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Return — Düsseldorf → Melbourne
        </h2>
        <div className="space-y-3">
          {returnLegs.map((leg) => (
            <FlightCard key={leg.flightNumber} leg={leg} status={getStatus(leg.flightNumber)} />
          ))}
        </div>
      </section>

      {/* Advisory panel */}
      <AdvisoryPanel advisories={advisories ?? []} />

      {/* Emirates PE info */}
      <EmiratiesInfo />

      {/* Weather */}
      <WeatherStrip weather={weather ?? []} />

      <p className="pb-4 text-center text-xs text-muted-foreground">
        Flight status refreshes automatically every 5 minutes · Weather every 30 min · Advisories
        every 6 hours
      </p>
    </div>
  )
}
