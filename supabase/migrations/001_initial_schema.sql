-- =============================================================================
-- Travel Disruption & Advisory Hub — Initial Database Schema
-- Migration: 001_initial_schema
-- =============================================================================
-- Row Level Security (RLS) is enabled on all tables.
-- Public read access is granted on appropriate tables via policies.
-- Admin write access requires service role key (server-side only).
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE disruption_type AS ENUM (
  'DELAY',
  'CANCELLED',
  'DIVERTED',
  'ROUTE_CHANGE',
  'GATE_CHANGE',
  'GROUND_STOP',
  'UNKNOWN'
);

CREATE TYPE disruption_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE disruption_source AS ENUM (
  'OPENSKY',
  'AVIATIONSTACK',
  'FLIGHTAWARE',
  'AIRLINE_FEED',
  'MANUAL_ADMIN',
  'USER_REPORT'
);

CREATE TYPE alert_type AS ENUM ('FLIGHT', 'ROUTE', 'AIRLINE', 'AIRPORT');

CREATE TYPE advisory_level AS ENUM (
  'DO_NOT_TRAVEL',
  'RECONSIDER',
  'EXERCISE_CAUTION',
  'NORMAL_PRECAUTIONS'
);

CREATE TYPE report_type AS ENUM (
  'DELAY',
  'CANCELLATION',
  'GATE_CHANGE',
  'GROUND_STOP',
  'CREW',
  'EQUIPMENT',
  'OTHER'
);

-- =============================================================================
-- TABLE: disruptions
-- Live flight disruptions. Records older than 48 hours are archived nightly.
-- =============================================================================
CREATE TABLE disruptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number     TEXT NOT NULL,
  airline_iata      TEXT NOT NULL,             -- e.g. "QF"
  origin_iata       TEXT,                      -- departure airport IATA code
  destination_iata  TEXT,                      -- arrival airport IATA code
  origin_name       TEXT,                      -- human-readable airport name
  destination_name  TEXT,
  disruption_type   disruption_type NOT NULL DEFAULT 'UNKNOWN',
  severity          disruption_severity NOT NULL DEFAULT 'MEDIUM',
  reason            TEXT,                      -- free-text reason (from API or admin)
  scheduled_dep     TIMESTAMPTZ,               -- originally scheduled departure
  estimated_dep     TIMESTAMPTZ,               -- current estimated departure
  actual_dep        TIMESTAMPTZ,               -- actual departure (null if not yet departed)
  delay_minutes     INTEGER,                   -- computed delay in minutes
  gate              TEXT,                      -- gate assignment (if known)
  is_resolved       BOOLEAN NOT NULL DEFAULT FALSE,
  source            disruption_source NOT NULL DEFAULT 'OPENSKY',
  source_id         TEXT,                      -- external ID from the data source
  airline_status_url TEXT,                     -- direct link to airline status page
  rebook_url        TEXT,                      -- direct link to rebooking page
  refund_url        TEXT,                      -- direct link to refund page
  raw_data          JSONB,                     -- original API response (for debugging)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disruptions_flight_number ON disruptions (flight_number);
CREATE INDEX idx_disruptions_airline_iata ON disruptions (airline_iata);
CREATE INDEX idx_disruptions_origin_iata ON disruptions (origin_iata);
CREATE INDEX idx_disruptions_destination_iata ON disruptions (destination_iata);
CREATE INDEX idx_disruptions_severity ON disruptions (severity);
CREATE INDEX idx_disruptions_created_at ON disruptions (created_at DESC);
CREATE INDEX idx_disruptions_is_resolved ON disruptions (is_resolved) WHERE is_resolved = FALSE;

ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;

-- Public can read all non-archived disruptions
CREATE POLICY "disruptions_public_read" ON disruptions
  FOR SELECT USING (TRUE);

-- Only service role (server-side) can insert/update/delete
CREATE POLICY "disruptions_service_write" ON disruptions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: disruptions_archive
-- Disruptions older than 48h, moved here by nightly cron.
-- Used for historical search and SEO archive pages.
-- =============================================================================
CREATE TABLE disruptions_archive (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_id       UUID,                      -- references the live table ID before archive
  flight_number     TEXT NOT NULL,
  airline_iata      TEXT NOT NULL,
  origin_iata       TEXT,
  destination_iata  TEXT,
  disruption_type   disruption_type NOT NULL,
  severity          disruption_severity NOT NULL,
  reason            TEXT,
  scheduled_dep     TIMESTAMPTZ,
  actual_dep        TIMESTAMPTZ,
  delay_minutes     INTEGER,
  source            disruption_source NOT NULL,
  archived_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_date        DATE NOT NULL              -- indexed for monthly archive pages
);

