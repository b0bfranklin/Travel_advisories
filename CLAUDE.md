# CLAUDE.md — Travel Disruption & Advisory Hub

## Project Overview

A free, ad-supported, affiliate-monetised travel disruption and advisory website providing real-time and near-real-time information on flight delays/cancellations, train disruptions, road advisories, and maritime/ferry advisories. The site also includes a comprehensive travel insurance comparison section and a monetisation layer via ads, affiliate links, and sponsored content.

### Phase Summary

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Flight disruptions (MVP) | Build first |
| Phase 2 | Rail & public transit disruptions | After Phase 1 stable |
| Phase 3 | Road & highway advisories | After Phase 2 |
| Phase 4 (Travel) | Maritime, ferry & cruise advisories | After Phase 3 |
| Phase 4 (Business) | Monetisation — ads, affiliates, sponsored content | Runs in parallel from day 1 |
| Phase 5 | Multilingual support (13 locales) | After site is stable and earning |
| Always-on | Government travel advisories, weather integration, historical archive | Build alongside Phase 1 |
| Always-on | Admin dashboard | Required from Phase 1 |
| Phase 2+ | User-submitted disruption reports | After moderation infrastructure ready |

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
| Deployment | Vercel (free to Pro tier as needed) | Zero-downtime, auto-deploy, preview URLs |
| i18n | next-intl (Phase 5) | URL-based locale routing, RTL support |
| CMS (editorial) | Sanity.io free tier | Insurance comparisons, blog, sponsored content |
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
  - Content Security Policy headers via next.config.js
  - Rate limiting on all public API routes via Upstash Redis
  - OWASP Top 10 considerations documented in /docs/security.md

### Domain Name Suggestions

Check availability on Cloudflare Registrar (at-cost pricing, free WHOIS privacy, automatic DNSSEC):

| Domain | Notes |
|---|---|
| tripwatch.io | Clean, memorable, brandable |
| traveldisrupt.com | Descriptive, SEO-friendly |
| journeyalert.com | Friendly, broad scope |
| transitadvisory.com | Professional tone |
| travelinterrupt.com | Literal, SEO-useful |

---

## Development Phases

### Phase 1 — Flight Disruptions (MVP)

**Data Sources:**
1. AviationStack API (free tier: 100 req/month, paid: ~$15/mo for 10k)
2. OpenSky Network (free, open data — no key needed, good for MVP)
3. FlightAware AeroAPI (paid, best quality — Phase 1 growth)
4. Airline official RSS/status feeds (scraped/parsed where available)
5. FlightRadar24 API (commercial, later phase)

**Features:**
- Search by route, airport, airline, or flight number
- Disruption cards: flight number, route, status, reason, updated timestamp
- Direct link to airline's official status announcement (specific URL, not homepage)
- Direct link to rebooking/refund page where available
- Disruption type tags: DELAY / CANCELLED / DIVERTED / ROUTE CHANGE / GATE CHANGE
- Live auto-refresh (30-second polling or Supabase Realtime)
- Affected airport map view (Mapbox GL JS or Leaflet)
- Filter by: departure country, airline, severity, date range
- Push/browser notification opt-in for saved routes
- Email/SMS alert subscriptions per flight number or route (Resend + Twilio)

**Airline Link Matrix** — maintain in /data/airlines.json:
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

---

### Phase 2 — Rail & Public Transit Disruptions

**Data Sources:**
- Transport for NSW API (free, official)
- PTV API (Public Transport Victoria)
- TransLink API (QLD)
- Transperth (WA — limited API)
- GTFS-RT feeds (most AU/international transit agencies)
- National Rail UK (Darwin/Huxley open data API)
- Amtrak US (open API)
- DB Deutsche Bahn (open API)
- Playwright headless scraper for operators with no API (GitHub Actions cron)

**Features:**
- Line/route search, station-level disruption view
- Replacement bus service notices
- Link to operator's specific advisory URL
- Link to operator's compensation/refund claim page

---

### Phase 3 — Road & Highway Advisories

**Data Sources:**
- Live Traffic NSW (open API)
- VicRoads Traffic (open API / GeoJSON)
- DTMR Queensland road conditions
- Main Roads WA
- HERE Maps Traffic API (free tier: 250k transactions/month)
- TomTom Traffic API (free tier: 2500 req/day)
- Waze Partner Hub (application required)
- State GeoJSON road incident feeds

**Features:**
- Map-first view with incident overlays
- Filter by state, road type, incident type, severity
- Link to official advisory
- Detour suggestions from official data

---

### Phase 4 (Travel) — Maritime, Ferry & Cruise Advisories

**Data Sources:**
- Spirit of Tasmania, Sealink, NSW Ferries, Manly Fast Ferry status feeds
- MarineTraffic API (freemium) / VesselFinder API
- AMSA (Australian Maritime Safety Authority) notices
- Cruise line disruption feeds (scraped): Carnival, P&O, Royal Caribbean, Princess, Celebrity

---

### Government Travel Advisories (All Phases)

Integrate official government travel advisories alongside disruption data. This adds significant editorial value and SEO surface area, and is directly relevant to the insurance comparison section (policies void if you travel against DFAT advice).

