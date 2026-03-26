export type FlightStatus =
  | 'scheduled'
  | 'active'
  | 'landed'
  | 'cancelled'
  | 'diverted'
  | 'incident'
  | 'unknown'

// 1 = normal precautions, 2 = high degree of caution, 3 = reconsider, 4 = do not travel
export type AdvisoryLevel = 1 | 2 | 3 | 4

export interface FlightStatusData {
  flightNumber: string
  status: FlightStatus
  departure: {
    scheduled: string
    actual: string | null
    estimated: string | null
    delay: number | null // minutes
    terminal: string | null
    gate: string | null
  }
  arrival: {
    scheduled: string
    actual: string | null
    estimated: string | null
    delay: number | null // minutes
    terminal: string | null
    gate: string | null
  }
  aircraft: string | null
  updatedAt: string
}

export interface WeatherData {
  iata: string
  city: string
  tempC: number
  feelsLikeC: number
  description: string
  iconCode: string
  windKph: number
  humidity: number
  updatedAt: string
}

export interface AdvisoryData {
  country: string
  slug: string
  flag: string
  level: AdvisoryLevel
  levelLabel: string
  summary: string
  lastFetched: string
  dfatUrl: string
  // true if we got live data from DFAT, false = static fallback
  isLive: boolean
}
