import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type SubscriptionRow = {
  id: string
  email: string
  watch_value: string
  verify_token_expires_at: string | null
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL('/alerts/verify?error=invalid_token', request.url))
  }

  const supabase = await createSupabaseServerClient()

  // Find the subscription with this token that hasn't expired
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription, error } = (await (supabase as any)
    .from('alert_subscriptions')
    .select('id, email, watch_value, verify_token_expires_at')
    .eq('verify_token', token)
    .eq('email_verified', false)
    .single()) as { data: SubscriptionRow | null; error: unknown }

  if (error || !subscription) {
    return NextResponse.redirect(new URL('/alerts/verify?error=not_found', request.url))
  }

  // Check token expiry
  if (
    subscription.verify_token_expires_at &&
    new Date(subscription.verify_token_expires_at) < new Date()
  ) {
    return NextResponse.redirect(new URL('/alerts/verify?error=expired', request.url))
  }

  // Mark as verified
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('alert_subscriptions')
    .update({
      email_verified: true,
      verify_token: null,
      verify_token_expires_at: null,
    })
    .eq('id', subscription.id)

  if (updateError) {
    console.error('[alerts/verify] update error:', updateError)
    return NextResponse.redirect(new URL('/alerts/verify?error=server_error', request.url))
  }

  return NextResponse.redirect(
    new URL(
      `/alerts/verify?success=1&watch=${encodeURIComponent(subscription.watch_value)}`,
      request.url
    )
  )
}