**Data Sources:**
- DFAT Smartraveller (Australia) — smartraveller.gov.au — JSON feed available
- FCDO Travel Advice (UK) — gov.uk/foreign-travel-advice — structured data available
- US State Department — travel.state.gov — RSS + JSON feeds
- New Zealand SafeTravel — safetravel.govt.nz
- Global Affairs Canada — travel.gc.ca

**Implementation:**
- Advisory levels: DO NOT TRAVEL / RECONSIDER / EXERCISE CAUTION / NORMAL PRECAUTIONS
- Cross-reference advisory level with insurance comparison data — highlight on insurer cards which policies void at which DFAT level
- Show advisory banner on any disruption card for an affected country
- Subscribe to DFAT advisory change alerts (email/webhook where available)
- Store in Supabase `travel_advisories` table, refresh every 6 hours via Vercel Cron
- SEO: dedicated page per country at /advisories/[country-code]

---

### Weather Integration (All Phases)

Many disruptions are weather-driven. A weather context layer makes disruption cards significantly more useful by explaining *why* without manual editorial work.

**Data Sources:**
- Bureau of Meteorology (BOM) — open data API — AU weather and severe weather warnings
- OpenWeatherMap API (free tier: 1,000 calls/day) — global coverage
- Severe Weather Alerts: BOM for AU, National Weather Service (US), Met Office (UK)

**Features:**
- Weather context badge on disruption cards: "⛈ Severe thunderstorm warning active at SYD — affecting departures"
- Dedicated severe weather advisory page showing airports and routes likely to be affected
- Weather widget on airport hub pages (current conditions + 48hr outlook)
- Cross-reference: when weather alert is active for an airport, auto-promote the insurance comparison CTA

**Implementation:**
- Weather data cached at 15-minute intervals in Upstash Redis
- Link weather events to affected airport IATA codes
- Store active severe weather warnings in Supabase `weather_alerts` table

---

### Historical Disruption Archive (All Phases)

A searchable archive of past disruptions. Valuable for three reasons: SEO (long-tail search traffic), context for travellers researching a route, and supporting evidence for insurance claims research.

**What to archive:**
- All disruption records older than 48 hours move from live table to archive table
- Retain: flight number, route, airline, disruption type, reason, duration, date
- Do NOT retain: user data, alert subscription data

**Features:**
- Search: "Qantas disruptions January 2025", "SYD airport cancellations December 2024"
- Airline disruption history page: /airlines/[iata-code]/history
- Airport disruption history page: /airports/[iata-code]/history
- Monthly disruption summaries (auto-generated, great for SEO)
- Annual disruption report (editorial content, high link-bait potential)

**Implementation:**
- Supabase `disruptions_archive` table with index on airline_code, airport_iata, date
- Archive job runs nightly via Vercel Cron
- Archive pages use Next.js ISR (revalidate: 86400) — no live data needed
- Sitemap includes archive pages (static, stable URLs = good for SEO)
- Live disruption pages (e.g., /flights/QF415) excluded from sitemap — too ephemeral

---

### User-Submitted Disruption Reports

Crowd-sourced disruption reports as a supplement to API data — similar to Waze for flights and roads. Adds real-time granularity that APIs miss (e.g., gate changes not yet in system, ground delays before official announcement).

**Scope:** Phase 2+ — do not build for MVP. Requires moderation infrastructure.

**Features:**
- "Report a disruption" button on flight/route/airport pages
- Report types: DELAY / CANCELLATION / GATE CHANGE / GROUND STOP / CREW ISSUE / EQUIPMENT
- Free text field (max 280 chars) — no PII collected
- Upvote/confirm mechanism ("I'm seeing this too" — +1 from another user = elevated confidence)
- Reports auto-expire after 4 hours unless confirmed
- Clearly labelled: "User-reported — not verified by official source"

**Moderation:**
- Automated: profanity filter, spam detection (rate limit per IP/session)
- Manual: admin dashboard review queue for flagged reports
- Reports that contradict official data are shown with lower confidence, not suppressed

**Data model:**
```typescript
interface UserReport {
  id: string;
  flightNumber?: string;
  airportIata?: string;
  routeFrom?: string;
  routeTo?: string;
  reportType: 'DELAY' | 'CANCELLATION' | 'GATE_CHANGE' | 'GROUND_STOP' | 'CREW' | 'EQUIPMENT' | 'OTHER';
  description: string; // max 280 chars, no PII
  confirmCount: number;
  createdAt: string;
  expiresAt: string;
  isVerified: boolean; // true when confirmed by official source
  isFlagged: boolean; // admin review queue
}
```

---

Runs in parallel with all content phases. Implement progressively as content grows.

#### Advertising
- Google AdSense — primary (apply once site has 15+ pages of content)
  - Place in: sidebar, between result cards, footer
  - Do NOT place on insurance comparison tables
  - Use next/script with strategy="lazyOnload"
- Media.net — Yahoo/Bing contextual ads (secondary)
- Ezoic — AI-optimised placement (apply at ~10k monthly sessions)

#### Affiliate Programs

