'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Uses the public anon key — safe for client components.
 * Respects Row Level Security policies.
 *
 * Note: Database generic omitted — use Supabase CLI auto-generated types
 * (`supabase gen types typescript`) when deploying to production.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
