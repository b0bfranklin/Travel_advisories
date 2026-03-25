import type { DisruptionType, DisruptionSeverity, DisruptionSource } from './database'

/**
 * Application-level disruption type.
 * This is the canonical shape used throughout the UI and business logic.
 * Transformed from raw API responses by lib/aviation.ts.
 */
export interface Disruption {
  id: string
  flightNumber: string
  airlineIata: string
  airlineName: string
  originIata: string
  destinationIata: string
  originName: string
  destinationName: string
  disruptionType: DisruptionType
  severity: DisruptionSeverity
  reason: string | null
  scheduledDep: string | null // ISO 8601
  estimatedDep: string | null // ISO 8601
  actualDep: string | null // ISO 8601
  delayMinutes: number | null
  gate: string | null
  isResolved: boolean
  source: DisruptionSource
  airlineStatusUrl: string | null
  rebookUrl: string | null
  refundUrl: string | null
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

/**
 * Compact form used in list views and search results.
 */
export type DisruptionSummary = Pick<
  Disruption,
  | 'id'
  | 'flightNumber'
  | 'airlineIata'
  | 'airlineName'
  | 'originIata'
  | 'destinationIata'
  | 'disruptionType'
  | 'severity'
  | 'reason'
  | 'delayMinutes'
  | 'updatedAt'
>

/**
 * API response envelope for the /api/flights endpoint.
 */
export interface DisruptionsApiResponse {
  data: Disruption[]
  meta: {
    total: number
    lastUpdated: string // ISO 8601 — when data was last refreshed from source
    source: DisruptionSource
    cached: boolean
  }
  error?: string
}

/**
 * Search/filter params for the flights hub.
 */
export interface DisruptionFilters {
  query?: string // flight number, IATA code, or airline name
  airlineIata?: string
  originIata?: string
  destinationIata?: string
  severity?: DisruptionSeverity
  disruptionType?: DisruptionType
  dateFrom?: string // ISO date
  dateTo?: string // ISO date
}