| Partner | Network | Category | Notes |
|---|---|---|---|
| Amazon Associates | Direct | General travel gear | Luggage, pillows, packing cubes, guide books, adapters |
| Samsonite | CJ Affiliate / Impact | Luggage | Hard luggage, premium brand |
| Bellroy | ShareASale / Direct | Travel accessories | Travel wallets, packing cubes |
| eBags | CJ Affiliate | Luggage | Wide range, good for budget shoppers |
| Airalo | Direct (airalo.com/affiliate) | eSIM | Disclose China routing — see policy below |
| Holafly | Direct | eSIM | Check and disclose China routing |
| Nomad eSIM | Direct | eSIM | |
| Booking.com | Direct | Hotels | |
| Skyscanner | Direct | Flights | |
| World Nomads | Direct | Travel insurance | |
| Cover-More | Commission Factory | Travel insurance | AU market |
| 1Cover | Commission Factory | Travel insurance | AU market |
| Southern Cross | Commission Factory | Travel insurance | AU/NZ market |
| NordVPN | Direct (nordvpn.com/affiliates) | VPN | Relevant to eSIM/privacy audience; disclose if logging policy changes |
| ExpressVPN | Impact | VPN | Strong brand recognition |
| Surfshark | Direct / Impact | VPN | Budget-friendly, good for travellers |
| Priority Pass | Direct | Lounge access | Affiliate program available; high relevance to disrupted travellers at airport |
| DragonPass | Direct | Lounge access | Alternative to Priority Pass; growing AU presence |
| Collinson (LoungeKey) | Direct | Lounge access | Behind many bank card lounge programs |
| Canstar (comparison referral) | Direct | Credit cards | Referral traffic to credit card comparisons with travel insurance inclusions |
| Finder (comparison referral) | Direct | Credit cards | Same as above — high CPC category |
| CommBank Travel Card | Direct via CommBank affiliate | Travel money | AU-specific travel money card |
| Wise (TransferWise) | Direct | Travel money | International transfers and travel debit card |
| Revolut | Direct | Travel money | Growing AU user base, fee-free international spending |

**eSIM China Routing Disclosure Policy (non-negotiable editorial rule):**
Any eSIM affiliate link MUST display a warning badge if the provider routes data through Chinese infrastructure (China Mobile, China Unicom, China Telecom backbone). Implement as: `routesThroughChina: true | false | 'unknown'` in /data/esim-providers.json.

#### Affiliate Link Management
- Short-link redirect system: /go/[slug] — track clicks, allow URL updates without code changes
- Store in Supabase `redirects` table
- All affiliate links must use `rel="nofollow sponsored"`
- Sitewide affiliate disclosure banner (dismissible, cookied)
- Comply with ACCC (AU) and FTC (US) disclosure requirements

#### eSIM vs Carrier Roaming Comparison Page

A dedicated comparison page at /shop/esims that does more than just list eSIM products. This is a structured, SEO-high-value page comparing:

- eSIM providers side by side (price per GB, coverage countries, China routing disclosure, activation method)
- vs. major AU carrier roaming packs: Telstra, Optus, Vodafone (current roaming day pack prices)
- Decision guide: "When is roaming cheaper than an eSIM?" with example trip calculations

This page drives affiliate clicks on an informed decision rather than a blind product list, which dramatically improves conversion rates. Update carrier roaming prices monthly via scheduled scrape or manual review.

Data model additions for /data/esim-providers.json:
```json
{
  "id": "airalo",
  "name": "Airalo",
  "routesThroughChina": false,
  "chineseInfrastructureNotes": null,
  "activationMethod": "app",
  "coverageCountries": 190,
  "pricePerGBUSD": 4.50,
  "affiliateUrl": "/go/airalo",
  "trustpilotRating": 4.4,
  "appStoreRating": 4.6
}
```

#### Credit Card Travel Insurance Comparison

A high-value, high-CPC SEO section at /insurance/credit-cards comparing complimentary travel insurance bundled with AU credit and charge cards. Many Australians don't know their card includes travel insurance — this section captures that search traffic and drives credit card referrals via Finder/Canstar comparison links.

Cover for each card entry:
- Card name and issuer
- Annual fee
- Insurer and underwriter behind the policy
- Coverage limits: medical, cancellation, luggage
- Activation requirement (must charge flights to the card to activate cover — a common gotcha)
- Pre-existing condition handling
- Whether cruise travel is covered
- Key exclusions vs standalone policy

Cards to include initially:
- Qantas Premier Titanium (complimentary travel insurance)
- Qantas American Express Ultimate Card
- ANZ Frequent Flyer Black
- CommBank Ultimate Awards
- Westpac Altitude Black
- NAB Qantas Rewards Premium
- American Express Platinum Charge
- American Express Explorer
- Bankwest Qantas World Mastercard
- HSBC Premier World Mastercard
- Macquarie Black Card
- Citi Prestige Card

Display a clear warning on every card entry: "Complimentary insurance on credit cards typically requires you to pay for your travel (or a portion of it) using the card to activate cover. Always read the card's Insurance Policy Booklet — not the marketing page — for full terms."

This section should NOT recommend cards as financial products. Link to Finder/Canstar for card applications (affiliate referral) with clear disclosure.

---

### Phase 5 — Multilingual Support

**Languages:**

