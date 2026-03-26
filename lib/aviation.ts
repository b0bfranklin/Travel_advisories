import { getCache, setCache, TTL } from './cache'
import type { FlightStatusData, FlightStatus } from '@/types'
import { FLIGHTS } from '@/data/trip'

const AVIATIONSTACK_BASE = 'http://api.aviationstack.com/v1'

interface AviationStackFlight {
  flight_status: string
  departure: {
    iata: string
    scheduled: string
    actual: string | null
    estimated: string | null
    delay: number | null
    terminal: string | null
    gate: string | null
  }
  arrival: {
    iata: string
    scheduled: string
    actual: string | null
    estimated: string | null
    delay: number | null
    terminal: string | null
    gate: string | null
  }
  aircraft: { iata: string; icao24: string } | null
}

function normaliseStatus(raw: string): FlightStatus {
  const map: Record<string, FlightStatus> = {
    scheduled: 'scheduled',
    active: 'active',
    landed: 'landed',
    cancelled: 'cancelled',
    diverted: 'diverted',
    incident: 'incident',
  }
  return map[raw?.toLowerCase()] ?? 'unknown'
}

async function fetchFlightStatus(flightNumber: string): Promise<FlightStatusData | null> {
  const key = process.env.AVIATIONSTACK_API_KEY
  if (!key) return null

  try {
    const url = `${AVIATIONSTACK_BASE}/flights?access_key=${key}&flight_iata=${flightNumber}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const json = await res.json()
    const flights: AviationStackFlight[] = json.data ?? []
    if (flights.length === 0) return null

    // Take the first result — most recent for this flight number
    const f = flights[0]
    return {
      flightNumber,
      status: normaliseStatus(f.flight_status),
      departure: {
        scheduled: f.departure.scheduled,
        actual: f.departure.actual,
        estimated: f.departure.estimated,
        delay: f.departure.delay,
        terminal: f.departure.terminal,
        gate: f.departure.gate,
      },
      arrival: {
        scheduled: f.arrival.scheduled,
        actual: f.arrival.actual,
        estimated: f.arrival.estimated,
        delay: f.arrival.delay,
        terminal: f.arrival.terminal,
        gate: f.arrival.gate,
      },
      aircraft: f.aircraft?.iata ?? null,
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

// Returns live status if available, otherwise a "scheduled" stub from our hardcoded data
function scheduledStub(flightNumber: string): FlightStatusData {
  const leg = FLIGHTS.find((f) => f.flightNumber === flightNumber)
  return {
    flightNumber,
    status: 'scheduled',
    departure: {
      scheduled: leg?.scheduledDeparture ?? '',
      actual: null,
      estimated: null,
      delay: null,
      terminal: null,
      gate: null,
    },
    arrival: {
      scheduled: leg?.scheduledArrival ?? '',
      actual: null,
      estimated: null,
      delay: null,
      terminal: null,
      gate: null,
    },
    aircraft: leg?.aircraft ?? null,
    updatedAt: new Date().toISOString(),
  }
}

export async function getAllFlightStatuses(): Promise<FlightStatusData[]> {
  const cacheKey = 'all-flights'
  const cached = getCache<FlightStatusData[]>(cacheKey)
  if (cached) return cached

  const results = await Promise.all(
    FLIGHTS.map(async (leg) => {
      const live = await fetchFlightStatus(leg.flightNumber)
      return live ?? scheduledStub(leg.flightNumber)
    })
  )

  setCache(cacheKey, results, TTL.FLIGHT_STATUS)
  return results
}
