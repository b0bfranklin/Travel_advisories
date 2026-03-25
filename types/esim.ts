/**
 * eSIM provider type — matches /data/esim-providers.json structure.
 * The routesThroughChina field is mandatory per editorial policy.
 */
export interface EsimProvider {
  id: string
  name: string
  routesThroughChina: boolean | 'unknown'
  chineseInfrastructureNotes: string | null
  activationMethod: 'app' | 'qr' | 'manual'
  coverageCountries: number
  pricePerGBUSD: number | null
  affiliateUrl: string // Must use /go/[slug] internal redirect
  trustpilotRating: number | null
  appStoreRating: number | null
  website: string
  notes?: string
}