| Code | Language | Notes |
|---|---|---|
| en | English | Default locale |
| de | German | Strong EU travel market |
| it | Italian | Key EU market |
| fr | French | EU + African diaspora |
| ja | Japanese | High outbound travel volume |
| zh-Hans | Chinese Simplified | Mainland China, Singapore, Malaysia |
| zh-Hant | Chinese Traditional | Taiwan, HK — separate from Simplified |
| vi | Vietnamese | AU diaspora + SE Asia market |
| th | Thai | SE Asia travel hub |
| hi | Hindi | Primary Indian subcontinent language |
| ar | Arabic | RTL required; Middle East travel market |
| tl | Tagalog/Filipino | AU diaspora market |
| id | Indonesian | SE Asia, Bali-adjacent |

**Implementation: next-intl**

URL structure: /[locale]/flights, /[locale]/insurance, etc.

```
/app/
  [locale]/
    page.tsx
    flights/page.tsx
    insurance/page.tsx
    ...
/messages/
  en.json
  de.json
  ja.json
  ar.json
  ... (one file per locale)
```

**RTL Support (Arabic):**
- Use Tailwind rtl: variant classes throughout
- Set `<html dir="rtl">` for Arabic locale
- Test all layouts with Arabic text before launch

**Translation Strategy:**
1. Phase 5a: DeepL API for machine translation of all static UI strings (free tier: 500k chars/month)
2. Phase 5b: Human review of JA, AR, ZH by native speakers (Fiverr/Upwork)
3. Phase 5c: Community correction submissions (flag + suggest correction button)

**Do NOT machine-translate:**
- Insurance comparison tables (legal content — human review mandatory)
- Affiliate disclosures and legal notices
- Privacy Policy and Terms of Service (commission proper legal translations)

**SEO for Multilingual:**
- hreflang tags on all pages
- Locale-prefixed URLs (not subdomains — easier on Vercel free tier)
- Separate sitemaps per locale

---

## Travel Insurance Comparison Section

### Provider List (30+ Insurers)

#### Australian-Market Providers

| Provider | Underwriter | Affiliate Network | Notes |
|---|---|---|---|
| Southern Cross Travel Insurance | Southern Cross Benefits | Commission Factory | Finder #1 comprehensive 2025, no age limit, $25k luggage |
| Cover-More | Zurich | Commission Factory / Direct | 3 tiers inc Comprehensive+, seniors-friendly |
| 1Cover | Lloyd's | Commission Factory | Award-winning claims, cruise add-on, unlimited overseas medical |
| Fast Cover | Mitsui Sumitomo | Direct | Aussie-owned, 6 plan tiers, 38 sports auto-covered, unlimited cancellation |
| Travel Insurance Saver | nib | Direct | Mozo Best Insurer 2025, no age limit, $20k luggage, 40 pre-existing auto-covered |
| InsureandGo | Europ Assistance | Direct | 120+ activities, $50k cancellation, budget-friendly, seniors awards 2025 |
| World Nomads (AU) | Various by country | Direct | Adventure/backpacker specialist, founded AU 2002, 150+ activities |
| Allianz Travel (AU) | Allianz Australia | Direct | Legacy brand, $20M medical limit, comprehensive + basic |
| ahm Travel Insurance | Zurich Australia | Direct (via ahm) | Medical-only option, health fund integration |
| Medibank Travel Insurance | Zurich | Direct (via Medibank) | Annual multi-trip Mozo highlight |
| Bupa Travel Insurance | Zurich | Direct (via Bupa) | Health fund brand, Zurich underwritten |
| RAC Travel Insurance | Various | Direct (via RAC) | WA-strong, 3 international plan tiers |
| Australia Post Travel Insurance | Zurich | Direct | Medical-only option standout, accessible brand |
| Tick Travel Insurance | Mitsui Sumitomo | Direct | Mozo ski insurance award 2025 |
| Zoom Travel Insurance | Various | Direct | Finder best value 2025, customisable coverage |
| Butter Insurance | Various | Direct | Mozo Highly Commended 2025, strong digital UX, new entrant |
| Qantas Travel Insurance | Zurich | Direct (via Qantas) | Frequent flyer integration, annual multi-trip |
| Bendigo Bank Travel Insurance | Various | Direct | Annual multi-trip highlight |
| World2Cover | Various | Direct | Cruise insurance Mozo award 2025 |
| HIF Travel Insurance | Various | Direct | No age limit — good for seniors |
| APIA Travel Insurance | Various | Direct | Designed for Australians over 50 |
| Click Travel Insurance | Allianz Global Assistance | Direct | Pandemic/epidemic coverage explicit |
| AHI (Australian Health Insurance) | Various | Direct | Specialist underwriting agency, 25+ years |

#### International Providers (Global Reach — Available to AU Residents)

| Provider | HQ | Affiliate Network | Notes |
|---|---|---|---|
| SafetyWing | Norway | Direct (referral program) | Digital nomad subscription model, Tokyo Marine backed, 180+ countries |
| Genki | Germany | Direct | EU-regulated, nomad health focus, Dr Walter + Allianz backed |
| Heymondo | Spain | Direct | Long-stay and adventure-focused |
| AXA Travel Insurance | France | CJ Affiliate / Direct | Global giant, Schengen visa specialist tier, $2M medical |
| IMG Global | USA | Direct | Medical powerhouse, expat and long-stay, Atlas product line |
| Travel Guard by AIG | USA | Direct | Strong global assistance network, COVID optional add-on |
| Travelex | USA | Direct | Mid-range, CFAR available, customisable |
| Seven Corners | USA | Direct | COVID coverage explicit, student travel, flexible plans |
| Insured Nomads | USA | Direct | Remote workers, 4 plan tiers, World Explorer single + multi |
| Faye Travel Insurance | USA | Direct | App-first, modern UX, strong CFAR option |
| Trawick International | USA | Direct | High medical limits, mid-price, good for independent travel |

