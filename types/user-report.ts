import type { ReportType } from './database'

/**
 * User-submitted disruption report — Phase 2+.
 * Schema prepared; not activated in Phase 1.
 */
export interface UserReport {
  id: string
  flightNumber?: string
  airportIata?: string
  routeFrom?: string
  routeTo?: string
  reportType: ReportType
  description: string // max 280 chars, no PII
  confirmCount: number
  createdAt: string
  expiresAt: string
  isVerified: boolean // true when confirmed by official source
  isFlagged: boolean // admin review queue
}
