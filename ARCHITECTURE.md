# ARCHITECTURE.md — System Architecture Reference

This document is the authoritative reference for how the system is structured, how data flows, and how components relate to each other. Read this before making any architectural decisions.

---

## System Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL DATA SOURCES                       │
│  AviationStack │ OpenSky │ FlightAware │ BOM │ OpenWeatherMap        │
│  HERE Maps │ TomTom │ MarineTraffic │ DFAT │ FCDO │ State Dept       │
│  PTV │ Transport NSW │ TransLink │ Transperth │ GTFS-RT feeds        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP / API calls
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE FUNCTIONS                        │
│  /app/api/flights     /app/api/weather    /app/api/advisories        │
│  /app/api/trains      /app/api/roads      /app/api/maritime          │
│  /app/api/alerts/subscribe                /app/api/go/[slug]         │
│                                                                       │
│  All routes: rate limited (Upstash) → transform → cache → respond   │
└──────────────┬────────────────────────────────┬─────────────────────┘
               │ Read/Write                     │ Cache reads/writes
               ▼                                ▼
┌──────────────────────────┐    ┌───────────────────────────────────┐
│         SUPABASE          │    │         UPSTASH REDIS              │
│  PostgreSQL + Realtime   │    │  TTL-based API response cache      │
│                           │    │  Rate limit counters               │
│  Tables:                  │    │  Session data                      │
│  - disruptions            │    │                                    │
│  - disruptions_archive    │    │  Cache key format:                 │
│  - alert_subscriptions    │    │  [domain]:[id]:[time-bucket]       │
│  - redirects              │    │  e.g. flight:QF415:20260324-1400   │
│  - affiliate_clicks       │    └───────────────────────────────────┘
│  - insurance_providers    │
│  - travel_advisories      │
│  - weather_alerts         │
│  - user_reports           │
│  - admins                 │
│  - admin_audit_log        │
│  - esim_providers         │
└──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS APP (VERCEL)                           │
│                                                                       │
│  Server Components (default) — fetch from API routes or Supabase    │
│  Client Components — subscribe to Supabase Realtime or poll API     │
│                                                                       │
│  /app/[locale]/flights     — SSR + 30s client polling               │
│  /app/[locale]/insurance   — SSG + ISR (revalidate: 3600)           │
│  /app/[locale]/blog        — SSG + ISR (revalidate: 86400)          │
│  /app/[locale]/advisories  — ISR (revalidate: 21600)                │
│  /app/[locale]/*/history   — ISR (revalidate: 86400)                │
│  /app/admin                — SSR, auth-gated                        │
└──────────────────────────────────────────────────────────────────────┘
               │ Email / SMS
               ▼
┌──────────────────────────────────────┐
│  RESEND (email)   TWILIO (SMS)        │
│  Alert notifications on disruption   │
│  events matching subscriptions       │
└──────────────────────────────────────┘
```

---

## Rendering Strategy Per Route

| Route Pattern | Strategy | Revalidate | Reason |
|---|---|---|---|
| /[locale] (homepage) | SSR | — | Live disruption count widget |
| /[locale]/flights | SSR + client poll | 30s client | Live data required |
| /[locale]/flights/[flightNumber] | SSR + client poll | 30s client | Live data required |
| /[locale]/trains | SSR + client poll | 120s client | Live data |
| /[locale]/roads | SSR + client poll | 300s client | Live data |
| /[locale]/maritime | SSR + client poll | 300s client | Live data |
| /[locale]/insurance | ISR | 3600 | Stable data, hourly check sufficient |
| /[locale]/insurance/[provider] | ISR | 3600 | Stable data |
| /[locale]/insurance/credit-cards | ISR | 86400 | Changes rarely |
| /[locale]/advisories/[country] | ISR | 21600 | DFAT updates ~4x daily max |
| /[locale]/airports/[iata] | ISR | 3600 | Hub page, mostly static |
| /[locale]/airports/[iata]/history | ISR | 86400 | Archive, daily refresh sufficient |
| /[locale]/airlines/[iata] | ISR | 3600 | Hub page |
| /[locale]/airlines/[iata]/history | ISR | 86400 | Archive |
| /[locale]/shop/* | ISR | 86400 | Product pages, daily refresh |
| /[locale]/blog/[slug] | ISR | 86400 | Editorial content |
| /admin/* | SSR | — | Auth-gated, always fresh |

---

## Database Schema

### disruptions
```sql
CREATE TABLE disruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT,
  airline_iata CHAR(2),
  route_from CHAR(3),   -- IATA airport code
  route_to CHAR(3),
  disruption_type TEXT CHECK (disruption_type IN ('DELAY','CANCELLED','DIVERTED','ROUTE_CHANGE','GATE_CHANGE','GROUND_STOP')),
  reason TEXT,
  severity TEXT CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status_url TEXT,      -- Direct link to airline announcement
  rebook_url TEXT,
  refund_url TEXT,
  source TEXT,          -- 'aviationstack' | 'opensky' | 'user_report' | 'manual'
  raw_data JSONB,       -- Original API response, for debugging
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disruptions_airline ON disruptions(airline_iata);
CREATE INDEX idx_disruptions_route ON disruptions(route_from, route_to);
CREATE INDEX idx_disruptions_active ON disruptions(is_active, updated_at DESC);
```

### disruptions_archive
```sql
-- Same schema as disruptions, populated nightly by archive cron job
-- Retains historical records indefinitely (no user data)
CREATE TABLE disruptions_archive (LIKE disruptions INCLUDING ALL);
CREATE INDEX idx_archive_airline ON disruptions_archive(airline_iata, created_at DESC);
CREATE INDEX idx_archive_airport ON disruptions_archive(route_from, created_at DESC);
CREATE INDEX idx_archive_date ON disruptions_archive(created_at DESC);
```

### alert_subscriptions
```sql
CREATE TABLE alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  alert_type TEXT CHECK (alert_type IN ('flight','route','airline','airport','road')),
  alert_value TEXT NOT NULL,  -- e.g. 'QF415' or 'SYD-MEL' or 'QF' or 'SYD'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_alerted_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_type_value ON alert_subscriptions(alert_type, alert_value, is_active);
-- Note: no IP address stored. No PII beyond email.
```

### redirects
```sql
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,       -- e.g. 'amazon-packing-cubes'
  destination_url TEXT NOT NULL,
  category TEXT,                   -- 'luggage' | 'esim' | 'insurance' | 'vpn' | 'lounge' | 'flights' | 'hotels'
  partner_name TEXT,
  is_affiliate BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### affiliate_clicks
```sql
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  referrer_page TEXT,              -- The page on our site the user clicked from
  user_agent_hash TEXT,            -- SHA-256 of user agent string — not reversible
  created_at TIMESTAMPTZ DEFAULT now()
  -- No IP address stored
);

CREATE INDEX idx_clicks_slug ON affiliate_clicks(slug, created_at DESC);
```

### travel_advisories
```sql
CREATE TABLE travel_advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,   -- ISO 3166-1 alpha-2
  country_name TEXT NOT NULL,
  source TEXT NOT NULL,            -- 'dfat' | 'fcdo' | 'state_dept' | 'nz' | 'canada'
  advisory_level TEXT CHECK (advisory_level IN ('DO_NOT_TRAVEL','RECONSIDER','EXERCISE_CAUTION','NORMAL')),
  summary TEXT,
  full_url TEXT,
  last_updated_by_source TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_advisory_country_source ON travel_advisories(country_code, source);
```

### weather_alerts
```sql
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_iata CHAR(3),
  region TEXT,
  alert_type TEXT,
  severity TEXT CHECK (severity IN ('MINOR','MODERATE','SEVERE','EXTREME')),
  summary TEXT,
  source TEXT,                     -- 'bom' | 'openweathermap'
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weather_airport ON weather_alerts(airport_iata, valid_to);
```

### user_reports
```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT,
  airport_iata CHAR(3),
  route_from CHAR(3),
  route_to CHAR(3),
  report_type TEXT CHECK (report_type IN ('DELAY','CANCELLATION','GATE_CHANGE','GROUND_STOP','CREW','EQUIPMENT','OTHER')),
  description TEXT CHECK (char_length(description) <= 280),
  confirm_count INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '4 hours'
  -- No IP, no user ID, no PII
);
```

### admins
```sql
CREATE TABLE admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT                  -- email of admin who added this admin
);
```

### admin_audit_log
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,       -- 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'DISMISS'
  target_table TEXT NOT NULL,
  target_id TEXT,
  payload_summary TEXT,            -- Human-readable summary of what changed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_admin ON admin_audit_log(admin_email, created_at DESC);
CREATE INDEX idx_audit_table ON admin_audit_log(target_table, created_at DESC);
```

---

## Caching Strategy

Defined in /lib/cache-config.ts — never hardcode TTL values inline.

```typescript
export const CACHE_TTL = {
  FLIGHT_STATUS: 60,           // seconds
  WEATHER_ALERT: 900,          // 15 minutes
  TRAVEL_ADVISORY: 21600,      // 6 hours
  INSURANCE_PROVIDER: 3600,    // 1 hour
  AIRLINE_HUB_PAGE: 3600,      // 1 hour
  AIRPORT_HUB_PAGE: 3600,      // 1 hour
  HISTORY_PAGE: 86400,         // 24 hours
  ESIM_PROVIDER: 86400,        // 24 hours
  REDIRECT_LOOKUP: 300,        // 5 minutes (affiliate redirects)
} as const;
```

Cache key convention: `[domain]:[identifier]:[optional-sub-key]`
- `flight:QF415` — latest status for flight QF415
- `airport:SYD:weather` — weather alerts for SYD airport
- `advisory:AU:dfat` — DFAT advisory for Australia
- `insurance:all` — full list of active insurance providers
- `redirect:amazon-packing-cubes` — destination URL for affiliate slug

---

## TypeScript Types Reference

All shared types live in /types/. Import from there, never redefine inline.

```
/types/
  disruption.ts      — Disruption, DisruptionType, DisruptionSeverity
  insurance.ts       — InsuranceProvider, PolicyType, Exclusions
  advisory.ts        — TravelAdvisory, AdvisoryLevel, AdvisorySource
  weather.ts         — WeatherAlert, WeatherSeverity
  airline.ts         — Airline, AirlineLink
  airport.ts         — Airport, AirportWeather
  esim.ts            — EsimProvider, ChinaRoutingStatus
  credit-card.ts     — CreditCard, CardInsuranceSummary
  alert.ts           — AlertSubscription, AlertType
  user-report.ts     — UserReport, ReportType
  redirect.ts        — AffiliateRedirect
  admin.ts           — AdminAuditLog, SystemHealthStatus
```

---

## Vercel Cron Jobs

Define in vercel.json:

```json
{
  "crons": [
    { "path": "/api/cron/archive-disruptions", "schedule": "0 2 * * *" },
    { "path": "/api/cron/refresh-advisories",  "schedule": "0 */6 * * *" },
    { "path": "/api/cron/refresh-weather",     "schedule": "*/15 * * * *" },
    { "path": "/api/cron/check-pds-links",     "schedule": "0 9 * * 1" },
    { "path": "/api/cron/expire-user-reports", "schedule": "*/10 * * * *" }
  ]
}
```

All cron handlers must:
1. Verify the request has the `Authorization: Bearer [CRON_SECRET]` header (set CRON_SECRET in Vercel env vars)
2. Log start/end timestamps to Supabase `cron_log` table
3. Return 200 with a JSON summary of what was processed
4. Never throw unhandled exceptions — catch all errors, log to Sentry, return 200 anyway so Vercel doesn't retry endlessly

---

## GitHub Actions

### /.github/workflows/pds-health-check.yml
Runs weekly (Monday 09:00 AEST). For each `pdsUrl` in /data/insurance-providers.json:
- Fetch the URL, check for HTTP 200
- If non-200: open a GitHub Issue titled "⚠️ PDS link broken: [Provider Name]" with the URL and HTTP status
- If the issue already exists (open): add a comment with the latest check result
- Post a summary to the PR/commit if run manually

### /.github/workflows/ci.yml
Runs on every PR and push to main:
- TypeScript type check (tsc --noEmit)
- ESLint
- Unit tests (Vitest)
- Build check (next build)

### /.github/workflows/e2e.yml
Runs on push to main only (not every PR — too slow):
- Playwright E2E tests against the Vercel preview deployment

---

## Row Level Security (RLS) Policies

Enable RLS on all tables. Key policies:

- **disruptions:** SELECT = public (anon key), INSERT/UPDATE/DELETE = service role only
- **disruptions_archive:** SELECT = public, INSERT = service role only
- **alert_subscriptions:** SELECT/INSERT = public (anon) for own rows by email, UPDATE/DELETE = service role only
- **redirects:** SELECT = public (needed for /go/[slug] to work), INSERT/UPDATE/DELETE = service role only
- **affiliate_clicks:** INSERT = public (anon), SELECT/UPDATE/DELETE = service role only
- **travel_advisories:** SELECT = public, INSERT/UPDATE = service role only
- **weather_alerts:** SELECT = public, INSERT/UPDATE = service role only
- **user_reports:** SELECT = public, INSERT = public (anon), UPDATE/DELETE = service role only
- **admins:** SELECT/INSERT/DELETE = service role only
- **admin_audit_log:** INSERT = service role only, SELECT = service role only

---

*Last updated: 2026-03-24*