### Insurance Data Model (TypeScript)

```typescript
interface InsuranceProvider {
  id: string;
  name: string;
  logoUrl: string;
  primaryMarket: string[]; // ["AU", "NZ", "GLOBAL"]
  underwriter?: string;
  quoteUrl: string;
  affiliateUrl?: string;
  pdsUrl: string; // MANDATORY — Product Disclosure Statement URL

  medicalCoverageAUD?: number | 'unlimited';
  cancellationCoverageAUD?: number | 'unlimited';
  luggageCoverageAUD?: number;
  evacuationCoverageAUD?: number | 'unlimited';
  delayThresholdHours?: number;
  rentalCarExcessAUD?: number;
  personalLiabilityAUD?: number;

  policyTypes: Array<'single' | 'annual-multi-trip' | 'duo' | 'family' | 'backpacker' | 'cruise' | 'ski' | 'medical-only'>;

  exclusions: {
    bloodAlcoholLimitMgPer100ml?: number | null; // null = not specified in PDS
    bloodAlcoholNotes?: string;
    adventureActivitiesExcluded: string[];
    adventureActivitiesIncluded: string[];
    adventurePackAvailable: boolean;
    warExclusion: boolean;
    forceMajeureClause: boolean;
    forceMajeureBlocksYourRefund: boolean; // KEY consumer protection flag
    forceMajeureNotes?: string;
    pandemicCoverage: boolean;
    pandemicCoverageNotes?: string;
    preExistingConditions: 'excluded' | 'declared-and-assessed' | 'auto-covered-listed' | 'covered-with-upgrade';
    preExistingConditionsNotes?: string;
    pregnancyWeekLimit?: number;
    ageLimit?: number | null; // null = no age limit
    governmentAdvisoryLevel: 'do-not-travel' | 'reconsider' | 'exercise-caution'; // Level at which cover voids
  };

  airlineRefusalProtection: boolean; // Pays if airline cites force majeure and refuses refund
  airlineRefusalNotes?: string;

  suitableForNomads: boolean;
  subscriptionModel: boolean;
  maxTripDurationDays?: number;

  productReviewRating?: number;
  trustpilotRating?: number;

  lastReviewed: string; // ISO date — MUST be updated when PDS is verified
  pdsSourceUrl: string;
  reviewNotes?: string;
  isAffiliate: boolean; // Transparency flag — always visible to user
}
```

### Display Requirements

- Comparison table: sortable and filterable columns
- Highlight flags (clearly marked where affiliate-linked):
  - Pays when airline cites force majeure and refuses refund
  - No BAC/alcohol exclusion vs. shows BAC limit in mg
  - No age limit
  - Pre-existing conditions auto-covered
  - Pandemic coverage
- Activity filter: "I plan to do [activity] — show me what covers it"
- Trip type filter: single / annual / nomad / cruise / ski
- "Read the PDS" button on every card (mandatory, links to PDF)
- Last reviewed date visible on every card
- PDS link staleness warning if URL returns 404

**Mandatory disclaimer on all insurance pages:**
> "This comparison is for informational purposes only. Always read the full Product Disclosure Statement (PDS) before purchasing. This site is not an Australian Financial Services (AFS) licensee and does not provide financial advice. Coverage terms change — always verify directly with your insurer."

---

## Notification & Alert System

Users can subscribe to alerts for:
- A specific flight number
- A specific route (e.g., SYD to MEL, any carrier)
- A specific airline
- A specific airport
- A saved road route (Phase 3)

**Implementation:**
- Email: Resend (free tier: 3,000 emails/month)
- SMS: Twilio (charged per SMS — gate behind fair-use opt-in)
- Store in Supabase `alert_subscriptions` table
- Anonymous subscriptions via email verification (no account required)

---

## Content Strategy (for SEO and AdSense approval)

Minimum 15 pieces of original editorial content before applying for AdSense. Aim for 30+ before launch for stronger approval odds and better search presence.

**Disruption & rights:**
- "What to do if your flight is cancelled in Australia"
- "How to claim travel insurance after a flight cancellation"
- "Force majeure explained: when airlines can legally refuse refunds"
- "Your rights when a flight is delayed: AU, UK, EU and US compared"
- "Spirit of Tasmania disruptions: your rights and refund options"
- "What does 'weather disruption' actually mean for your refund?"

**Insurance deep-dives:**
- "Blood alcohol exclusions in travel insurance — which policies have them?"
- "Does travel insurance cover natural disasters?"
- "Travel insurance for adventure sports: what's covered and what isn't"
- "Best travel insurance for Australians over 65"
- "Force majeure in travel insurance: which policies protect you when the airline won't?"
- "Pre-existing conditions and travel insurance: what you need to know"
- "Does your credit card travel insurance actually cover you? The activation trap explained"
- "Complimentary travel insurance on Qantas credit cards: what's covered and what isn't"

