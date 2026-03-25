import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate limiting via Upstash Redis.
 * All public API routes must be rate-limited.
 *
 * Usage:
 *   const { success, limit, remaining, reset } = await rateLimiters.api.limit(ip)
 *   if (!success) return new Response('Too many requests', { status: 429 })
 */

// Lazily create the Redis client — avoids errors if env vars are missing during build
function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

function createRatelimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  const redis = getRedis()
  if (!redis) {
    // In development without Redis, return a no-op limiter
    return {
      limit: async (_identifier: string) => ({
        success: true,
        limit: requests,
        remaining: requests,
        reset: Date.now() + 60000,
      }),
    }
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: '@upstash/ratelimit',
  })
}

/**
 * Rate limiters for each route category.
 * Adjust limits based on expected traffic and cost.
 */
export const rateLimiters = {
  /** General API routes — 60 requests per minute per IP */
  api: createRatelimiter(60, '1 m'),

  /** Flight search — slightly more generous for good UX */
  flights: createRatelimiter(30, '1 m'),

  /** Alert subscription endpoint — 5 per hour per IP to prevent abuse */
  alertSubscribe: createRatelimiter(5, '1 h'),

  /** Affiliate redirect — 60 per minute (generous to not block legitimate clicks) */
  affiliateRedirect: createRatelimiter(60, '1 m'),

  /** Admin endpoints — 120 per minute (admin users should not be rate-limited heavily) */
  admin: createRatelimiter(120, '1 m'),
}

/**
 * Extract the real IP from a request, respecting Vercel/Cloudflare proxy headers.
 */
export function getIpFromRequest(request: Request): string {
  // Vercel sets x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare sets cf-connecting-ip
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Fallback — unknown (development/test)
  return '127.0.0.1'
}
