# SECURITY.md — Security Requirements & Conventions

This document defines the security posture of the project. Every item here is a requirement, not a suggestion. Read this before writing any code that handles user data, authentication, or external input.

---

## Threat Model Summary

This site collects minimal user data (email for alerts only) and handles no financial transactions directly. The primary security risks are:

1. **Data exposure** — leaking admin credentials, API keys, or user email addresses
2. **Injection attacks** — SQL injection via search inputs, XSS via user-submitted content
3. **Affiliate link abuse** — automated click fraud against /go/[slug] redirects
4. **Admin dashboard unauthorised access** — the admin panel is a high-value target
5. **Dependency supply chain** — malicious npm packages
6. **Scraped content misrepresentation** — serving stale or manipulated data as live

---

## Secrets Management

- **All secrets in Vercel environment variables** — never in code, never in .env files committed to git
- **.env.local is gitignored** — verify this before first commit, check with `git check-ignore .env.local`
- **No secrets in client-side code** — anything prefixed `NEXT_PUBLIC_` is visible to browsers. Only non-sensitive config (GA measurement ID, Supabase anon key, Supabase URL) should be public. The Supabase anon key is safe to expose because RLS policies enforce access control.
- **Service role key** — `SUPABASE_SERVICE_ROLE_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`. It bypasses RLS. Only use in server-side code and Vercel cron handlers.
- **Rotate keys** — if any key is accidentally committed, rotate it immediately in the provider dashboard, then update Vercel env vars. Never assume a commit can be "cleaned" from git history quickly enough.

---

## Input Validation & Sanitisation

- **All user inputs validated server-side** — never trust client-side validation alone
- Use Zod for input validation on all API route handlers. Define schemas in /lib/schemas/
- Flight number input: `/^[A-Z]{2}\d{1,4}[A-Z]?$/i` — validate and uppercase before any DB query
- Airport IATA: `/^[A-Z]{3}$/` — exactly 3 uppercase letters
- Free text fields (user reports, alert subscriptions): strip HTML tags, limit to specified max length, no URLs
- Email addresses: validate with Zod `z.string().email()` — do not use regex alone
- **No raw string interpolation in Supabase queries** — use parameterised queries only (Supabase JS client handles this by default, but be conscious of `.rpc()` calls)

---

## Authentication (Admin)

- Admin routes protected by Supabase Auth middleware at the edge — unauthenticated requests never reach the page component
- Magic link (passwordless email) only — no password stored, no password reset flow needed
- After magic link auth, verify the authenticated email exists in the `admins` table — JWT alone is not sufficient
- Admin session timeout: 8 hours (configure in Supabase Auth settings)
- No admin accounts should use personal Gmail/Hotmail addresses — use a dedicated domain email

---

## Rate Limiting

All public API routes must implement rate limiting using Upstash Redis ratelimit helper.

Suggested limits (adjust based on traffic):

| Route | Limit | Window |
|---|---|---|
| /api/flights | 30 requests | per minute per IP |
| /api/alerts/subscribe | 5 requests | per hour per IP |
| /api/reports (user submissions) | 3 requests | per 15 minutes per IP |
| /api/go/[slug] | 60 requests | per minute per IP |
| All other /api/* | 60 requests | per minute per IP |

Rate limit response: HTTP 429 with `Retry-After` header. Do not reveal the limit in the response body.

---

## Content Security Policy

Set via Next.js headers in next.config.js:

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openweathermap.org;
  frame-src https://googleads.g.doubleclick.net;
  object-src 'none';
  base-uri 'self';
`;
```

Also set:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

## PII Handling

This site collects minimal PII. Handle what exists carefully.

**What we collect:**
- Email address (alert subscriptions only)
- User agent hash (affiliate click tracking — SHA-256, not reversible)

**What we do NOT collect and must not start collecting without a Privacy Policy update:**
- IP addresses (beyond what Vercel logs automatically — not stored in our DB)
- Names, phone numbers (SMS opt-in collects only the phone number, stored hashed or in Twilio only)
- Location beyond what the user explicitly provides (airport/route search input)
- Browsing history or cross-site tracking

**Email handling rules:**
- Email addresses stored only in `alert_subscriptions` — nowhere else
- Emails not passed to third-party services beyond Resend (email delivery) and Twilio (if SMS)
- Unsubscribe must work from every alert email — one-click, no login required
- On unsubscribe: set `is_active = false` (soft delete). Hard delete available on request per Privacy Policy.

---

## Affiliate Click Fraud Prevention

The /go/[slug] route is a potential target for click fraud (inflating commission counts).

Mitigations:
- Rate limit: 60 clicks per minute per IP (Upstash)
- Store user_agent_hash — flag when the same hash generates >10 clicks in 5 minutes (log to Sentry, do not block)
- Do not use JavaScript-only redirects — the route handler does the redirect server-side
- Regularly audit affiliate_clicks table for suspicious patterns (admin dashboard)

---

## Dependency Security

- `npm audit` runs in CI on every PR — PRs with critical vulnerabilities must not be merged without explicit sign-off
- Use `npm ci` (not `npm install`) in CI and deployment — ensures lockfile is respected
- Review `package.json` before adding new dependencies — prefer well-maintained packages with high download counts and recent activity
- Do not add packages that make outbound network requests without being explicitly called (e.g., telemetry packages) — check package source code for unexpected fetch/axios calls

---

## Scraped Data Safety

User-submitted and scraped data must never be trusted.

- All scraped HTML passed through a sanitiser (DOMPurify or equivalent) before storage
- Scraped URLs validated against an allowlist of known operator domains before being stored as `status_url`, `rebook_url`, etc.
- Never store or render scraped JavaScript — text content only
- Playwright scraper runs in a sandboxed GitHub Actions environment — not on the production server

---

## OWASP Top 10 Checklist

| # | Risk | Status | Implementation |
|---|---|---|---|
| A01 | Broken Access Control | ✅ | Supabase RLS + admin middleware |
| A02 | Cryptographic Failures | ✅ | No sensitive data in DB; HTTPS enforced by Vercel |
| A03 | Injection | ✅ | Zod validation + Supabase parameterised queries |
| A04 | Insecure Design | ✅ | Minimal data collection; threat model documented |
| A05 | Security Misconfiguration | ✅ | CSP headers; no secrets in code; .env.local gitignored |
| A06 | Vulnerable Components | ✅ | npm audit in CI |
| A07 | Auth & Session Failures | ✅ | Magic link only; admin table double-check |
| A08 | Software & Data Integrity | ✅ | npm ci in CI; lockfile committed |
| A09 | Logging & Monitoring Failures | ✅ | Sentry; admin audit log; source health table |
| A10 | SSRF | ⚠️ | Validate all outbound URLs in scrapers against allowlist — implement before scraper goes live |

---

## Incident Response

If a security incident occurs:
1. Immediately rotate any potentially compromised API keys in provider dashboards
2. Update Vercel environment variables with new keys
3. Check Supabase audit logs for unauthorised access
4. Check admin_audit_log for suspicious admin actions
5. If user email data may be exposed: notify affected users via Resend within 72 hours (GDPR requirement) and notify OAIC (Australian Office of the Information Commissioner) if >1 affected Australian user

Document the incident in /docs/incidents/ with: date, discovery method, scope, impact, actions taken, remediation, lessons learned.

---

*Last updated: 2026-03-24*
