import type { AdvisoryLevel } from './database'

/**
 * Application-level travel advisory.
 */
export interface TravelAdvisory {
  id: string
  countryCode: string // ISO 3166-1 alpha-2
  countryName: string
  source: 'DFAT' | 'FCDO' | 'STATE_DEPT' | 'NZ_SAFETRAVEL' | 'GLOBAL_AFFAIRS_CA'
  advisoryLevel: AdvisoryLevel
  summary: string | null
  fullText: string | null
  advisoryUrl: string
  lastUpdated: string | null
  fetchedAt: string
}

export interface AdvisoryLevelDisplay {
  level: AdvisoryLevel
  label: string
  colour: string // Tailwind colour class
  description: string
}

export const ADVISORY_LEVEL_DISPLAY: Record<AdvisoryLevel, AdvisoryLevelDisplay> = {
  DO_NOT_TRAVEL: {
    level: 'DO_NOT_TRAVEL',
    label: 'Do Not Travel',
    colour: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    description: 'Highest level of advisory. Do not travel to this destination.',
  },
  RECONSIDER: {
    level: 'RECONSIDER',
    label: 'Reconsider Travel',
    colour: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
    description: 'Reconsider your need to travel to this destination.',
  },
  EXERCISE_CAUTION: {
    level: 'EXERCISE_CAUTION',
    label: 'Exercise High Degree of Caution',
    colour: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    description: 'Exercise a high degree of caution in this destination.',
  },
  NORMAL_PRECAUTIONS: {
    level: 'NORMAL_PRECAUTIONS',
    label: 'Exercise Normal Safety Precautions',
    colour: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    description: 'Exercise normal safety precautions.',
  },
}
