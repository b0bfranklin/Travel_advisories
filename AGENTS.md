# AGENTS.md — Agent Orchestration Rules

This file defines how Claude Code should decompose work into sub-agents, what each agent is responsible for, and the rules governing agent behaviour across this project.

---

## Agent Philosophy

This project has multiple distinct domains (data ingestion, UI rendering, affiliate tracking, insurance comparison, admin, i18n). Claude Code should treat each domain as an isolated concern and avoid cross-domain side effects. When a task touches more than one domain, decompose it into sub-tasks and complete them in dependency order.

**Always read CLAUDE.md before starting any task.** It is the authoritative source of truth for architecture, conventions, and phase scope.

---

## Agent Roles

### 1. DataAgent
**Responsibility:** All external API integration, data fetching, transformation, and caching.

**Owns:**
- /lib/aviation.ts
- /lib/weather.ts
- /lib/advisories.ts
- /lib/rail.ts
- /lib/roads.ts
- /lib/maritime.ts
- /app/api/* route handlers
- Vercel Cron job definitions

**Rules:**
- Every external API call MUST have a try/catch with a typed fallback return
- Every external API call MUST log to Sentry on failure (use captureException)
- Every response MUST be cached in Upstash Redis before returning to the client — cache key format: `[domain]:[identifier]:[timestamp-bucket]`
- Cache TTLs defined in /lib/cache-config.ts — never hardcode TTL values inline
- Never expose raw API responses to the frontend — always transform to internal types first
- Rate limit all inbound API routes using the Upstash ratelimit helper
- If an API returns unexpected data shape, log the raw response to Sentry with tag `data_shape_mismatch` and return the cached last-known-good value

### 2. UIAgent
**Responsibility:** All React components, pages, and visual presentation.

**Owns:**
- /components/**
- /app/[locale]/** (page.tsx files and layouts)
- /styles/**

**Rules:**
- All components must be typed with explicit TypeScript interfaces — no `any`
- Use shadcn/ui primitives as the foundation — do not create custom UI primitives that duplicate shadcn components
- Dark mode must work on every component from the moment it is created — use Tailwind `dark:` variants throughout
- All interactive elements must meet WCAG 2.1 AA — minimum 4.5:1 contrast ratio, keyboard navigable, aria labels on icon-only buttons
- Mobile-first always — build the mobile layout first, then add responsive breakpoints
- Loading states are not optional — every data-fetching component must have a skeleton or spinner variant
- Error states are not optional — every data-fetching component must have an error boundary fallback
- `lastUpdated` timestamp must be visible to the user on every live data card — never hide it
- Do not use inline styles — Tailwind classes only
- Do not import from /lib/supabase.ts directly in client components — use server components or API routes as the data layer

### 3. InsuranceAgent
**Responsibility:** The insurance comparison section, data model, and all insurance-related content.

**Owns:**
- /data/insurance-providers.json
- /data/credit-cards.json
- /app/[locale]/insurance/**
- /components/insurance/**

**Rules:**
- Every InsuranceProvider record MUST have: id, name, quoteUrl, pdsUrl, lastReviewed, isAffiliate
- pdsUrl must be verified to return HTTP 200 before merging any PR that changes it — the GitHub Action in /.github/workflows/pds-health-check.yml enforces this
- lastReviewed must be updated any time any field in a provider record is changed
- The financial services disclaimer (see CLAUDE.md Legal section) must be present on every insurance page — it is injected via the InsuranceLayout component and must not be removed
- forceMajeureBlocksYourRefund is the most important field for consumers — always display it prominently, never hide it in a collapsed section
- isAffiliate must always be visible to the user — render the affiliate disclosure badge on every card where isAffiliate: true
- Never add a "recommended" or "best for you" feature without explicit legal sign-off — this risks tipping into personal financial advice (AFSL risk)

### 4. AffiliateAgent
**Responsibility:** All affiliate link routing, tracking, and disclosure.

**Owns:**
- /app/api/go/[slug]/route.ts
- /lib/affiliate-tracker.ts
- Supabase `redirects` table schema and queries

**Rules:**
- Every /go/[slug] route must: (1) look up the slug in the redirects table, (2) log the click with timestamp and slug to the `affiliate_clicks` table, (3) return a 302 redirect to the destination URL
- Never log user IP addresses in affiliate_clicks — store only: slug, timestamp, referrer_page, user_agent_hash (hashed, not raw)
- All affiliate links in JSX must use rel="nofollow sponsored" — the ESLint rule in .eslintrc enforces this
- Broken affiliate redirects (slug not found) must return a 404 with a helpful message — never silently redirect to homepage
- All new affiliate programs must be documented in /docs/affiliate-disclosure.md before the first link goes live

### 5. AdminAgent
**Responsibility:** The /admin dashboard and all admin-facing tooling.

**Owns:**
- /app/admin/**
- /components/admin/**

**Rules:**
- Every /admin route must be protected by Supabase Auth middleware — unauthenticated requests return 401 and redirect to /admin/login
- Only email addresses present in the Supabase `admins` table may access /admin — do not use role-based claims from the JWT alone
- Every mutating admin action (create, update, delete) must write a record to the `admin_audit_log` table: { admin_email, action_type, target_table, target_id, payload_summary, created_at }
- Admin UI does not need to be pretty — it needs to be functional, fast, and clear. Use shadcn/ui Table, Form, and Badge components. No custom styling.
- The system health panel must show: last successful run time for every Vercel Cron job, last HTTP status for every external API, Supabase storage usage, Upstash Redis command count

### 6. i18nAgent (Phase 5)
**Responsibility:** All internationalisation, translation infrastructure, and locale routing.

**Owns:**
- /messages/*.json
- /lib/i18n.ts
- next-intl configuration
- RTL layout support

**Rules:**
- Do not begin Phase 5 work until Phase 1 is fully stable and deployed
- Every new UI string added to the app must be added to /messages/en.json at the same time — never hardcode display strings in components
- RTL support (Arabic) must be implemented at the layout level, not component by component — test with a browser set to ar locale before marking any Phase 5 task complete
- Machine-translated strings (DeepL) must be marked with a `_machine: true` flag in the JSON until human-reviewed — render a small "machine translated" notice in the UI for those locales in dev/staging
- Legal content (insurance disclaimers, affiliate disclosures, privacy policy, ToS) must never be machine-translated — flag these strings as `_requiresHumanTranslation: true` and display English fallback until a verified human translation is available

---

## Task Decomposition Rules

When given a task that spans multiple agents:

1. Identify which agents are involved
2. List the sub-tasks in dependency order
3. Complete DataAgent tasks before UIAgent tasks — the UI should never be built before the data contract (TypeScript interface) is defined
4. Complete InsuranceAgent tasks before AffiliateAgent tasks for insurance-related features
5. AdminAgent tasks can run in parallel with other agents
6. i18nAgent tasks always come last

**Example decomposition:**
> Task: "Add a new eSIM provider with affiliate link to the shop page"

1. AffiliateAgent: Add slug to redirects table and document in affiliate-disclosure.md
2. DataAgent: Add provider to /data/esim-providers.json with all required fields including routesThroughChina
3. UIAgent: Render the new provider card on /shop/esims — card automatically picks up from data file
4. i18nAgent (Phase 5 only): Add any new UI strings to en.json

---

## File Editing Rules

- Never edit /data/*.json files without updating the corresponding TypeScript interface in /types/
- Never edit CLAUDE.md during a coding session — it is a planning document, not a runtime file
- Never commit secrets — all API keys go in Vercel environment variables and .env.local (gitignored)
- .env.local must never be committed — verify .gitignore includes it before first commit
- Never delete a migration file in /supabase/migrations/ — always add new migrations forward

---

## Testing Expectations

- All /lib/ utility functions must have unit tests in /tests/lib/
- All /app/api/ route handlers must have integration tests in /tests/api/
- Use Vitest for unit tests, Playwright for E2E
- E2E tests must cover: flight search, alert subscription, insurance comparison filter, /go/[slug] redirect, admin login protection
- CI runs on every PR via GitHub Actions — PRs must pass all tests before merge

---

*Last updated: 2026-03-24*
