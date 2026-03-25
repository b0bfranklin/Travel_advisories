import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimiters, getIpFromRequest } from '@/lib/ratelimit'
import { getCache, setCache } from '@/lib/cache'
import { getActiveDisruptions, getDisruptionByFlight } from '@/lib/aviation'
import { CACHE_TTL } from '@/lib/cache-config'

const searchSchema = z.object({
  flightNumber: z.string().min(2).max(10).optional(),
  airlineIata: z.string().length(2).optional(),
  originIata: z.string().length(3).optional(),
  destinationIata: z.string().length(3).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
})

export async function GET(request: NextRequest) {
  // 1. Rate limit
  const ip = getIpFromRequest(request)
  const { success: rateLimitOk } = await rateLimiters.flights.limit(ip)
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // 2. Parse and validate query params
  const { searchParams } = new URL(request.url)
  const rawParams = {
    flightNumber: searchParams.get('flightNumber') ?? undefined,
    airlineIata: searchParams.get('airlineIata') ?? undefined,
    originIata: searchParams.get('originIata') ?? undefined,
    destinationIata: searchParams.get('destinationIata') ?? undefined,
    severity: searchParams.get('severity') ?? undefined,
  }

  const parsed = searchSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const params = parsed.data

  // 3. Build cache key based on query
  const cacheKey = `api:flights:${JSON.stringify(params)}`
  const cached = await getCache(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': `public, s-maxage=${CACHE_TTL.FLIGHT_STATUS}, stale-while-revalidate=10`,
      },
    })
  }

  // 4. Fetch data
  let disruptions = await getActiveDisruptions()

  // 5. Apply filters
  if (params.flightNumber) {
    const single = await getDisruptionByFlight(params.flightNumber)
    disruptions = single ? [single] : []
  } else {
    if (params.airlineIata) {
      disruptions = disruptions.filter(
        (d) => d.airlineIata.toUpperCase() === params.airlineIata!.toUpperCase()
      )
    }
    if (params.originIata) {
      disruptions = disruptions.filter(
        (d) => d.originIata.toUpperCase() === params.originIata!.toUpperCase()
      )
    }
    if (params.destinationIata) {
      disruptions = disruptions.filter(
        (d) => d.destinationIata.toUpperCase() === params.destinationIata!.toUpperCase()
      )
    }
    if (params.severity) {
      disruptions = disruptions.filter((d) => d.severity === params.severity)
    }
  }

  const responseBody = {
    data: disruptions,
    meta: {
      total: disruptions.length,
      lastUpdated: new Date().toISOString(),
      source: 'OPENSKY' as const,
      cached: false,
    },
  }

  // 6. Cache the response
  await setCache(cacheKey, responseBody, CACHE_TTL.FLIGHT_STATUS)

  return NextResponse.json(responseBody, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': `public, s-maxage=${CACHE_TTL.FLIGHT_STATUS}, stale-while-revalidate=10`,
    },
  })
}
