import { getCache, setCache, TTL } from './cache'
import type { WeatherData } from '@/types'
import { WEATHER_AIRPORTS } from '@/data/trip'

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'

interface OWMResponse {
  name: string
  main: { temp: number; feels_like: number; humidity: number }
  weather: Array<{ description: string; icon: string }>
  wind: { speed: number }
}

async function fetchWeatherForCity(
  iata: string,
  city: string,
  query: string
): Promise<WeatherData | null> {
  const key = process.env.OPENWEATHERMAP_API_KEY
  if (!key) return null

  try {
    const url = `${OWM_BASE}/weather?q=${encodeURIComponent(query)}&appid=${key}&units=metric`
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null

    const json: OWMResponse = await res.json()
    return {
      iata,
      city,
      tempC: Math.round(json.main.temp),
      feelsLikeC: Math.round(json.main.feels_like),
      description: json.weather[0]?.description ?? 'Unknown',
      iconCode: json.weather[0]?.icon ?? '01d',
      windKph: Math.round((json.wind.speed ?? 0) * 3.6),
      humidity: json.main.humidity,
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function getAllWeather(): Promise<(WeatherData | null)[]> {
  const cacheKey = 'all-weather'
  const cached = getCache<(WeatherData | null)[]>(cacheKey)
  if (cached) return cached

  const results = await Promise.all(
    WEATHER_AIRPORTS.map((a) => fetchWeatherForCity(a.iata, a.city, a.query))
  )

  setCache(cacheKey, results, TTL.WEATHER)
  return results
}
