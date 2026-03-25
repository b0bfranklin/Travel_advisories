import type { Disruption, DisruptionSource, DisruptionType, DisruptionSeverity } from '@/types'
import { getCache, setCache } from './cache'
import { CACHE_TTL } from './cache-config'
import { getAirlineUrlsSync, getAirlineName } from './airlines'
import airlinesData from '@/data/airlines.json'
import type { AirlineMap } from '@/types'

// =============================================================================
// OpenSky Network API types
// =============================================================================

interface OpenSkyState {
  icao24: string // 0: unique ICAO 24-bit address
  callsign: string | null // 1: callsign (flight number)
  origin_country: string // 2: country of origin
  time_position: number | null // 3: unix timestamp of last position update
  last_contact: number // 4: unix timestamp of last message
  longitude: number | null // 5: WGS-84 longitude
  latitude: number | null // 6: WGS-84 latitude
  baro_altitude: number | null // 7: barometric altitude (m)
  on_ground: boolean // 8: whether on ground
  velocity: number | null // 9: velocity over ground (m/s)
  true_track: number | null // 10: track angle (deg from north)
  vertical_rate: number | null // 11: vertical rate (m/s)
  sensors: number[] | null // 12: sensor IDs
  geo_altitude: number | null // 13: geometric altitude (m)
  squawk: string | null // 14: squawk code
  spi: boolean // 15: special purpose indicator
  position_source: number // 16: position source (0=ADS-B, 1=ASTERIX, 2=MLAT)
}

interface OpenSkyResponse {
  time: number
  states: OpenSkyState[] | null
}

// =============================================================================
// Cache keys
// =============================================================================

