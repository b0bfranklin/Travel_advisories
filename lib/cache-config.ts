/**
 * Cache TTL (Time To Live) constants in seconds.
 * Used by both the Redis cache layer and Next.js ISR revalidation.
 * Defined centrally so all callers stay in sync.
 */
export const CACHE_TTL = {
  /** Live flight status — aggressive refresh for real-time feel */
  FLIGHT_STATUS: 30,

  /** OpenSky API response — cache the raw API response */
  OPENSKY_RESPONSE: 60,

  /** Individual flight lookup */
  FLIGHT_DETAIL: 30,

  /** Airline info (logos, URLs) — rarely changes */
  AIRLINE_INFO: 3600,

  /** Government travel advisories — refreshed every 6 hours by cron */
  TRAVEL_ADVISORY: 3600,

  /** Weather alerts — 15-minute refresh cycle */
  WEATHER_ALERTS: 900,

  /** Weather widget data for airport pages */
  WEATHER_WIDGET: 900,

  /** Insurance provider data — changes only on manual admin update */
  INSURANCE_PROVIDER: 3600,

  /** Affiliate redirect lookup — long TTL, invalidated on admin update */
  REDIRECT_LOOKUP: 3600,

  /** Source health status (API last-check results) */
  SOURCE_HEALTH: 120,

  /** Admin session checks */
  ADMIN_SESSION: 300,

  /** Search results */
  SEARCH_RESULTS: 15,

  /** Disruption archive pages (ISR) */
  ARCHIVE_PAGE: 86400,
} as const

export type CacheTTLKey = keyof typeof CACHE_TTL
