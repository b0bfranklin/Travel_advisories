import { Redis } from '@upstash/redis'

/**
 * Redis cache helpers.
 * Wraps Upstash Redis with a consistent interface.
 * Falls back gracefully when Redis is unavailable (dev without env vars).
 */

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return redis
}

/**
 * Get a cached value by key.
 * Returns null if the key doesn't exist or Redis is unavailable.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const value = await client.get<T>(key)
    return value
  } catch (err) {
    console.warn(`[cache] getCache failed for key "${key}":`, err)
    return null
  }
}

/**
 * Set a cached value with a TTL in seconds.
 * Silently fails when Redis is unavailable.
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.set(key, value, { ex: ttlSeconds })
  } catch (err) {
    console.warn(`[cache] setCache failed for key "${key}":`, err)
  }
}

/**
 * Delete a cache key.
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.del(key)
  } catch (err) {
    console.warn(`[cache] deleteCache failed for key "${key}":`, err)
  }
}

/**
 * Cache-aside helper.
 * Fetches from cache; on miss, calls the fetcher and caches the result.
 *
 * @param key       Cache key
 * @param ttl       TTL in seconds
 * @param fetcher   Async function to fetch fresh data
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await getCache<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  await setCache(key, fresh, ttl)
  return fresh
}
