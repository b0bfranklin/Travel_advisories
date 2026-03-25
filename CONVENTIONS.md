# CONVENTIONS.md — Coding Conventions & Patterns

This document defines the patterns Claude Code must follow consistently across the entire codebase. When in doubt about how to implement something, look here first.

---

## TypeScript

- Strict mode enabled — `"strict": true` in tsconfig.json
- No `any` — use `unknown` and narrow, or define a proper type
- No non-null assertions (`!`) without a comment explaining why it's safe
- Prefer `interface` over `type` for object shapes; use `type` for unions and computed types
- All shared types live in /types/ — never define a type inline in a component if it will be used in more than one file
- Export types from /types/index.ts — import from `@/types` not from individual files

```typescript
// GOOD
import type { Disruption, InsuranceProvider } from '@/types';

// BAD
import type { Disruption } from '@/types/disruption';
```

---

## File & Folder Naming

| Item | Convention | Example |
|---|---|---|
| React components | PascalCase .tsx | DisruptionCard.tsx |
| Utility functions | camelCase .ts | formatDisruptionReason.ts |
| API route handlers | always named route.ts | /app/api/flights/route.ts |
| Page files | always named page.tsx | /app/[locale]/flights/page.tsx |
| Type files | kebab-case .ts | insurance-provider.ts |
| Data files | kebab-case .json | airline-operators.json |
| Test files | same name + .test.ts/.spec.ts | DisruptionCard.test.tsx |
| Constants | SCREAMING_SNAKE in camelCase file | CACHE_TTL in cache-config.ts |

---

## Component Patterns

### Server Components (default)
All page.tsx files and layout.tsx files are Server Components by default. Do not add `'use client'` unless the component needs browser APIs, event handlers, or React state/effects.

```typescript
// Server Component — no 'use client' directive
// Can use async/await directly
export default async function FlightsPage() {
  const disruptions = await getActiveDisruptions();
  return <DisruptionList disruptions={disruptions} />;
}
```

### Client Components
Add `'use client'` only at the lowest level of the tree that needs it. Never make a whole page a Client Component to handle one interactive element — extract the interactive part.

```typescript
'use client';
// This component handles real-time updates via polling
export function LiveDisruptionFeed({ initialData }: { initialData: Disruption[] }) {
  const [disruptions, setDisruptions] = useState(initialData);
  // polling logic...
}
```

### Data Fetching Pattern
```typescript
// In a Server Component page:
export default async function FlightsPage() {
  // Fetch on the server — benefits from Next.js request deduplication and ISR
  const disruptions = await fetch('/api/flights', {
    next: { revalidate: 60 }
  }).then(r => r.json());
  
  return (
    <>
      <DisruptionList initialData={disruptions} /> {/* Client Component for live updates */}
      <LastUpdated timestamp={disruptions.fetchedAt} />  {/* Always visible */}
    </>
  );
}
```

### Loading and Error States (mandatory on all data-fetching components)
```typescript
// Every data-displaying component must have a skeleton
export function DisruptionCardSkeleton() {
  return <div className="animate-pulse bg-muted rounded-lg h-24 w-full" />;
}

// Use Next.js loading.tsx for page-level loading
// Use error.tsx for page-level errors
// Use ErrorBoundary for component-level errors
```

---

## API Route Pattern

```typescript
// /app/api/flights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import { getCache, setCache } from '@/lib/cache';
import { CACHE_TTL } from '@/lib/cache-config';
import * as Sentry from '@sentry/nextjs';

const QuerySchema = z.object({
  flightNumber: z.string().regex(/^[A-Z]{2}\d{1,4}[A-Z]?$/i).optional(),
  airport: z.string().regex(/^[A-Z]{3}$/).optional(),
});

export async function GET(request: NextRequest) {
  // 1. Rate limit
  const ip = request.ip ?? 'anonymous';
  const { success } = await ratelimit.flights.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { 
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  // 2. Validate input
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // 3. Check cache
  const cacheKey = `flight:${parsed.data.flightNumber ?? 'all'}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    });
  }

  // 4. Fetch from external source
  try {
    const data = await fetchFlightData(parsed.data);
    await setCache(cacheKey, data, CACHE_TTL.FLIGHT_STATUS);
    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    Sentry.captureException(error, { tags: { source: 'aviationstack' } });
    // Return last cached value if available, even if stale
    const stale = await getCache(`${cacheKey}:stale`);
    if (stale) {
      return NextResponse.json({ ...stale, isStale: true });
    }
    return NextResponse.json({ error: 'Data temporarily unavailable' }, { status: 503 });
  }
}
```

---

## Supabase Query Pattern

```typescript
import { createClient } from '@/lib/supabase-server'; // Server-side client

