import { Thermometer, Wind, Droplets } from 'lucide-react'
import type { WeatherData } from '@/types'

interface WeatherStripProps {
  weather: (WeatherData | null)[]
}

// Map OWM icon codes to simple emoji
function weatherEmoji(iconCode: string): string {
  const code = iconCode.replace('d', '').replace('n', '')
  const map: Record<string, string> = {
    '01': '☀️',
    '02': '🌤️',
    '03': '⛅',
    '04': '☁️',
    '09': '🌧️',
    '10': '🌦️',
    '11': '⛈️',
    '13': '🌨️',
    '50': '🌫️',
  }
  return map[code] ?? '🌡️'
}

function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center">
      <div className="text-2xl">{weatherEmoji(data.iconCode)}</div>
      <div className="text-sm font-semibold">{data.iata}</div>
      <div className="text-xs text-muted-foreground">{data.city}</div>
      <div className="text-lg font-bold">{data.tempC}°C</div>
      <div className="text-xs capitalize text-muted-foreground">{data.description}</div>
      <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Wind className="h-3 w-3" /> {data.windKph} km/h
        </span>
        <span className="flex items-center gap-0.5">
          <Droplets className="h-3 w-3" /> {data.humidity}%
        </span>
      </div>
    </div>
  )
}

function WeatherCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center">
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      <div className="h-3 w-10 animate-pulse rounded bg-muted" />
      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
      <div className="h-6 w-12 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function WeatherStrip({ weather }: WeatherStripProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Current Weather
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {weather.length === 0
          ? Array.from({ length: 3 }).map((_, i) => <WeatherCardSkeleton key={i} />)
          : weather.map((w, i) =>
              w ? <WeatherCard key={w.iata} data={w} /> : <WeatherCardSkeleton key={i} />
            )}
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">
        Add <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENWEATHERMAP_API_KEY</code> to
        see live weather
      </p>
    </section>
  )
}
