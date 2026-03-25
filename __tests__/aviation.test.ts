import { describe, it, expect } from 'vitest'
import { getMockDisruptions } from '@/lib/aviation'

describe('getMockDisruptions', () => {
  it('returns an array of disruptions', () => {
    const disruptions = getMockDisruptions()
    expect(Array.isArray(disruptions)).toBe(true)
    expect(disruptions.length).toBeGreaterThan(0)
  })

  it('each disruption has required fields', () => {
    const disruptions = getMockDisruptions()
    for (const d of disruptions) {
      expect(d.id).toBeTruthy()
      expect(d.flightNumber).toBeTruthy()
      expect(d.airlineIata).toBeTruthy()
      expect(d.airlineName).toBeTruthy()
      expect(d.severity).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/)
      expect(d.disruptionType).toBeTruthy()
      expect(d.source).toBe('OPENSKY')
      expect(d.updatedAt).toBeTruthy()
    }
  })

  it('contains at least one CRITICAL disruption', () => {
    const disruptions = getMockDisruptions()
    const critical = disruptions.filter((d) => d.severity === 'CRITICAL')
    expect(critical.length).toBeGreaterThan(0)
  })

  it('contains at least one CANCELLED disruption', () => {
    const disruptions = getMockDisruptions()
    const cancelled = disruptions.filter((d) => d.disruptionType === 'CANCELLED')
    expect(cancelled.length).toBeGreaterThan(0)
  })
})
