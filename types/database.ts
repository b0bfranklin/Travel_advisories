/**
 * Database type definitions — matches the Supabase schema exactly.
 * Generated from 001_initial_schema.sql.
 * Do NOT manually edit column types — update the schema and re-generate.
 */

export type DisruptionType =
  | 'DELAY'
  | 'CANCELLED'
  | 'DIVERTED'
  | 'ROUTE_CHANGE'
  | 'GATE_CHANGE'
  | 'GROUND_STOP'
  | 'UNKNOWN'

export type DisruptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type DisruptionSource =
  | 'OPENSKY'
  | 'AVIATIONSTACK'
  | 'FLIGHTAWARE'
  | 'AIRLINE_FEED'
  | 'MANUAL_ADMIN'
  | 'USER_REPORT'

export type AlertType = 'FLIGHT' | 'ROUTE' | 'AIRLINE' | 'AIRPORT'

export type AdvisoryLevel =
  | 'DO_NOT_TRAVEL'
  | 'RECONSIDER'
  | 'EXERCISE_CAUTION'
  | 'NORMAL_PRECAUTIONS'

export type ReportType =
  | 'DELAY'
  | 'CANCELLATION'
  | 'GATE_CHANGE'
  | 'GROUND_STOP'
  | 'CREW'
  | 'EQUIPMENT'
  | 'OTHER'

// Database row types — mirrors columns exactly
export interface DbDisruption {
  id: string
  flight_number: string
  airline_iata: string
  origin_iata: string | null
  destination_iata: string | null
  origin_name: string | null
  destination_name: string | null
  disruption_type: DisruptionType
  severity: DisruptionSeverity
  reason: string | null
  scheduled_dep: string | null
  estimated_dep: string | null
  actual_dep: string | null
  delay_minutes: number | null
  gate: string | null
  is_resolved: boolean
  source: DisruptionSource
  source_id: string | null
  airline_status_url: string | null
  rebook_url: string | null
  refund_url: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface DbDisruptionArchive {
  id: string
  original_id: string | null
  flight_number: string
  airline_iata: string
  origin_iata: string | null
  destination_iata: string | null
  disruption_type: DisruptionType
  severity: DisruptionSeverity
  reason: string | null
  scheduled_dep: string | null
  actual_dep: string | null
  delay_minutes: number | null
  source: DisruptionSource
  archived_at: string
  event_date: string
}

export interface DbAlertSubscription {
  id: string
  email: string
  alert_type: AlertType
  watch_value: string
  email_verified: boolean
  verify_token: string | null
  verify_token_expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface DbRedirect {
  id: string
  slug: string
  destination: string
  label: string | null
  is_active: boolean
  click_count: number
  last_clicked: string | null
  created_at: string
  updated_at: string
}

export interface DbAffiliateClick {
  id: string
  slug: string
  referrer: string | null
  user_agent_hash: string | null
  clicked_at: string
}

export interface DbTravelAdvisory {
  id: string
  country_code: string
  country_name: string
  source: string
  advisory_level: AdvisoryLevel
  summary: string | null
  full_text: string | null
  advisory_url: string
  last_updated: string | null
  fetched_at: string
}

export interface DbWeatherAlert {
  id: string
  airport_iata: string
  event_type: string
  headline: string
  description: string | null
  severity: string | null
  source: string
  starts_at: string | null
  expires_at: string | null
  fetched_at: string
}

export interface DbSourceHealth {
  id: string
  source_name: string
  last_check_at: string | null
  last_status: number | null
  last_success_at: string | null
  response_ms: number | null
  error_message: string | null
  consecutive_failures: number
}

export interface DbAdmin {
  id: string
  email: string
  created_at: string
}

export interface DbAdminAuditLog {
  id: string
  admin_email: string
  action: string
  entity_type: string | null
  entity_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

export interface DbUserReport {
  id: string
  flight_number: string | null
  airport_iata: string | null
  route_from: string | null
  route_to: string | null
  report_type: ReportType
  description: string
  confirm_count: number
  is_verified: boolean
  is_flagged: boolean
  is_active: boolean
  created_at: string
  expires_at: string
}

// Supabase Database type map — used by createClient<Database>()
export interface Database {
  public: {
    Tables: {
      disruptions: {
        Row: DbDisruption
        Insert: Omit<DbDisruption, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DbDisruption, 'id' | 'created_at'>>
      }
      disruptions_archive: {
        Row: DbDisruptionArchive
        Insert: Omit<DbDisruptionArchive, 'id' | 'archived_at'>
        Update: never
      }
      alert_subscriptions: {
        Row: DbAlertSubscription
        Insert: Omit<DbAlertSubscription, 'id' | 'created_at'>
        Update: Partial<Omit<DbAlertSubscription, 'id' | 'created_at'>>
      }
      redirects: {
        Row: DbRedirect
        Insert: Omit<DbRedirect, 'id' | 'created_at' | 'updated_at' | 'click_count'>
        Update: Partial<Omit<DbRedirect, 'id' | 'created_at'>>
      }
      affiliate_clicks: {
        Row: DbAffiliateClick
        Insert: Omit<DbAffiliateClick, 'id' | 'clicked_at'>
        Update: never
      }
      travel_advisories: {
        Row: DbTravelAdvisory
        Insert: Omit<DbTravelAdvisory, 'id' | 'fetched_at'>
        Update: Partial<Omit<DbTravelAdvisory, 'id' | 'fetched_at'>>
      }
      weather_alerts: {
        Row: DbWeatherAlert
        Insert: Omit<DbWeatherAlert, 'id' | 'fetched_at'>
        Update: Partial<Omit<DbWeatherAlert, 'id' | 'fetched_at'>>
      }
      source_health: {
        Row: DbSourceHealth
        Insert: Omit<DbSourceHealth, 'id'>
        Update: Partial<Omit<DbSourceHealth, 'id'>>
      }
      admins: {
        Row: DbAdmin
        Insert: Omit<DbAdmin, 'id' | 'created_at'>
        Update: never
      }
      admin_audit_log: {
        Row: DbAdminAuditLog
        Insert: Omit<DbAdminAuditLog, 'id' | 'created_at'>
        Update: never
      }
      user_reports: {
        Row: DbUserReport
        Insert: Omit<DbUserReport, 'id' | 'created_at' | 'expires_at' | 'confirm_count'>
        Update: Partial<Omit<DbUserReport, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      disruption_type: DisruptionType
      disruption_severity: DisruptionSeverity
      disruption_source: DisruptionSource
      alert_type: AlertType
      advisory_level: AdvisoryLevel
      report_type: ReportType
    }
  }
}
