/**
 * Airline data types — matches /data/airlines.json structure.
 */
export interface Airline {
  iata: string // 2-letter IATA code, e.g. "QF"
  icao?: string // 3-letter ICAO code, e.g. "QFA"
  name: string // Full name, e.g. "Qantas"
  country: string // ISO 3166-1 alpha-2 country code, e.g. "AU"
  logoUrl?: string // URL to airline logo (from CDN)
  statusUrl: string // Direct link to airline's flight status page
  rebookUrl?: string // Direct link to rebooking page
  refundUrl?: string // Direct link to refund/compensation claim page
  website?: string // Airline home page
}

export type AirlineMap = Record<string, Airline>
