# CLAUDE.md — Travel Disruption & Advisory Hub

## Project Overview

A free, ad-supported, affiliate-monetised travel disruption and advisory website providing real-time and near-real-time information on flight delays/cancellations, train disruptions, road advisories, and maritime/ferry advisories. The site also includes a travel insurance comparison section and a monetisation layer via ads, affiliate links, and sponsored content.

---

## Project Architecture

### Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR, ISR, edge caching, SEO-ready |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent, accessible UI |
| Backend/API | Next.js Route Handlers + Edge Functions | Serverless, low-cost |
| Database | PostgreSQL via Supabase | Free tier, real-time subscriptions, row-level security |
| Caching | Vercel Edge Cache + Redis (Upstash free tier) | Low-latency reads for live data |
| Auth (admin) | Supabase Auth (email/magic link) | Admin dashboard access only |
| Deployment | Vercel (free → Pro tier as needed) | Zero-downtime, auto-deploy, preview URLs |
| CMS (optional) | Sanity.io free tier | Editorial content for insurance comparisons |
| Monitoring | Vercel Analytics + Sentry (free tier) | Error tracking, performance |
| CI/CD | GitHub Actions | Automated test, lint, deploy |

### Hosting & Infrastructure

- **Primary host:** Vercel (free tier initially, scales to Pro)
  - Automatic HTTPS via Let's Encrypt
  - Automatic preview deployments per PR/branch
  - Zero-downtime deploys (atomic, immutable deployments)
  - Global CDN edge network
- **Database:** Supabase (free tier: 500 MB, 2 GB bandwidth)
- **Backups:** Supabase automated daily backups (free tier: 7-day retention)
- **Security:**
  - All secrets in Vercel environment variables (never committed)
  - Supabase Row Level Security (RLS) enabled on all tables
  - Content Security Policy headers via `next.config.js`
  - Rate limiting on all public API routes via Upstash Redis
  - OWASP Top 10 considerations documented in `/docs/security.md`

### Domain Name Suggestions

Recommended options (check availability on Namecheap/Cloudflare Registrar):

| Domain | Notes |
|---|---|
| `tripwatch.io` | Clean, memorable, brandable |
| `traveldisrupt.com` | Descriptive, SEO-friendly |
| `flightpulse.io` | Strong brand for phase 1 |
| `transitadvisory.com` | Professional tone |
| `journeyalert.com` | Friendly, broad scope |
| `travelinterrupt.com` | Literal, SEO-useful |

**Recommended:** Register via Cloudflare Registrar (at-cost pricing, free WHOIS privacy, automatic DNSSEC). Point DNS to Vercel.

---

## Development Phases

### Phase 1 — Flight Disruptions (MVP)

**Goal:** Live and near-live flight disruption data including delays, cancellations, route changes, and diversions.

**Data Sources (in priority order):**

1. **AviationStack API** (free tier: 100 req/month, paid: ~$15/mo for 10k)
   - Live flight status, delays, cancellations
2. **OpenSky Network** (free, open data)
   - Flight tracking fallback
3. **FlightAware AeroAPI** (paid, best quality — Phase 1 growth)
4. **Airline official RSS/status feeds** (scraped/parsed where available)
   - Qantas, Jetstar, Virgin Australia, Rex, Bonza (RIP), Air New Zealand, Singapore Airlines, Emirates, etc.
5. **FlightRadar24 API** (commercial, later phase)

**Features:**
- Search by route, airport, airline, or flight number
- Disruption cards showing: flight number, route, status, reason, updated timestamp
- Direct link to **airline's official status announcement** (specific URL, not homepage)
- Where available, direct link to **rebooking/refund page** for the affected flight/service
- Disruption type tags: `DELAY` `CANCELLED` `DIVERTED` `ROUTE CHANGE` `GATE CHANGE`
- Live auto-refresh (30-second polling or Supabase Realtime subscription)
- Affected airport map view (Mapbox GL JS or Leaflet, free tier)
- Filter by: departure country, airline, severity, date range
- Push/browser notifications opt-in for saved routes

**Airline Link Matrix (build and maintain in `/data/airlines.json`):**
```json
{
  "QF": {
    "name": "Qantas",
    "statusUrl": "https://www.qantas.com/au/en/travel-info/flight-status.html",
    "rebookUrl": "https://www.qantas.com/au/en/manage-booking/rebook.html",
    "refundUrl": "https://www.qantas.com/au/en/manage-booking/refund.html"
  }
}
```
Maintain this file for every airline in scope. Prefer deep-links to specific advisories when scraped.

