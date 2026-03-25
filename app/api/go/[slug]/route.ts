import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { rateLimiters, getIpFromRequest } from '@/lib/ratelimit'
import { getCache, setCache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/cache-config'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 1. Rate limit
  const ip = getIpFromRequest(request)
  const { success: rateLimitOk } = await rateLimiters.affiliateRedirect.limit(ip)
  if (!rateLimitOk) {
    return new NextResponse('Too many requests', { status: 429 })
  }

  // 2. Validate slug — only alphanumeric and hyphens
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) {
    return new NextResponse('Not found', { status: 404 })
  }

  // 3. Check Redis cache first
  const cacheKey = `redirect:${slug}`
  const cached = await getCache<{ destination: string }>(cacheKey)

  let destination: string | null = null

  if (cached) {
    destination = cached.destination
  } else {
    // 4. Look up in Supabase
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('redirects')
      .select('destination')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return new NextResponse(null, {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    destination = data.destination
    await setCache(cacheKey, { destination }, CACHE_TTL.REDIRECT_LOOKUP)
  }

  // 5. Log click asynchronously (non-blocking)
  logAffiliatClick(slug, request).catch((err) => {
    console.error('[affiliate] click log failed:', err)
  })

  if (!destination) {
    return new NextResponse('Not found', { status: 404 })
  }

  // 6. Redirect
  return NextResponse.redirect(destination, {
    status: 302,
    headers: {
      'Cache-Control': 'no-store',
      // Minimal referrer to affiliate partner
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  })
}

async function logAffiliatClick(slug: string, request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const referrer = request.headers.get('referer') ?? null
  const userAgent = request.headers.get('user-agent') ?? ''

  // Hash user agent — never store the raw string (PII-adjacent)
  const userAgentHash = createHash('sha256').update(userAgent).digest('hex').slice(0, 16)

  await supabase.from('affiliate_clicks').insert({
    slug,
    referrer: referrer ? referrer.slice(0, 500) : null, // truncate long referrers
    user_agent_hash: userAgentHash,
  })

  // Update click count on the redirect record (graceful fallback if RPC not yet created)
  try {
    await supabase.rpc('increment_redirect_click_count', { p_slug: slug })
  } catch {
    // Function may not exist yet — graceful fallback
  }
}
