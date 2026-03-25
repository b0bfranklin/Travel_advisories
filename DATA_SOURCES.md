# DATA_SOURCES.md — External Data Sources Reference

Every external data source used by this project is documented here. Before integrating a new source, add it to this file first. Before removing a source, check whether any other source can cover the gap.

---

## Flight Data

### OpenSky Network
- **URL:** https://opensky-network.org/apidoc/
- **Cost:** Free (anonymous: 400 credits/day, authenticated: 4000/day)
- **Auth:** Optional basic auth (username/password) — register free account for higher limits
- **Key endpoint:** `GET https://opensky-network.org/api/flights/departure?airport={icao}&begin={unix}&end={unix}`
- **Data quality:** Crowdsourced ADS-B — good for position/tracking, less reliable for status reasons
- **Limitation:** Uses ICAO codes, not IATA — need mapping table at /data/icao-to-iata.json
- **Start here:** Best free option for MVP, no API key needed for basic usage
- **Env vars:** `OPENSKY_USERNAME`, `OPENSKY_PASSWORD`

### AviationStack
- **URL:** https://aviationstack.com/documentation
- **Cost:** Free tier: 100 req/month. Basic: ~$15/mo for 10,000. Pro: ~$50/mo for 50,000
- **Auth:** API key in query string `?access_key=`
- **Key endpoint:** `GET http://api.aviationstack.com/v1/flights?flight_iata={number}`
- **Data quality:** Good for scheduled vs actual times, delay reasons
- **Limitation:** Free tier is very limited — use OpenSky for MVP, upgrade to AviationStack for production
- **Env vars:** `AVIATIONSTACK_API_KEY`

### FlightAware AeroAPI
- **URL:** https://www.flightaware.com/aeroapi/portal/documentation
- **Cost:** Paid — starts at ~$0.01 per query. Budget carefully.
- **Auth:** API key in header `x-apikey:`
- **Key endpoint:** `GET /flights/{ident}` — rich data including delay codes, gate info, aircraft type
- **Data quality:** Best available. Industry standard.
- **Use for:** Phase 1 production when budget allows, not MVP
- **Env vars:** `FLIGHTAWARE_API_KEY`

### FlightRadar24 (future)
- **URL:** https://www.flightradar24.com/terms-and-conditions (commercial licence required)
- **Cost:** Commercial — contact for pricing
- **Use for:** Phase 2+ if FlightAware is too expensive for the traffic level

---

## Weather

### Bureau of Meteorology (BOM) — Australia
- **URL:** http://www.bom.gov.au/catalogue/data-feeds.shtml
- **Cost:** Free (open data)
- **Auth:** None
- **Key feeds:**
  - Warnings: `ftp://ftp.bom.gov.au/anon/gen/fwo/` (XML files, updated every 30 min)
  - Current observations: `http://www.bom.gov.au/fwo/{state_code}/{station_id}.json`
  - Airport weather: e.g. `http://www.bom.gov.au/fwo/IDN60801/IDN60801.95765.json` (SYD)
- **IATA-to-BOM station mapping:** Maintain at /data/airport-bom-stations.json
- **Coverage:** Australia only
- **Note:** BOM data is authoritative for AU severe weather warnings — always prefer BOM over OpenWeatherMap for AU

### OpenWeatherMap
- **URL:** https://openweathermap.org/api
- **Cost:** Free tier: 1,000 calls/day, 60 calls/minute. Paid from $40/mo
- **Auth:** API key `?appid=`
- **Key endpoint:** `GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}`
- **Alerts endpoint:** `GET https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={key}` (One Call API 3.0 — pay-per-call)
- **Coverage:** Global
- **Use for:** International airports outside AU
- **Env vars:** `OPENWEATHERMAP_API_KEY`

---

## Government Travel Advisories