---

### Phase 2 — Rail & Public Transit Disruptions

**Goal:** Train, tram, metro, and intercity rail disruptions.

**Data Sources:**
- **Transport for NSW API** (free, official) — trains, buses, ferries NSW
- **PTV API** (Public Transport Victoria) — trains, trams, buses VIC
- **TransLink API** (QLD)
- **Transperth** (WA — limited API)
- **GTFS-RT feeds** — most Australian and international transit agencies publish General Transit Feed Specification Realtime feeds
- **National Rail (UK)** Darwin/Huxley open data API
- **Amtrak (US)** open API
- **DB (Deutsche Bahn)** open API
- Scrape operator status pages where no API exists (use Playwright headless browser scheduled via GitHub Actions cron)

**Features:**
- Line/route search
- Station-level disruption view
- Replacement bus service notices
- Link to operator's specific advisory URL
- Link to operator's compensation/refund claim page

---

### Phase 3 — Road & Highway Advisories

**Goal:** Major road closures, tollway disruptions, flood events, planned/unplanned works, accidents.

**Data Sources:**
- **Live Traffic NSW** (open API)
- **VicRoads Traffic** (open API / GeoJSON feeds)
- **DTMR Queensland** road conditions
- **Main Roads WA**
- **HERE Maps Traffic API** (free tier: 250k transactions/month)
- **TomTom Traffic API** (free tier: 2500 req/day)
- **Google Maps Roads API** (paid, later phase)
- **Waze Partner Hub** (application required, free for qualifying sites)
- State-level GeoJSON road incident feeds (most Australian states publish these)

**Features:**
- Map-first view with incident overlays
- Filter by: state, road type, incident type, severity
- ETA impact estimate where calculable
- Link to official advisory (e.g., VicRoads incident page)
- Detour suggestions (text-based, sourced from official data)

---

### Phase 4 (Travel) — Maritime, Ferry & Cruise Advisories

**Goal:** Ferry cancellations, port closures, cruise itinerary changes.

**Data Sources:**
- Operator status feeds: Spirit of Tasmania, Sealink, NSW Ferries, Manly Fast Ferry
- **MarineTraffic API** (commercial, freemium) — vessel positions
- **VesselFinder API** (alternative)
- **US Coast Guard NOTAM equivalent** — Notice to Mariners (NOTMAR)
- AMSA (Australian Maritime Safety Authority) notices
- Individual cruise line disruption feeds (scraped): Carnival, P&O, Royal Caribbean, Princess, Celebrity

---

### Phase 4 (Business) — Monetisation Layer

> This phase runs in parallel with all others. Implement progressively as content grows.

#### Advertising

- **Google AdSense** — primary ad network (apply once site has content)
  - Place ads in: sidebar, between results cards, footer
  - Do NOT place ads on: insurance comparison tables (conflicts with affiliate)
  - Use `next/script` with `strategy="lazyOnload"` for performance
- **Media.net** — Yahoo/Bing contextual ads (secondary, travel content works well)
- **Ezoic** — AI-optimised ad placement (apply at ~10k monthly sessions)

#### Affiliate Programs (Register for each)

| Partner | Program | Network | Notes |
|---|---|---|---|
| Amazon | Amazon Associates | Direct | Luggage, travel pillows, packing cubes, guide books, adapters |
| Samsonite | Samsonite Affiliates | CJ Affiliate or Impact | Hard luggage |
| Bellroy | Bellroy Affiliate | ShareASale or direct | Travel wallets, packing cubes |
| eBags | eBags Affiliate | CJ Affiliate | Wide luggage range |
| Airalo | Airalo Partner | Direct (airalo.com/affiliate) | eSIM — **MUST disclose if routing through China** |
| Holafly | Holafly Affiliate | Direct | eSIM — **check China routing, disclose** |
| Nomad eSIM | Nomad Affiliate | Direct | eSIM |
| Booking.com | Booking.com Affiliate | Direct | Hotels/accommodation |
| Skyscanner | Skyscanner Affiliate | Direct | Flights |
| World Nomads | World Nomads Partner | Direct | Travel insurance affiliate |
| Cover-More | Cover-More Affiliate | Direct or Commission Factory | AU travel insurance |
| 1Cover | Commission Factory | AU-specific | AU travel insurance |
| Southern Cross | Partner program | Commission Factory | AU/NZ travel insurance |

