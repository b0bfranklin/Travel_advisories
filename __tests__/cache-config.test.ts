import { describe, it, expect } from 'vitest'
import { CACHE_TTL } from '@/lib/cache-config'

describe('CACHE_TTL constants', () => {
  it('FLIGHT_STATUS is 30 seconds', () => {
    expect(CACHE_TTL.FLIGHT_STATUS).toBe(30)
  })

  it('REDIRECT_LOOKUP is 3600 seconds (1 hour)', () => {
    expect(CACHE_TTL.REDIRECT_LOOKUP).toBe(3600)
  })

  it('ARCHIVE_PAGE is 86400 seconds (24 hours)', () => {
    expect(CACHE_TTL.ARCHIVE_PAGE).toBe(86400)
  })

  it('all TTL values are positive integers', () => {
    for (const [key, value] of Object.entries(CACHE_TTL)) {
      expect(value, `${key} should be a positive integer`).toBeGreaterThan(0)
      expect(Number.isInteger(value), `${key} should be an integer`).toBe(true)
    }
  })
})