### DFAT Smartraveller (Australia) — PRIMARY for AU audience
- **URL:** https://www.smartraveller.gov.au/
- **Feed:** https://www.smartraveller.gov.au/api/feed — JSON feed with all destination summaries
- **Individual country:** https://www.smartraveller.gov.au/destinations/{region}/{country}
- **Cost:** Free (open data)
- **Auth:** None
- **Update frequency:** Varies — can change multiple times per day during crises
- **Advisory levels (AU):** DO NOT TRAVEL / RECONSIDER YOUR NEED TO TRAVEL / EXERCISE A HIGH DEGREE OF CAUTION / EXERCISE NORMAL SAFETY PRECAUTIONS
- **Map to internal levels:** DO_NOT_TRAVEL / RECONSIDER / EXERCISE_CAUTION / NORMAL

### FCDO (UK Foreign, Commonwealth & Development Office)
- **URL:** https://www.gov.uk/foreign-travel-advice
- **Feed:** https://www.gov.uk/api/content/foreign-travel-advice — GOV.UK Content API
- **Cost:** Free (open data, requires attribution)
- **Advisory levels (UK):** FCDO advises against all travel / advises against all but essential travel / no advice against travel
- **Map to internal levels:** DO_NOT_TRAVEL / RECONSIDER / NORMAL

### US State Department
- **URL:** https://travel.state.gov/
- **Feed:** https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/ — JSON available
- **Advisory levels (US):** Level 1 Normal / Level 2 Exercise Increased Caution / Level 3 Reconsider Travel / Level 4 Do Not Travel
- **Map to internal levels:** NORMAL / EXERCISE_CAUTION / RECONSIDER / DO_NOT_TRAVEL

### NZ SafeTravel
- **URL:** https://www.safetravel.govt.nz/
- **Feed:** https://www.safetravel.govt.nz/destinations — scrape if no JSON feed available
- **Advisory levels:** Broadly similar to DFAT

### Global Affairs Canada
- **URL:** https://travel.gc.ca/travelling/advisories
- **Feed:** https://travel.gc.ca/travelling/advisories — JSON feed available

---

## Rail & Transit

### Transport for NSW
- **URL:** https://opendata.transport.nsw.gov.au/
- **Cost:** Free (requires registration for API key)
- **Key endpoint:** GTFS-RT feeds for realtime trip updates, vehicle positions, alerts
- **Coverage:** Sydney Trains, Sydney Metro, NSW TrainLink, buses, ferries
- **Env vars:** `TFN_API_KEY`

### PTV (Public Transport Victoria)
- **URL:** https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/
- **Cost:** Free (requires registration)
- **Key endpoint:** `/v3/disruptions` — active disruptions with affected routes
- **Env vars:** `PTV_API_KEY`, `PTV_DEV_ID`

### TransLink (QLD)
- **URL:** https://translink.com.au/about-translink/reporting-and-publications/open-data
- **Cost:** Free
- **Feeds:** GTFS-RT

### National Rail (UK)
- **URL:** https://www.nationalrail.co.uk/developers/
- **Cost:** Free tier available (Darwin API)
- **Key endpoint:** Darwin Push Port — realtime train running data
- **Registration:** Required

### Amtrak (US)
- **URL:** https://developer.amtrak.com/ (or use the unofficial GTFS feed)
- **Cost:** Free (unofficial GTFS available)
- **Note:** No official public API — use GTFS static + GTFS-RT where available

### DB (Deutsche Bahn)
- **URL:** https://developer.deutschebahn.com/
- **Cost:** Free tier available
- **Key APIs:** Timetables API, Station Data API

### Fallback — Playwright scraper
For any operator with no API and no GTFS feed, use a Playwright headless scraper running on a GitHub Actions cron schedule. Store results in Supabase. Document each scraped source in /docs/scraped-sources.md with: target URL, CSS selector for disruption list, expected update frequency, fragility notes.

---

## Road Traffic

### Live Traffic NSW
- **URL:** https://www.livetraffic.com/traffic/hazards.json
- **Cost:** Free (open data, no key required)
- **Format:** JSON
- **Update frequency:** ~5 minutes

### VicRoads
- **URL:** https://traffic.vicroads.vic.gov.au/
- **Feed:** GeoJSON incident layer — check https://developer.vicroads.vic.gov.au/
- **Cost:** Free