const CACHE_KEYS = {
  activeDisruptions: 'disruptions:active',
  openSkyRaw: 'opensky:states:raw',
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Derive a disruption severity from available data.
 * Since OpenSky doesn't provide delay/cancellation info directly,
 * we use heuristics based on ground status and squawk codes.
 */
function deriveDisruptionDetails(state: OpenSkyState): {
  disruptionType: DisruptionType
  severity: DisruptionSeverity
  reason: string | null
  delayMinutes: number | null
} {
  // Emergency squawk codes
  if (state.squawk === '7700') {
    return {
      disruptionType: 'UNKNOWN',
      severity: 'CRITICAL',
      reason: 'Emergency declared (squawk 7700)',
      delayMinutes: null,
    }
  }
  if (state.squawk === '7600') {
    return {
      disruptionType: 'UNKNOWN',
      severity: 'HIGH',
      reason: 'Radio failure (squawk 7600)',
      delayMinutes: null,
    }
  }
  if (state.squawk === '7500') {
    return {
      disruptionType: 'UNKNOWN',
      severity: 'CRITICAL',
      reason: 'Unlawful interference (squawk 7500)',
      delayMinutes: null,
    }
  }

  // Stationary on ground
  if (state.on_ground && state.velocity !== null && state.velocity < 1) {
    return {
      disruptionType: 'DELAY',
      severity: 'MEDIUM',
      reason: 'Aircraft stationary on ground',
      delayMinutes: null,
    }
  }

  return { disruptionType: 'DELAY', severity: 'LOW', reason: null, delayMinutes: null }
}

/**
 * Parse an ICAO callsign into IATA-style components.
 * OpenSky uses ICAO callsigns (e.g. "QFA001") — we attempt to map to IATA.
 */
function parseCallsign(
  callsign: string | null
): { airlineIata: string; flightNumber: string } | null {
  if (!callsign) return null
  const trimmed = callsign.trim().toUpperCase()
  if (!trimmed) return null

  const airlines = airlinesData as AirlineMap
  // Find matching airline by ICAO code in callsign prefix
  for (const [iata, airline] of Object.entries(airlines)) {
    const icao = airline.icao?.toUpperCase()
    if (icao && trimmed.startsWith(icao)) {
      const number = trimmed.slice(icao.length)
      return { airlineIata: iata, flightNumber: `${iata}${number}` }
    }
  }

  // Fallback: try 2-letter IATA prefix
  if (trimmed.length >= 3) {
    const prefix = trimmed.slice(0, 2)
    if (airlines[prefix]) {
      return { airlineIata: prefix, flightNumber: trimmed }
    }
  }

  return null
}

/**
 * Transform an OpenSky state vector into a Disruption.
 * Only states that appear to represent disruptions are returned.
 */
async function transformState(state: OpenSkyState): Promise<Disruption | null> {
  const parsed = parseCallsign(state.callsign)
  if (!parsed) return null

  const { airlineIata, flightNumber } = parsed
  const { disruptionType, severity, reason, delayMinutes } = deriveDisruptionDetails(state)

  // Skip fully healthy flights (low severity, no squawk issues)
  // in dev mode we'll show all for testing
  if (process.env.NODE_ENV === 'production' && severity === 'LOW' && !reason) {
    return null
  }

  const urls = getAirlineUrlsSync(airlineIata)
  const airlineName = await getAirlineName(airlineIata)

  const now = new Date().toISOString()
  return {
    id: `opensky-${state.icao24}-${Date.now()}`,
    flightNumber,
    airlineIata,
    airlineName,
    originIata: state.origin_country?.slice(0, 3).toUpperCase() ?? 'UNK',
    destinationIata: 'UNK',
    originName: state.origin_country ?? 'Unknown',
    destinationName: 'Unknown',
    disruptionType,
    severity,
    reason,
    scheduledDep: null,
    estimatedDep: null,
    actualDep: state.on_ground ? null : now,
    delayMinutes,
    gate: null,
    isResolved: false,
    source: 'OPENSKY' as DisruptionSource,
    ...urls,
    createdAt: now,
    updatedAt: now,
  }
}

// =============================================================================
// Mock disruptions for development (when OpenSky returns no disruptions)
// =============================================================================

export function getMockDisruptions(): Disruption[] {
  const now = new Date()
  const make = (
    id: string,
    flightNumber: string,
    airlineIata: string,
    airlineName: string,
    originIata: string,
    destinationIata: string,
    originName: string,
    destinationName: string,
    disruptionType: DisruptionType,
    severity: DisruptionSeverity,
    reason: string,
    delayMinutes: number | null
  ): Disruption => {
    const urls = getAirlineUrlsSync(airlineIata)
    return {
      id,
      flightNumber,
      airlineIata,
      airlineName,
      originIata,
      destinationIata,
      originName,
      destinationName,
      disruptionType,
      severity,
      reason,
      scheduledDep: new Date(now.getTime() - 3600000).toISOString(),
      estimatedDep: delayMinutes
        ? new Date(now.getTime() + delayMinutes * 60000).toISOString()
        : null,
      actualDep: null,
      delayMinutes,
      gate: null,
      isResolved: false,
      source: 'OPENSKY',
      ...urls,
      createdAt: new Date(now.getTime() - 1800000).toISOString(),
      updatedAt: new Date(now.getTime() - 300000).toISOString(),
    }
  }

  return [
    make(
      'mock-1',
      'QF001',
      'QF',
      'Qantas',
      'SYD',
      'LAX',
      'Sydney (Kingsford Smith)',
      'Los Angeles International',
      'DELAY',
      'HIGH',
      'Late arriving inbound aircraft',
      185
    ),
    make(
      'mock-2',
      'VA827',
      'VA',
      'Virgin Australia',
      'MEL',
      'SYD',
      'Melbourne (Tullamarine)',
      'Sydney (Kingsford Smith)',
      'CANCELLED',
      'CRITICAL',
      'Aircraft serviceability issue',
      null
    ),
    make(
      'mock-3',
      'JQ501',
      'JQ',
      'Jetstar',
      'SYD',
      'DRW',
      'Sydney (Kingsford Smith)',
      'Darwin International',
      'DELAY',
      'MEDIUM',
      'Crew rostering disruption',
      75
    ),
    make(
      'mock-4',
      'EK413',
      'EK',
      'Emirates',
      'SYD',
      'DXB',
      'Sydney (Kingsford Smith)',
      'Dubai International',
      'DELAY',
      'LOW',
      'Minor technical issue',
      25
    ),
    make(
      'mock-5',
      'SQ211',
      'SQ',
      'Singapore Airlines',
      'MEL',
      'SIN',
      'Melbourne (Tullamarine)',
      'Singapore Changi',
      'DIVERTED',
      'HIGH',
      'Medical emergency on board — diverting to nearest suitable airport',
      null
    ),
    make(
      'mock-6',
      'QF406',
      'QF',
      'Qantas',
      'ADL',
      'SYD',
      'Adelaide International',
      'Sydney (Kingsford Smith)',
      'GATE_CHANGE',
      'LOW',
      'Gate change: now departing from Gate 24',
      null
    ),
    make(
      'mock-7',
      'ZL6441',
      'ZL',
      'Rex Airlines',
      'OOL',
      'SYD',
      'Gold Coast',
      'Sydney (Kingsford Smith)',
      'CANCELLED',
      'HIGH',
      'Severe thunderstorm warning at Gold Coast',
      null
    ),
  ]
}

// =============================================================================
// Main public API
// =============================================================================

/**
 * Fetch active disruptions from OpenSky Network.
 * Results are cached in Redis for CACHE_TTL.FLIGHT_STATUS seconds.
 * Falls back to mock data in development.
 */
export async function getActiveDisruptions(): Promise<Disruption[]> {
  const cached = await getCache<Disruption[]>(CACHE_KEYS.activeDisruptions)
  if (cached) return cached

  try {
    const disruptions = await fetchFromOpenSky()
    if (disruptions.length > 0) {
      await setCache(CACHE_KEYS.activeDisruptions, disruptions, CACHE_TTL.FLIGHT_STATUS)
      return disruptions
    }

    // OpenSky returned data but no disruptions — use mock in dev
    if (process.env.NODE_ENV !== 'production') {
      return getMockDisruptions()
    }

    return []
  } catch (err) {
    console.error('[aviation] getActiveDisruptions failed:', err)

    // Return stale cache if available
    const stale = await getCache<Disruption[]>(`stale:${CACHE_KEYS.activeDisruptions}`)
    if (stale) return stale

    // Fallback to mock in development
    if (process.env.NODE_ENV !== 'production') {
      return getMockDisruptions()
    }
    return []
  }
}

/**
 * Get a disruption by flight number.
 */
export async function getDisruptionByFlight(flightNumber: string): Promise<Disruption | null> {
  const normalised = flightNumber.trim().toUpperCase()
  const cacheKey = `disruption:flight:${normalised}`

  const cached = await getCache<Disruption>(cacheKey)
  if (cached) return cached

  const all = await getActiveDisruptions()
  const match = all.find((d) => d.flightNumber.toUpperCase() === normalised) ?? null

  if (match) {
    await setCache(cacheKey, match, CACHE_TTL.FLIGHT_DETAIL)
  }
  return match
}

// =============================================================================
// OpenSky fetch
// =============================================================================

async function fetchFromOpenSky(): Promise<Disruption[]> {
  const url = 'https://opensky-network.org/api/states/all'

  const headers: Record<string, string> = {
    'User-Agent': 'TripWatch/1.0 travel-disruption-hub',
  }

  // Use credentials if available for higher rate limits
  if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
    const creds = Buffer.from(
      `${process.env.OPENSKY_USERNAME}:${process.env.OPENSKY_PASSWORD}`
    ).toString('base64')
    headers['Authorization'] = `Basic ${creds}`
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate: CACHE_TTL.OPENSKY_RESPONSE },
  })

  if (!res.ok) {
    throw new Error(`OpenSky API error: ${res.status} ${res.statusText}`)
  }

  // Cache raw OpenSky response
  const raw: OpenSkyResponse = await res.json()
  await setCache(CACHE_KEYS.openSkyRaw, raw, CACHE_TTL.OPENSKY_RESPONSE)

  if (!raw.states) return []

  // Filter to flights with unusual squawk codes or grounded beyond threshold
  const interestingStates = raw.states
    .filter((s) => s.callsign !== null)
    .filter(
      (s) =>
        s.squawk === '7700' ||
        s.squawk === '7600' ||
        s.squawk === '7500' ||
        (s.on_ground && s.velocity !== null && s.velocity < 1)
    )
    // Limit to first 200 states to avoid timeout
    .slice(0, 200)

  const disruptions = await Promise.all(interestingStates.map(transformState))
  return disruptions.filter((d): d is Disruption => d !== null)
}
