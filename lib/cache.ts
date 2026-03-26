// Simple in-memory cache — no Redis needed for a single-instance personal app
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, CacheEntry<any>>()

export function getCache<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T, ttlSeconds: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function deleteCache(key: string): void {
  store.delete(key)
}

// TTL constants (seconds)
export const TTL = {
  FLIGHT_STATUS: 5 * 60, // 5 minutes — balance between freshness and free-tier quota
  WEATHER: 30 * 60, // 30 minutes
  ADVISORY: 6 * 60 * 60, // 6 hours
} as const