**eSIM & connectivity:**
- "eSIM data routing: which providers use Chinese infrastructure?"
- "eSIM vs roaming in 2026: which is cheaper for Australians in Asia?"
- "Best eSIMs for Japan 2026: tested and compared"
- "Do you need a VPN when travelling? The honest answer"
- "Privacy risks of public airport WiFi and how to protect yourself"

**Travel advisories:**
- "DFAT travel advisory levels explained: what each level means for your insurance"
- "Bali travel advisory 2026: current status and what it means for AU travellers"
- "Is it safe to travel to [destination]? How to read government travel advice"

**Airport & lounge:**
- "Best airport lounges accessible with Australian credit cards"
- "Priority Pass vs DragonPass: which is better for AU travellers?"
- "What to do when you're stranded at the airport: a practical guide"

**Destination disruption guides (ISR pages, auto-updated from archive):**
- Sydney Airport disruption history
- Melbourne Airport disruption history
- Bali (Ngurah Rai) Airport disruption history
- Singapore Changi disruption history
- Tokyo Narita / Haneda disruption history

---

## File Structure

```
/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── flights/
│   │   │   ├── page.tsx
│   │   │   └── [flightNumber]/page.tsx       # Excluded from sitemap
│   │   ├── trains/page.tsx
│   │   ├── roads/page.tsx
│   │   ├── maritime/page.tsx
│   │   ├── advisories/
│   │   │   ├── page.tsx                      # All country advisories hub
│   │   │   └── [countryCode]/page.tsx        # Per-country advisory (DFAT/FCDO/State Dept)
│   │   ├── airports/
│   │   │   ├── [iata]/page.tsx               # Airport hub page
│   │   │   └── [iata]/history/page.tsx       # Disruption history (ISR)
│   │   ├── airlines/
│   │   │   ├── [iata]/page.tsx               # Airline hub page
│   │   │   └── [iata]/history/page.tsx       # Disruption history (ISR)
│   │   ├── insurance/
│   │   │   ├── page.tsx                      # Insurance comparison hub
│   │   │   ├── [provider]/page.tsx           # Per-insurer detail page
│   │   │   └── credit-cards/page.tsx         # Credit card travel insurance comparison
│   │   ├── shop/
│   │   │   ├── esims/page.tsx                # eSIM vs roaming comparison + affiliate links
│   │   │   ├── luggage/page.tsx
│   │   │   ├── accessories/page.tsx
│   │   │   └── vpn/page.tsx                  # VPN affiliate page (privacy-aware travellers)
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── admin/                                # Protected — Supabase Auth required
│   │   ├── page.tsx                          # System health dashboard
│   │   ├── disruptions/page.tsx
│   │   ├── insurance/page.tsx
│   │   ├── redirects/page.tsx
│   │   ├── reports/page.tsx                  # User report moderation (Phase 2+)
│   │   ├── alerts/page.tsx
│   │   └── content/page.tsx
│   └── api/
│       ├── flights/route.ts
│       ├── trains/route.ts
│       ├── roads/route.ts
│       ├── weather/route.ts
│       ├── advisories/route.ts
│       ├── alerts/subscribe/route.ts
│       ├── reports/route.ts                  # User-submitted reports (Phase 2+)
│       └── go/[slug]/route.ts                # Affiliate redirect handler
├── components/
│   ├── disruptions/
│   ├── insurance/
│   ├── ads/
│   ├── alerts/
│   ├── weather/
│   ├── advisories/
│   ├── admin/
│   └── ui/
├── data/
│   ├── airlines.json
│   ├── train-operators.json
│   ├── road-authorities.json
│   ├── insurance-providers.json
│   ├── credit-cards.json                     # Credit card travel insurance data
│   └── esim-providers.json                   # Includes routesThroughChina field
├── messages/
│   ├── en.json
│   ├── de.json
│   ├── it.json
│   ├── fr.json
│   ├── ja.json
│   ├── zh-Hans.json
│   ├── zh-Hant.json
│   ├── vi.json
│   ├── th.json
│   ├── hi.json
│   ├── ar.json
│   ├── tl.json
│   └── id.json
├── lib/
│   ├── supabase.ts
│   ├── cache.ts
│   ├── affiliate-tracker.ts
│   ├── alerts.ts
│   ├── weather.ts
│   └── advisories.ts
├── docs/
│   ├── security.md
│   ├── data-sources.md
│   ├── affiliate-disclosure.md
│   ├── insurance-review-process.md           # Documented review workflow + GitHub Actions setup
│   ├── afsl-legal-advice.md                  # Notes from AFSL legal consultation
│   └── sitemap-strategy.md
└── CLAUDE.md
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Flight data APIs
AVIATIONSTACK_API_KEY=
FLIGHTAWARE_API_KEY=
OPENSKY_USERNAME=
OPENSKY_PASSWORD=

# Road/map data APIs
HERE_MAPS_API_KEY=
TOMTOM_API_KEY=

# Weather
OPENWEATHERMAP_API_KEY=
# BOM (Bureau of Meteorology) — open data, no key required for most feeds

# Maritime
MARINETRAFFIC_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email alerts
RESEND_API_KEY=

# SMS alerts (optional — gate behind opt-in)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Translation (Phase 5)
DEEPL_API_KEY=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
GOOGLE_SEARCH_CONSOLE_API_KEY=

# Affiliate tracking (internal slugs only — never expose partner keys)
AFFILIATE_BASE_URL=https://yourdomain.com/go/
```

