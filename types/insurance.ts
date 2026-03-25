/**
 * Insurance provider type — from CLAUDE.md InsuranceProvider interface.
 * All fields from the spec are represented.
 */
export interface InsuranceProvider {
  id: string
  name: string
  logoUrl: string
  primaryMarket: string[] // e.g. ["AU", "NZ", "GLOBAL"]
  underwriter?: string
  quoteUrl: string
  affiliateUrl?: string
  pdsUrl: string // MANDATORY — Product Disclosure Statement URL

  medicalCoverageAUD?: number | 'unlimited'
  cancellationCoverageAUD?: number | 'unlimited'
  luggageCoverageAUD?: number
  evacuationCoverageAUD?: number | 'unlimited'
  delayThresholdHours?: number
  rentalCarExcessAUD?: number
  personalLiabilityAUD?: number

  policyTypes: Array<
    | 'single'
    | 'annual-multi-trip'
    | 'duo'
    | 'family'
    | 'backpacker'
    | 'cruise'
    | 'ski'
    | 'medical-only'
  >

  exclusions: {
    bloodAlcoholLimitMgPer100ml?: number | null // null = not specified in PDS
    bloodAlcoholNotes?: string
    adventureActivitiesExcluded: string[]
    adventureActivitiesIncluded: string[]
    adventurePackAvailable: boolean
    warExclusion: boolean
    forceMajeureClause: boolean
    forceMajeureBlocksYourRefund: boolean // KEY consumer protection flag
    forceMajeureNotes?: string
    pandemicCoverage: boolean
    pandemicCoverageNotes?: string
    preExistingConditions:
      | 'excluded'
      | 'declared-and-assessed'
      | 'auto-covered-listed'
      | 'covered-with-upgrade'
    preExistingConditionsNotes?: string
    pregnancyWeekLimit?: number
    ageLimit?: number | null // null = no age limit
    governmentAdvisoryLevel: 'do-not-travel' | 'reconsider' | 'exercise-caution'
  }

  airlineRefusalProtection: boolean // Pays if airline cites force majeure and refuses refund
  airlineRefusalNotes?: string

  suitableForNomads: boolean
  subscriptionModel: boolean
  maxTripDurationDays?: number

  productReviewRating?: number
  trustpilotRating?: number

  lastReviewed: string // ISO date — MUST be updated when PDS is verified
  pdsSourceUrl: string
  reviewNotes?: string
  isAffiliate: boolean // Transparency flag — always visible to user
}

/**
 * Credit card with complimentary travel insurance.
 * Used for /insurance/credit-cards page.
 */
export interface CreditCardInsurance {
  id: string
  cardName: string
  issuer: string
  annualFeeAUD: number
  insurer: string
  underwriter: string
  medicalCoverageAUD: number | 'unlimited'
  cancellationCoverageAUD: number | 'unlimited'
  luggageCoverageAUD: number
  activationRequirement: string // What you must do to activate cover
  preExistingConditions: string
  cruiseCovered: boolean
  keyExclusions: string[]
  pdsUrl: string
  applyUrl: string // Links to Finder/Canstar (affiliate)
  lastReviewed: string // ISO date
}