### DTMR Queensland
- **URL:** https://qldtraffic.qld.gov.au/
- **Feed:** https://qldtraffic.qld.gov.au/hazards.json — open data
- **Cost:** Free

### Main Roads WA
- **URL:** https://www.mainroads.wa.gov.au/traffic-management/traffic-travel-conditions/
- **Feed:** https://api.mainroads.wa.gov.au/ — check for GeoJSON/JSON availability

### HERE Maps Traffic
- **URL:** https://developer.here.com/documentation/traffic/
- **Cost:** Free tier: 250,000 transactions/month
- **Key endpoint:** `GET https://data.traffic.hereapi.com/v7/incidents?...`
- **Coverage:** Global
- **Env vars:** `HERE_MAPS_API_KEY`

### TomTom Traffic
- **URL:** https://developer.tomtom.com/traffic-api/documentation
- **Cost:** Free tier: 2,500 requests/day
- **Key endpoint:** `GET https://api.tomtom.com/traffic/services/5/incidentDetails`
- **Coverage:** Global
- **Env vars:** `TOMTOM_API_KEY`

### Waze Partner Hub
- **URL:** https://www.waze.com/en-GB/partners
- **Cost:** Free (requires application and approval)
- **Note:** Apply once the site has meaningful traffic — approval is not guaranteed for new sites

---

## Maritime

### MarineTraffic
- **URL:** https://www.marinetraffic.com/en/p/api-services
- **Cost:** Freemium — free tier very limited, paid starts ~$50/mo
- **Key endpoint:** `GET https://services.marinetraffic.com/api/exportvessels/...`
- **Coverage:** Global AIS vessel tracking
- **Env vars:** `MARINETRAFFIC_API_KEY`

### VesselFinder (alternative to MarineTraffic)
- **URL:** https://www.vesselfinder.com/api
- **Cost:** Freemium — similar pricing to MarineTraffic
- **Env vars:** `VESSELFINDER_API_KEY`

### AMSA (Australian Maritime Safety Authority)
- **URL:** https://www.amsa.gov.au/
- **Notices:** https://www.amsa.gov.au/vessels-operators/safety-navigation/navigational-warnings
- **Cost:** Free (open data, scrape/parse)
- **Format:** HTML — requires Playwright scraper for structured data

### Individual ferry operators (scrape)
| Operator | Status URL | Update method |
|---|---|---|
| Spirit of Tasmania | https://www.spiritoftasmania.com.au/service-information | Playwright scraper |
| Sealink | https://www.sealink.com.au/ | Playwright scraper |
| NSW Ferries | https://transportnsw.info/service-status | Transport for NSW API |
| Manly Fast Ferry | https://www.manlyfastferry.com.au/ | Playwright scraper |

---

## Rate Limit Summary

| Source | Free Limit | Reset | Notes |
|---|---|---|---|
| OpenSky | 400 credits/day (anon) | Daily | Authenticated: 4000/day |
| AviationStack | 100 req/month | Monthly | Very limited on free tier |
| FlightAware AeroAPI | Pay per call | — | No free tier |
| OpenWeatherMap | 1,000 calls/day | Daily | One Call 3.0 is pay-per-call |
| HERE Maps | 250,000 tx/month | Monthly | Generous free tier |
| TomTom | 2,500 req/day | Daily | |
| MarineTraffic | Very limited | — | Paid for production use |
| BOM | Unlimited | — | Open data, be polite |
| DFAT | Unlimited | — | Open data |

**Rate limit handling rule:** If any source returns HTTP 429, back off exponentially (1s, 2s, 4s, 8s, max 3 retries), then serve the cached value. Log the 429 to Sentry with tag `rate_limit_hit:[source_name]`.

---

## Data Source Health Monitoring

The admin dashboard system health panel shows the last successful fetch time and HTTP status for every source. This is populated by the `source_health` table in Supabase:

```sql
CREATE TABLE source_health (
  source_name TEXT PRIMARY KEY,
  last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  last_status_code INT,
  consecutive_failures INT DEFAULT 0
);
```

If `consecutive_failures >= 3` for any source, send an alert email to the admin address via Resend.

---

*Last updated: 2026-03-24*
