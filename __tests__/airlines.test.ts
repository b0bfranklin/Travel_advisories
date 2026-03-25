import { describe, it, expect } from 'vitest'
import airlinesData from '@/data/airlines.json'
import type { AirlineMap } from '@/types'

const airlines = airlinesData as AirlineMap

describe('airlines.json', () => {
  it('contains at least 20 airlines', () => {
    expect(Object.keys(airlines).length).toBeGreaterThanOrEqual(20)
  })

  it('contains all major AU carriers', () => {
    expect(airlines['QF']?.name).toBe('Qantas')
    expect(airlines['JQ']?.name).toBe('Jetstar')
    expect(airlines['VA']?.name).toBe('Virgin Australia')
    expect(airlines['ZL']?.name).toBe('Rex Airlines')
  })

  it('each airline has required fields', () => {
    for (const [iata, airline] of Object.entries(airlines)) {
      expect(airline.iata, `${iata}: iata`).toBe(iata)
      expect(airline.name, `${iata}: name`).toBeTruthy()
      expect(airline.country, `${iata}: country`).toBeTruthy()
      expect(airline.statusUrl, `${iata}: statusUrl`).toBeTruthy()
    }
  })

  it('each statusUrl is a valid https URL', () => {
    for (const [iata, airline] of Object.entries(airlines)) {
      expect(airline.statusUrl, `${iata}: statusUrl should be https`).toMatch(/^https:\/\//)
    }
  })
})