CREATE INDEX idx_archive_airline_iata ON disruptions_archive (airline_iata);
CREATE INDEX idx_archive_origin_iata ON disruptions_archive (origin_iata);
CREATE INDEX idx_archive_destination_iata ON disruptions_archive (destination_iata);
CREATE INDEX idx_archive_event_date ON disruptions_archive (event_date DESC);
CREATE INDEX idx_archive_flight_number ON disruptions_archive (flight_number);

ALTER TABLE disruptions_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archive_public_read" ON disruptions_archive
  FOR SELECT USING (TRUE);

CREATE POLICY "archive_service_write" ON disruptions_archive
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: alert_subscriptions
-- User email/SMS subscriptions for disruption alerts.
-- No account required — verified by email token.
-- =============================================================================
CREATE TABLE alert_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  alert_type      alert_type NOT NULL,
  -- For FLIGHT: flight number. ROUTE: "SYD-MEL". AIRLINE: IATA. AIRPORT: IATA.
  watch_value     TEXT NOT NULL,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  verify_token    TEXT UNIQUE,                 -- single-use email verification token
  verify_token_expires_at TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- PII: email is stored; no IP retained beyond 24h via cron (see cron docs)
  CONSTRAINT alert_subscriptions_email_type_value_unique UNIQUE (email, alert_type, watch_value)
);

CREATE INDEX idx_alert_subs_email ON alert_subscriptions (email);
CREATE INDEX idx_alert_subs_watch_value ON alert_subscriptions (watch_value);
CREATE INDEX idx_alert_subs_active ON alert_subscriptions (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_alert_subs_alert_type ON alert_subscriptions (alert_type);

ALTER TABLE alert_subscriptions ENABLE ROW LEVEL SECURITY;

-- No public read — subscriptions are private
CREATE POLICY "alert_subs_service_only" ON alert_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: redirects
-- Affiliate /go/[slug] redirect table.
-- =============================================================================
CREATE TABLE redirects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT NOT NULL UNIQUE,          -- e.g. "airalo", "world-nomads"
  destination   TEXT NOT NULL,                -- the actual affiliate URL
  label         TEXT,                         -- human-readable label for admin
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  click_count   BIGINT NOT NULL DEFAULT 0,
  last_clicked  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redirects_slug ON redirects (slug);
CREATE INDEX idx_redirects_active ON redirects (is_active) WHERE is_active = TRUE;

ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Slug lookups are public (for redirect resolution)
CREATE POLICY "redirects_public_read" ON redirects
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "redirects_service_write" ON redirects
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: affiliate_clicks
-- Logs each click through an affiliate redirect link.
-- NO IP stored — only slug, referrer, and hashed user agent.
-- =============================================================================
CREATE TABLE affiliate_clicks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL,
  referrer        TEXT,                        -- HTTP Referer header (may be null)
  user_agent_hash TEXT,                        -- SHA-256 hash of user agent (no PII)
  clicked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_slug ON affiliate_clicks (slug);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks (clicked_at DESC);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- No public read
CREATE POLICY "affiliate_clicks_service_only" ON affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: travel_advisories
-- Government travel advisory data. Refreshed every 6 hours by cron.
-- =============================================================================
CREATE TABLE travel_advisories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code    TEXT NOT NULL,               -- ISO 3166-1 alpha-2
  country_name    TEXT NOT NULL,
  source          TEXT NOT NULL,               -- 'DFAT', 'FCDO', 'STATE_DEPT', etc.
  advisory_level  advisory_level NOT NULL,
  summary         TEXT,
  full_text       TEXT,
  advisory_url    TEXT NOT NULL,               -- link to official advisory page
  last_updated    TIMESTAMPTZ,                 -- when the source last updated this advisory
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT advisories_country_source_unique UNIQUE (country_code, source)
);

CREATE INDEX idx_advisories_country_code ON travel_advisories (country_code);
CREATE INDEX idx_advisories_level ON travel_advisories (advisory_level);