> **eSIM China Routing Disclosure Policy (mandatory):**
> Any eSIM affiliate link MUST include a clear, visible disclosure if the provider routes data through Chinese infrastructure (e.g., uses China Mobile, China Unicom, or China Telecom backbone). Display a ⚠️ badge on the product card. This is a site editorial policy — non-negotiable. Implement as a boolean field in the eSIM data model: `routesThroughChina: true/false | unknown`.

#### Sponsored Content

- Clearly labelled `[SPONSORED]` badge on all sponsored cards/posts
- Separate sponsored content from editorial content in the database (`isSponsoredContent: boolean`)
- Do not allow sponsored content to appear in disruption result feeds — editorial section only

#### Affiliate Link Management

- Use a short-link/redirect system (e.g., `/go/amazon-packing-cubes`) to:
  - Track click-throughs in your own analytics
  - Allow easy URL updates without code changes
  - Implement in a `redirects` table in Supabase
- Disclose all affiliate relationships per ACCC guidelines and FTC (for US visitors)
  - Implement a sitewide affiliate disclosure banner (dismissible, cookied)

---

## Travel Insurance Comparison Section

### Data Model

```typescript
interface InsuranceProvider {
  id: string;
  name: string;
  logoUrl: string;
  country: string; // Primary market (AU, NZ, UK, US, etc.)
  quoteUrl: string;
  affiliateUrl?: string;
  
  // Coverage
  medicalCoverageAUD?: number; // null = unlimited
  cancellationCoverageAUD?: number;
  luggageCoverageAUD?: number;
  delayThresholdHours?: number; // Minimum delay before delay benefit kicks in
  
  // Exclusions (the important stuff)
  exclusions: {
    bloodAlcoholLimitMg?: number; // e.g., 50mg/100ml — null = not specified
    adventureActivitiesExcluded: string[]; // e.g. ["skydiving", "bungee jumping"]
    adventureActivitiesIncluded: string[]; // activities covered as standard
    warExclusion: boolean;
    forceMajeureClause: boolean; // Does the policy contain a force majeure clause?
    forceMajeureBlocksRefund: boolean; // Does force majeure prevent YOU getting refunded even if airline refuses?
    pandemicCoverage: boolean;
    preExistingConditions: 'none' | 'declared' | 'automatic' | 'paid-upgrade';
    pregnancyWeekLimit?: number;
    ageLimit?: number;
  };
  
  // Airline refusal under force majeure
  airlineRefusalProtection: boolean; // Does the insurer pay if airline cites force majeure and refuses refund?
  airlineRefusalNotes?: string;
  
  // Metadata
  lastReviewed: string; // ISO date
  sourceUrl: string; // PDS document URL (Product Disclosure Statement)
  reviewNotes?: string;
}
```

### Display Requirements

- Comparison table with sortable columns
- Highlight: policies that protect you when airline refuses refund under force majeure
- Highlight: policies with NO alcohol exclusion vs those with BAC limits
- Activity filter: "I am doing X — which policies cover me?"
- "Read the PDS" link required on every provider card (direct to Product Disclosure Statement PDF)
- Last reviewed date visible on every card
- **Do not represent this as financial advice.** Include disclaimer: *"This comparison is for informational purposes only. Always read the Product Disclosure Statement before purchasing. This is not financial advice."*

---

## Data Freshness & Update Strategy

| Data Type | Update Frequency | Method |
|---|---|---|
| Live flight status | Every 60 seconds | Client-side polling or Supabase Realtime |
| Airline disruption announcements | Every 5 minutes | Server-side cron (Vercel Cron Jobs) |
| Rail disruptions | Every 2 minutes | Server-side cron |
| Road incidents | Every 5 minutes | Server-side cron |
| Insurance comparisons | Monthly manual review | CMS (Sanity) or direct DB update |
| Affiliate product data | Weekly | Scheduled scrape/API sync |
| eSIM routing disclosure | On change | Manual, flagged for review |

---

## SEO Strategy

