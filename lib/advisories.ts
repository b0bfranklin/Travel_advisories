import { getCache, setCache, TTL } from './cache'
import type { AdvisoryData, AdvisoryLevel } from '@/types'
import { ADVISORY_COUNTRIES } from '@/data/trip'

// Static fallback data — updated March 2026
// Source: https://www.smartraveller.gov.au
// These are checked regularly and represent known-good defaults if the live fetch fails
const STATIC_ADVISORIES: AdvisoryData[] = [
  {
    country: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    flag: '🇦🇪',
    level: 2,
    levelLabel: 'Exercise a high degree of caution',
    summary:
      'Exercise a high degree of caution in the UAE due to the threat of terrorism and the regional security situation. The ongoing conflict in the Middle East, including tensions with Iran, may affect the region. Monitor official sources and follow the advice of local authorities. Dubai itself remains generally safe for tourists.',
    lastFetched: '2026-03-26T00:00:00Z',
    dfatUrl: 'https://www.smartraveller.gov.au/destinations/middle-east/united-arab-emirates',
    isLive: false,
  },
  {
    country: 'Germany',
    slug: 'germany',
    flag: '🇩🇪',
    level: 1,
    levelLabel: 'Exercise normal safety precautions',
    summary:
      'Exercise normal safety precautions in Germany. There is an ongoing threat of terrorism. Be alert in public places and follow the advice of local authorities.',
    lastFetched: '2026-03-26T00:00:00Z',
    dfatUrl: 'https://www.smartraveller.gov.au/destinations/europe/germany',
    isLive: false,
  },
]

// Attempt to extract advisory level from the Smartraveller page HTML
function extractAdvisoryLevel(html: string): { level: AdvisoryLevel; summary: string } | null {
  // Smartraveller uses a structured advisory level block
  const levelPatterns: Array<{ level: AdvisoryLevel; pattern: RegExp }> = [
    { level: 4, pattern: /do not travel/i },
    { level: 3, pattern: /reconsider your need to travel/i },
    { level: 2, pattern: /exercise a high degree of caution/i },
    { level: 1, pattern: /exercise normal safety precautions/i },
  ]

  for (const { level, pattern } of levelPatterns) {
    if (pattern.test(html)) {
      // Try to extract a brief summary sentence
      const match = html.match(/<meta name="description" content="([^"]{20,300})"/i)
      const summary = match ? match[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'") : ''
      return { level, summary }
    }
  }
  return null
}

async function fetchAdvisory(
  slug: string,
  dfatUrl: string,
  fallback: AdvisoryData
): Promise<AdvisoryData> {
  try {
    const res = await fetch(dfatUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'EK-Trip-Dashboard/1.0 (personal use)' },
    })
    if (!res.ok) return fallback

    const html = await res.text()
    const extracted = extractAdvisoryLevel(html)
    if (!extracted) return fallback

    const levelLabels: Record<AdvisoryLevel, string> = {
      1: 'Exercise normal safety precautions',
      2: 'Exercise a high degree of caution',
      3: 'Reconsider your need to travel',
      4: 'Do not travel',
    }

    return {
      ...fallback,
      level: extracted.level,
      levelLabel: levelLabels[extracted.level],
      summary: extracted.summary || fallback.summary,
      lastFetched: new Date().toISOString(),
      isLive: true,
    }
  } catch {
    return fallback
  }
}

export async function getAllAdvisories(): Promise<AdvisoryData[]> {
  const cacheKey = 'all-advisories'
  const cached = getCache<AdvisoryData[]>(cacheKey)
  if (cached) return cached

  const results = await Promise.all(
    ADVISORY_COUNTRIES.map((country) => {
      const fallback = STATIC_ADVISORIES.find((a) => a.slug === country.slug)!
      return fetchAdvisory(country.slug, country.dfatUrl, fallback)
    })
  )

  setCache(cacheKey, results, TTL.ADVISORY)
  return results
}