---

## Legal & Compliance

1. **Privacy Policy** — GDPR + Privacy Act 1988 (AU) + CCPA (US). Human translation for Phase 5 AR and JA markets. Must be live before AdSense application.

2. **Cookie Consent Banner** — required for AdSense + Analytics. Granular consent (analytics vs. advertising). Multilingual in Phase 5. Use a GDPR-compliant library (e.g., cookieconsent, Osano free tier).

3. **Affiliate Disclosure** — ACCC (AU) and FTC (US) both require clear, prominent disclosure. Per-link disclosure (not just sitewide). Per-locale translation in Phase 5. Template: *"This page contains affiliate links. We may earn a commission if you purchase through these links, at no extra cost to you. This does not influence our editorial assessment."*

4. **Financial Services Disclaimer** — mandatory on ALL insurance pages and credit card comparison pages. Human translation mandatory for all locales — do NOT machine-translate legal disclaimers. Template: *"This comparison is for informational purposes only. This site is not an Australian Financial Services (AFS) licensee and does not provide financial advice. Always read the full Product Disclosure Statement (PDS) before purchasing any insurance policy. Coverage terms change — verify directly with your insurer."*

5. **AFSL (Australian Financial Services Licence) — GET LEGAL ADVICE BEFORE LAUNCH.** Running an insurance comparison site in Australia sits in a regulatory grey zone. Most comparison sites operate under a "general advice" exemption (s766B of the Corporations Act), but this has limits. The key question is whether your comparison constitutes "general advice" (no licence needed) or "personal advice" (AFSL required). Do not add features like "best policy for you based on your trip" without legal review — that tips into personal advice. Budget for a 1-hour consultation with an Australian financial services lawyer before launch. Approximate cost: $300–$600.

6. **eSIM China Routing Disclosure** — site editorial policy. Non-negotiable. Must appear on every eSIM product card and eSIM comparison page. Disclosure text: *"⚠️ This provider routes data through Chinese telecommunications infrastructure. This may be relevant if you have privacy or security concerns."* For `routesThroughChina: 'unknown'` display: *"ℹ️ We have not been able to confirm whether this provider uses Chinese infrastructure. Check with the provider before purchasing."*

7. **Terms of Service** — must explicitly disclaim liability for disruption data accuracy. Key clauses: data is for informational purposes only; always verify with your carrier; we are not responsible for decisions made based on this data; user-submitted reports are unverified (Phase 2+).

8. **PDS Link Audit Process** — insurance PDS terms change constantly. Dead PDS links are a reputational and potential legal risk. Implement the following:
   - GitHub Actions workflow: runs weekly, checks every `pdsUrl` field in `insurance-providers.json` for HTTP 200
   - On failure: opens a GitHub Issue automatically: "PDS link broken for [Provider Name] — requires manual review"
   - On insurance display page: if `lastReviewed` is older than 60 days, show: *"⚠️ This comparison was last reviewed [date]. Coverage terms may have changed — always check the current PDS."*
   - Documented review process in /docs/insurance-review-process.md: who reviews, what they check, how to update

9. **User-Submitted Content Policy** (Phase 2+) — once user reports are enabled:
   - Moderation policy page required (what gets removed and why)
   - Reports are not financial or travel advice — add disclaimer to every user report card
   - GDPR: user reports must be anonymised at collection — no IP stored beyond 24 hours
   - Clear process for airlines/operators to flag inaccurate reports

10. **Credit Card Comparison Legal Note** — credit card product comparisons are regulated differently to insurance. Do NOT present as a recommendation or apply a "best card for you" algorithm. Present as factual information only. Link to Finder/Canstar for applications (they hold the relevant licences). Add: *"Credit card comparisons on this site are factual only. This is not financial advice. Consider seeking independent financial advice before applying for credit."*

---

## Development Conventions

- TypeScript strict mode
- ESLint + Prettier (Husky pre-commit hook)
- Rate limiting on all API routes (Upstash Redis)
- All external API calls: try/catch with fallback UI
- Disruption data: lastUpdated timestamp always visible
- No affiliate links without rel="nofollow sponsored"
- Mobile-first (Tailwind breakpoints: sm, md, lg, xl)
- Accessibility: WCAG 2.1 AA minimum
- All images via next/image with alt text
- Insurance lastReviewed must be updated whenever PDS content is verified
- **Dark mode:** implement from day one using Tailwind dark: variant + next-themes. Do not retrofit later. System preference default, user-overridable, preference stored in localStorage.

---

## Admin Dashboard

A protected internal tool at /admin — visible only to authenticated admin users (Supabase Auth magic link). This is required from Phase 1 and must not be skipped.

**Admin dashboard sections:**

### Disruption Management
- View all active disruptions from all sources
- Manually add a disruption (for situations where APIs miss an event)
- Override/correct API-sourced data (e.g., wrong reason text)
- Flag a disruption as resolved
- View disruption history and source reliability stats