// GOOD — parameterised, typed
const { data, error } = await supabase
  .from('disruptions')
  .select('*')
  .eq('is_active', true)
  .order('updated_at', { ascending: false })
  .limit(50);

// GOOD — type the result
const disruptions = data as Disruption[];

// BAD — never do this
const { data } = await supabase.rpc('exec_sql', { sql: `SELECT * FROM disruptions WHERE id = '${id}'` });
```

---

## Affiliate Link Component

Never write a raw `<a>` tag for an affiliate link. Always use the `AffiliateLink` component:

```typescript
// /components/ui/AffiliateLink.tsx
import Link from 'next/link';

interface AffiliateLinkProps {
  slug: string;         // The /go/[slug] slug
  children: React.ReactNode;
  className?: string;
  partnerName: string;  // Required for disclosure rendering
}

export function AffiliateLink({ slug, children, className, partnerName }: AffiliateLinkProps) {
  return (
    <>
      <Link
        href={`/go/${slug}`}
        rel="nofollow sponsored"
        target="_blank"
        className={className}
      >
        {children}
      </Link>
      <span className="text-xs text-muted-foreground ml-1" aria-label="Affiliate link">
        (affiliate)
      </span>
    </>
  );
}
```

---

## Timestamps

- All timestamps stored as `TIMESTAMPTZ` in Supabase (UTC)
- All timestamps displayed in the user's local timezone using `Intl.DateTimeFormat` — never hardcode timezone
- `lastUpdated` must be displayed on all live data cards — use the `TimeAgo` component:

```typescript
// /components/ui/TimeAgo.tsx
'use client';
export function TimeAgo({ timestamp }: { timestamp: string }) {
  // Renders "Updated 2 minutes ago" — recalculates every 30 seconds
}
```

---

## Tailwind & Styling

- No inline styles — Tailwind classes only
- Dark mode: every component must work in both light and dark mode. Pattern: `bg-white dark:bg-zinc-900`
- Semantic colour variables via CSS custom properties in globals.css — use `bg-background`, `text-foreground` etc. (shadcn/ui convention)
- Do not use arbitrary values `[42px]` unless absolutely necessary — prefer Tailwind scale
- Component variants via `class-variance-authority` (cva) — do not use conditional className strings for variants

```typescript
// GOOD
const cardVariants = cva('rounded-lg border p-4', {
  variants: {
    severity: {
      LOW: 'border-blue-200 dark:border-blue-800',
      HIGH: 'border-red-200 dark:border-red-800',
      CRITICAL: 'border-red-500 bg-red-50 dark:bg-red-950',
    }
  }
});

// BAD
<div className={`rounded-lg border p-4 ${severity === 'HIGH' ? 'border-red-200' : 'border-blue-200'}`}>
```

---

## Error Messages (User-Facing)

- Never expose internal error details to users (no stack traces, no SQL errors, no API error responses)
- Use friendly, actionable messages:
  - Data unavailable: "Flight status is temporarily unavailable. Try refreshing in a moment."
  - Invalid input: "Please enter a valid flight number (e.g. QF415)"
  - Rate limited: "Too many requests. Please wait a moment before trying again."
  - Alert subscription error: "Couldn't save your alert. Please try again or contact us."

---

## Disruption Severity Mapping

Use consistent severity levels across all transport modes:

| Level | Meaning | Visual |
|---|---|---|
| LOW | Minor delay (<30 min) or minor disruption | Blue badge |
| MEDIUM | Significant delay (30-120 min) or partial cancellation | Yellow/amber badge |
| HIGH | Major delay (>2 hours), full cancellation, diversion | Orange badge |
| CRITICAL | Complete service suspension, safety-related | Red badge, elevated prominence |

---

## Commit Message Convention

Use Conventional Commits format:

```
feat(flights): add real-time polling for active disruptions
fix(insurance): correct PDS link for Southern Cross
chore(deps): update next to 15.2.1
docs(data-sources): add BOM weather feed documentation
refactor(admin): extract audit log helper to lib/audit.ts
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

---

## PR Checklist (before requesting review)

- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All new UI components work in dark mode
- [ ] All new UI components have loading and error states
- [ ] All new affiliate links use the AffiliateLink component
- [ ] All new insurance data includes `lastReviewed` date
- [ ] Any new PDS URLs verified to return HTTP 200
- [ ] Any new user-facing strings added to /messages/en.json
- [ ] Tests written for new lib/ utilities
- [ ] No secrets or .env values in code

---

*Last updated: 2026-03-24*
