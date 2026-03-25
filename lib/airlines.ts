import type { Airline, AirlineMap } from '@/types'
import airlinesData from '@/data/airlines.json'
import { getCache, setCache } from './cache'
import { CACHE_TTL } from './cache-config'

const CACHE_KEY = 'airlines:all'

/**
 * Get the full airline map.
 * Loaded from static JSON — cached in Redis for performance.
 */
export async function getAirlines(): Promise<AirlineMap> {
  const cached = await getCache<AirlineMap>(CACHE_KEY)
  if (cached) return cached

  const airlines = airlinesData as AirlineMap
  await setCache(CACHE_KEY, airlines, CACHE_TTL.AIRLINE_INFO)
  return airlines
}

/**
 * Get a single airline by IATA code.
 * Returns null if not found.
 */
export async function getAirline(iata: string): Promise<Airline | null> {
  const airlines = await getAirlines()
  return airlines[iata.toUpperCase()] ?? null
}

/**
 * Get airline name by IATA code, with a safe fallback.
 */
export async function getAirlineName(iata: string): Promise<string> {
  const airline = await getAirline(iata)
  return airline?.name ?? iata
}

/**
 * Get airline URLs for status/rebook/refund.
 * Synchronous lookup from the static data — avoids cache round-trip for hot paths.
 */
export function getAirlineUrlsSync(iata: string): {
  airlineStatusUrl: string | null
  rebookUrl: string | null
  refundUrl: string | null
} {
  const airlines = airlinesData as AirlineMap
  const airline = airlines[iata.toUpperCase()]
  return {
    airlineStatusUrl: airline?.statusUrl ?? null,
    rebookUrl: airline?.rebookUrl ?? null,
    refundUrl: airline?.refundUrl ?? null,
  }
}
