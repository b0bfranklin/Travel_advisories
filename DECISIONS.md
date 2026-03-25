# DECISIONS.md — Architectural Decision Log

This file records significant architectural decisions made during planning, why they were made, and what alternatives were considered. When Claude Code encounters a situation that seems to contradict a convention, check here first — there may be a documented reason.

Do NOT change decisions recorded here without adding a new entry explaining the change and the reason.

---

## ADR-001: Next.js 15 App Router over Pages Router

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Use Next.js 15 with the App Router, not the Pages Router.

**Reasons:**
- Server Components reduce client-side JavaScript significantly — important for Core Web Vitals and ad revenue (faster pages = more AdSense impressions)
- ISR (Incremental Static Regeneration) is easier to configure per-route with App Router
- Edge Functions and Vercel Cron Jobs integrate cleanly
- Route-level loading.tsx and error.tsx reduce boilerplate

**Alternatives considered:**
- Pages Router: more mature, more documentation — rejected because App Router is clearly the future and we'd be retrofitting later
- Remix: strong data loading model, but Vercel ecosystem integration is weaker

---

## ADR-002: Supabase over PlanetScale / Railway / Neon

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Use Supabase for PostgreSQL database, auth, and realtime.

**Reasons:**
- Free tier is genuinely useful (500MB, daily backups, 7-day retention)
- Supabase Realtime allows live disruption updates without polling infrastructure
- Row Level Security built in — critical for this project's minimal PII handling
- Auth included (magic link, no extra service needed)
- Single dashboard for DB + auth + storage + functions

**Alternatives considered:**
- PlanetScale: MySQL, no RLS, no built-in auth — rejected
- Neon: PostgreSQL, good free tier, but no realtime or auth — would need separate services
- Railway: good DX but no free tier that matches Supabase's capability

---

## ADR-003: Vercel over Netlify / Fly.io / Self-hosted

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Deploy on Vercel.

**Reasons:**
- Zero-downtime atomic deploys out of the box — critical requirement
- First-class Next.js support (same company)
- Vercel Cron Jobs for data refresh — no separate cron infrastructure needed
- Free tier is sufficient for MVP
- Automatic preview deployments per PR
- Edge Network CDN globally distributed

**Alternatives considered:**
- Netlify: good, but Next.js support slightly worse than Vercel
- Fly.io: requires more infrastructure management, not serverless
- Self-hosted on a VPS: ruled out — "self-updating with no downtime" requirement is complex to implement manually

---

## ADR-004: Upstash Redis over Vercel KV / Cloudflare KV

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Use Upstash Redis for caching and rate limiting.

**Reasons:**
- Free tier includes 10,000 commands/day — sufficient for MVP
- The `@upstash/ratelimit` library is the best-documented solution for Next.js rate limiting
- Works as both a cache and a rate limit store — one service instead of two
- HTTP-based (REST) — works in Edge Functions and serverless without TCP connection issues

**Alternatives considered:**
- Vercel KV: Upstash-backed anyway, but more expensive at scale
- In-memory cache: doesn't survive serverless function cold starts — useless for this use case

---

## ADR-005: next-intl over i18next / react-i18next

**Date:** 2026-03-24
**Status:** Accepted (Phase 5)

**Decision:** Use next-intl for internationalisation.

**Reasons:**
- First-class Next.js App Router support — i18next requires more configuration
- URL-based locale routing (`/[locale]/...`) works natively with App Router
- Server Component support — translations load on the server, not client
- RTL support works with Tailwind rtl: variant and next-intl together

**Alternatives considered:**
- i18next: more features and community, but App Router integration requires react-i18next which has Server Component limitations
- Lingui: excellent, but less documentation for App Router specifically

---

## ADR-006: No password authentication

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Admin authentication is magic link only (passwordless). No password field, no password reset, no OAuth.

**Reasons:**
- Magic links are phishing-resistant — no password to steal
- Reduces attack surface (no password storage, no brute force risk)
- Admin access is for one person (Frank) initially — complexity of OAuth is unnecessary
- If compromised: invalidating the email account stops access immediately

**Tradeoff acknowledged:** Requires email access to log in — if email is unavailable, admin is locked out. Mitigated by: ensuring the admin email is on a reliable provider and having a Supabase service role key available for emergency direct DB access.

---

## ADR-007: Minimal PII collection — email only

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** The only PII collected from users is email address (for alert subscriptions). No accounts, no names, no phone numbers stored in our DB.

**Reasons:**
- Reduces privacy regulation exposure (GDPR, Privacy Act 1988)
- Reduces liability if a data breach occurs
- Reduces complexity — no user management system needed
- SMS alerts use Twilio's infrastructure — phone numbers stored only in Twilio, not our DB

**Tradeoff acknowledged:** Cannot personalise the experience without an account. Accepted — the site's value is the data, not personalisation.

---

## ADR-008: ISR over full SSG for insurance comparison pages

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Insurance comparison pages use ISR (revalidate: 3600) rather than being fully static (SSG with manual rebuild).

**Reasons:**
- PDS terms can change at any time — a 1-hour maximum staleness is acceptable
- Manual rebuilds require developer intervention — not viable when running solo
- ISR means updated provider data is live within 1 hour of a DB update, without a deploy

**Tradeoff acknowledged:** 1 hour lag before insurance changes appear. Mitigated by the `lastReviewed` timestamp on each card, which is always accurate to when the data was last verified.

---

## ADR-009: Archive disruption records rather than delete

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** Disruption records older than 48 hours are moved to a `disruptions_archive` table rather than deleted.

**Reasons:**
- Historical data has SEO value (airport/airline history pages)
- Useful for insurance claim research context
- Allows trend analysis
- Storage cost is negligible at this scale

**Tradeoff acknowledged:** Archive table will grow indefinitely. Acceptable — disruption records are small (< 2KB each). At 1,000 disruptions/day, the archive grows by ~730MB/year, well within manageable range.

---

## ADR-010: Do not build a "best policy for you" recommendation engine

**Date:** 2026-03-24
**Status:** Accepted

**Decision:** The insurance comparison section is purely informational — filterable and sortable tables, no personalised recommendations.

**Reasons:**
- Personalised insurance recommendations constitute "personal financial advice" under Australian law
- Providing personal advice without an AFSL (Australian Financial Services Licence) is illegal
- The risk is not worth the engagement benefit at launch
- This decision must be revisited if/when AFSL legal advice changes the position

**Future:** If AFSL legal advice confirms a compliant path, a recommendation engine can be added under ADR-010-REV-1.

---

*Last updated: 2026-03-24*
