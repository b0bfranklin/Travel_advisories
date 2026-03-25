# TripWatch — Travel Disruption & Advisory Hub

Real-time flight disruptions, travel advisories, and alerts for Australian and international travellers.

## Getting started

```bash
npm install
cp .env.local.example .env.local
# Fill in your environment variables in .env.local
npm run dev
```

## Development

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run test       # Run unit tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Phase 1 features

- Live flight disruptions (OpenSky Network, with mock data fallback in development)
- Flight search by number, airport IATA, or airline
- Severity-based filtering (CRITICAL / HIGH / MEDIUM / LOW)
- Email alert subscriptions (verify + unsubscribe)
- Affiliate redirect system (/go/[slug])
- Admin dashboard (protected by Supabase Auth)
- Dark mode (system preference default, user-overridable)

## Deployment

Deploy to Vercel:

1. Connect your GitHub repo to Vercel
2. Add all environment variables from `.env.local.example` in Vercel project settings
3. Deploy

**After first deploy:**

- Submit sitemap to Google Search Console: `https://[yourdomain]/sitemap.xml`
- Submit sitemap to Bing Webmaster Tools
- Apply for Google AdSense (requires 15+ pages of content)

## Project structure

See `CLAUDE.md` for the full project spec and `ARCHITECTURE.md` (to be created) for system design.

## Tech stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Caching:** Upstash Redis
- **Auth:** Supabase Auth (admin only)
- **Email:** Resend
- **Deployment:** Vercel

## Legal

This site is for informational purposes only. See `/app/insurance` for required financial services disclaimers. See `/docs/afsl-legal-advice.md` before adding personalised insurance recommendations.