### Insurance Provider Management
- Edit all fields in InsuranceProvider records
- Update `lastReviewed` date (with audit log — who updated, when)
- Flag a provider as "under review" (hides from comparison until resolved)
- View PDS link health (HTTP status of all PDS URLs, last checked)
- Bulk export provider data to JSON for backup

### Affiliate Redirect Management
- Add/edit/delete /go/[slug] redirects
- View click-through stats per slug (count, last clicked)
- Flag redirects as expired or broken

### Content & Blog Management
- Drafts and publish workflow for blog/guide articles (via Sanity CMS or direct DB)
- Sponsored content management: approve, schedule, label
- View article SEO stats (page views, search impressions — pull from Google Search Console API)

### User Reports (Phase 2+)
- Moderation queue for flagged user-submitted disruption reports
- Approve / dismiss / edit reports
- View report confidence scores and confirm counts

### Alert Subscriptions
- View aggregate alert subscription stats (not individual user data)
- Monitor email delivery health (bounce rates via Resend dashboard link)
- Trigger manual alert for a specific flight/route (for emergency use)

### System Health
- API status panel: shows last successful call and response time for each data source (AviationStack, OpenSky, BOM, etc.)
- Vercel Cron job last-run timestamps
- PDS link health summary
- Supabase storage and bandwidth usage
- Upstash Redis usage

**Implementation:**
- Route: /admin — protected by Supabase Auth middleware
- Only email addresses in an `admins` table can access
- All admin actions logged to Supabase `admin_audit_log` table (who, what, when)
- Admin UI: use shadcn/ui components — keep it functional, not pretty

---

## Sitemap Strategy

Live disruption pages must NOT be included in the sitemap — they change within minutes and Google will waste crawl budget on them.

**Include in sitemap:**
- / (homepage)
- /flights (hub page)
- /trains (hub page)
- /roads (hub page)
- /maritime (hub page)
- /insurance (hub page)
- /insurance/[provider] — one page per insurer (stable, good for SEO)
- /insurance/credit-cards (stable)
- /shop/esims (stable)
- /shop/luggage (stable)
- /shop/accessories (stable)
- /airports/[iata-code] — airport hub pages (stable)
- /airlines/[iata-code] — airline hub pages (stable)
- /airlines/[iata-code]/history — disruption history (stable, ISR)
- /airports/[iata-code]/history — disruption history (stable, ISR)
- /advisories/[country-code] — government advisory pages (stable)
- /blog/[slug] — all published articles
- All above repeated per locale in Phase 5: /ja/flights, /ar/insurance etc.

**Exclude from sitemap:**
- /flights/[flightNumber] — live, ephemeral
- /admin/* — private
- /api/* — not for indexing
- /go/[slug] — affiliate redirects

**Implementation:** next-sitemap with custom config to exclude dynamic live pages. Generate separate sitemap per locale in Phase 5. Submit all sitemaps to Google Search Console and Bing Webmaster Tools.

---

## Launch Checklist

### Pre-launch (required before going live)
- [ ] Domain registered, DNS pointed to Vercel
- [ ] Supabase project: tables, RLS, and admin_audit_log configured
- [ ] At least one live flight data source integrated (start with OpenSky — no key needed)
- [ ] Privacy Policy live (English)
- [ ] Terms of Service live (English)
- [ ] Cookie consent banner working
- [ ] Affiliate disclosure banner working
- [ ] Admin dashboard accessible and protected by Supabase Auth
- [ ] Dark mode working (system preference default)
- [ ] Minimum 15 original content pages (required for AdSense application)
- [ ] At least 20 insurance providers with PDS links and lastReviewed dates
- [ ] All eSIM providers have routesThroughChina field populated
- [ ] AFSL legal consultation completed — notes in /docs/afsl-legal-advice.md
- [ ] Financial services disclaimer on all insurance and credit card pages
- [ ] robots.txt configured (admin, api, go routes excluded)
- [ ] Sitemap generated via next-sitemap — live disruption pages excluded
- [ ] Sitemap submitted to Google Search Console and Bing Webmaster Tools
- [ ] Lighthouse score > 90 on core pages
- [ ] Sentry error monitoring live
- [ ] Vercel Analytics enabled
- [ ] Alert subscription system tested end-to-end (email)
- [ ] PDS link health check GitHub Action configured and tested
- [ ] Insurance review process documented in /docs/insurance-review-process.md

### Post-launch (first 30 days)
- [ ] Google AdSense application submitted
- [ ] Apply to Media.net (secondary ad network)
- [ ] Register for all affiliate programs listed above
- [ ] Government travel advisories integrated (DFAT minimum)
- [ ] Weather integration live (OpenWeatherMap)
- [ ] Credit card travel insurance comparison page published
- [ ] eSIM vs roaming comparison page published
- [ ] VPN affiliate page published
- [ ] Historical disruption archive pipeline live
- [ ] Google Search Console showing indexed pages

### Phase 2+ (when live and stable)
- [ ] User-submitted disruption reports (with moderation)
- [ ] SMS alert opt-in (Twilio)
- [ ] Rail disruptions integrated
- [ ] Road disruptions integrated
- [ ] Ezoic application (at ~10k monthly sessions)
- [ ] AFSL compliance re-review if any "personalisation" features added

---

*Last updated: 2026-03-24 (v3 — full feature scope)*
*Maintainer: Frank*
