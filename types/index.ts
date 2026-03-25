/**
 * Central type exports.
 * Import all app types from '@/types'.
 */

// Database schema types
export type {
  DisruptionType,
  DisruptionSeverity,
  DisruptionSource,
  AlertType,
  AdvisoryLevel,
  ReportType,
  Database,
  DbDisruption,
  DbDisruptionArchive,
  DbAlertSubscription,
  DbRedirect,
  DbAffiliateClick,
  DbTravelAdvisory,
  DbWeatherAlert,
  DbSourceHealth,
  DbAdmin,
  DbAdminAuditLog,
  DbUserReport,
} from './database'

// Disruption types
export type {
  Disruption,
  DisruptionSummary,
  DisruptionsApiResponse,
  DisruptionFilters,
} from './disruption'

// Airline types
export type { Airline, AirlineMap } from './airline'

// Insurance types
export type { InsuranceProvider, CreditCardInsurance } from './insurance'

// Advisory types
export type { TravelAdvisory, AdvisoryLevelDisplay } from './advisory'
export { ADVISORY_LEVEL_DISPLAY } from './advisory'

// eSIM types
export type { EsimProvider } from './esim'

// Alert types
export type {
  AlertSubscription,
  CreateAlertSubscriptionInput,
  AlertNotificationPayload,
} from './alert'

// User report types (Phase 2+)
export type { UserReport } from './user-report'