- Dynamic `<title>` and `<meta description>` per page/route/airport
- Structured data (JSON-LD): `FlightReservation`, `Event` (for disruptions)
- Sitemap auto-generated via `next-sitemap`
- `robots.txt` managed via Next.js
- OpenGraph tags for social sharing of specific disruption alerts
- Core Web Vitals target: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Target long-tail: "Qantas flight delay today", "Spirit of Tasmania cancelled", "M1 closed Sydney"

---

## File Structure

```
/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Landing page
│   │   └── about/page.tsx
│   ├── flights/
│   │   ├── page.tsx              # Flight disruption hub
│   │   └── [flightNumber]/page.tsx
│   ├── trains/page.tsx
│   ├── roads/page.tsx
│   ├── maritime/page.tsx
│   ├── insurance/
│   │   ├── page.tsx              # Insurance comparison hub
│   │   └── [provider]/page.tsx
│   ├── shop/                     # Affiliate product pages
│   │   ├── esims/page.tsx
│   │   ├── luggage/page.tsx
│   │   └── accessories/page.tsx
│   └── api/
│       ├── flights/route.ts
│       ├── trains/route.ts
│       ├── roads/route.ts
│       └── go/[slug]/route.ts    # Affiliate redirect handler
├── components/
│   ├── disruptions/
│   ├── insurance/
│   ├── ads/
│   └── ui/
├── data/
│   ├── airlines.json
│   ├── train-operators.json
│   ├── road-authorities.json
│   └── esim-providers.json       # Includes routesThroughChina field
├── lib/
│   ├── supabase.ts
│   ├── cache.ts
│   └── affiliate-tracker.ts
├── docs/
│   ├── security.md
│   ├── data-sources.md
│   └── affiliate-disclosure.md
├── public/
└── CLAUDE.md                     # This file
```

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Data APIs
AVIATIONSTACK_API_KEY=
FLIGHTAWARE_API_KEY=
HERE_MAPS_API_KEY=
TOMTOM_API_KEY=
OPENSKY_USERNAME=
OPENSKY_PASSWORD=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Affiliate tracking (internal slugs only — no keys stored)
AFFILIATE_BASE_URL=https://yourdomain.com/go/
```

---

## Legal & Compliance Requirements

1. **Privacy Policy** — required before launching (especially with Google AdSense)
   - GDPR (EU visitors), Privacy Act 1988 (Australia), CCPA (US visitors)
   - Use a privacy policy generator as a starting point, then have it reviewed
2. **Cookie Consent Banner** — required for AdSense and Analytics
   - Use `cookieconsent` or a similar lightweight library
3. **Affiliate Disclosure** — ACCC (Australia) and FTC (US) require clear disclosure
   - Sitewide notice + per-link disclosure where relevant
4. **Financial Services Disclaimer** — mandatory on insurance comparison pages
   - "Not financial advice. Not an AFS licensee. Read the PDS."
5. **eSIM China Routing Disclosure** — site editorial policy (see above)
6. **Terms of Service** — protect against liability for disruption data accuracy
   - "Data provided for informational purposes only. Always verify with your carrier."

---

## Development Conventions

- TypeScript strict mode enabled
- ESLint + Prettier enforced (Husky pre-commit hook)
- All API routes must have rate limiting applied (Upstash Redis)
- All external API calls must have try/catch with fallback UI states
- Disruption data must show `lastUpdated` timestamp visible to user at all times
- No affiliate links without corresponding `rel="nofollow sponsored"` attributes
- Mobile-first responsive design (Tailwind breakpoints: sm, md, lg, xl)
- Accessibility: WCAG 2.1 AA minimum
- All images: use `next/image` with proper `alt` text

---

## Launch Checklist

- [ ] Domain registered and DNS pointed to Vercel
- [ ] Supabase project created, tables and RLS configured
- [ ] At least one live data source integrated (AviationStack or OpenSky)
- [ ] Privacy Policy page live
- [ ] Cookie consent banner functional
- [ ] Affiliate disclosure banner functional
- [ ] Google AdSense application submitted (requires live content)
- [ ] At least 5 insurance providers in comparison table
- [ ] All eSIM providers have `routesThroughChina` field populated
- [ ] `robots.txt` and `sitemap.xml` generated
- [ ] Lighthouse score > 90 on all core pages
- [ ] Error monitoring (Sentry) live
- [ ] Vercel Analytics enabled

---

*Last updated: 2026-03-24*
*Maintainer: Frank*