ALTER TABLE travel_advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisories_public_read" ON travel_advisories
  FOR SELECT USING (TRUE);

CREATE POLICY "advisories_service_write" ON travel_advisories
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: weather_alerts
-- Active severe weather warnings linked to airports.
-- Refreshed every 15 minutes by cron.
-- =============================================================================
CREATE TABLE weather_alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airport_iata  TEXT NOT NULL,
  event_type    TEXT NOT NULL,                 -- e.g. "THUNDERSTORM", "CYCLONE", "FOG"
  headline      TEXT NOT NULL,
  description   TEXT,
  severity      TEXT,                          -- 'Minor', 'Moderate', 'Severe', 'Extreme'
  source        TEXT NOT NULL,                 -- 'BOM', 'NWS', 'MET_OFFICE'
  starts_at     TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weather_alerts_airport ON weather_alerts (airport_iata);
CREATE INDEX idx_weather_alerts_expires ON weather_alerts (expires_at);

ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weather_alerts_public_read" ON weather_alerts
  FOR SELECT USING (TRUE);

CREATE POLICY "weather_alerts_service_write" ON weather_alerts
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: source_health
-- Tracks last-check status of all external data sources.
-- Used by admin system health dashboard.
-- =============================================================================
CREATE TABLE source_health (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name     TEXT NOT NULL UNIQUE,        -- e.g. 'OPENSKY', 'AVIATIONSTACK', 'BOM'
  last_check_at   TIMESTAMPTZ,
  last_status     INTEGER,                     -- HTTP status code of last response
  last_success_at TIMESTAMPTZ,
  response_ms     INTEGER,                     -- response time in milliseconds
  error_message   TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE source_health ENABLE ROW LEVEL SECURITY;

-- Admins read via service role
CREATE POLICY "source_health_service_only" ON source_health
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: admins
-- Whitelist of email addresses allowed to access /admin routes.
-- =============================================================================
CREATE TABLE admins (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_service_only" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: admin_audit_log
-- Immutable log of all admin actions (who, what, when).
-- =============================================================================
CREATE TABLE admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,                  -- e.g. 'UPDATE_DISRUPTION', 'ADD_REDIRECT'
  entity_type TEXT,                           -- e.g. 'disruption', 'redirect'
  entity_id   TEXT,
  payload     JSONB,                          -- what was changed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_admin ON admin_audit_log (admin_email);
CREATE INDEX idx_audit_log_created ON admin_audit_log (created_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_service_only" ON admin_audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE: user_reports  (Phase 2+ — schema prepared, not activated in Phase 1)
-- User-submitted crowd-sourced disruption reports.
-- =============================================================================
CREATE TABLE user_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number   TEXT,
  airport_iata    TEXT,
  route_from      TEXT,
  route_to        TEXT,
  report_type     report_type NOT NULL,
  description     TEXT NOT NULL CHECK (char_length(description) <= 280),
  confirm_count   INTEGER NOT NULL DEFAULT 0,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours')
  -- NO IP stored — anonymised at collection per GDPR
);

CREATE INDEX idx_user_reports_flight ON user_reports (flight_number);
CREATE INDEX idx_user_reports_airport ON user_reports (airport_iata);
CREATE INDEX idx_user_reports_expires ON user_reports (expires_at);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Phase 2+: public read of active, non-flagged reports
CREATE POLICY "user_reports_public_read" ON user_reports
  FOR SELECT USING (is_active = TRUE AND is_flagged = FALSE AND expires_at > NOW());

CREATE POLICY "user_reports_public_insert" ON user_reports
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "user_reports_service_write" ON user_reports
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp on disruptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER disruptions_updated_at
  BEFORE UPDATE ON disruptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER redirects_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED: Initial source health rows for known data sources
-- =============================================================================
INSERT INTO source_health (source_name) VALUES
  ('OPENSKY'),
  ('AVIATIONSTACK'),
  ('FLIGHTAWARE'),
  ('BOM_WEATHER'),
  ('OPENWEATHERMAP'),
  ('DFAT_ADVISORIES'),
  ('FCDO_ADVISORIES'),
  ('STATE_DEPT_ADVISORIES')
ON CONFLICT (source_name) DO NOTHING;
