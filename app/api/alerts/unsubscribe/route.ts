import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUnsubscribeConfirmationEmail } from '@/lib/email-templates'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.redirect(new URL('/alerts/unsubscribe?error=invalid_id', request.url))
  }

  const supabase = await createSupabaseServerClient()

  // Find and deactivate the subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription, error } = (await (supabase as any)
    .from('alert_subscriptions')
    .update({ is_active: false })
    .eq('id', id)
    .select('email, watch_value')
    .single()) as { data: { email: string; watch_value: string } | null; error: unknown }

  if (error || !subscription) {
    return NextResponse.redirect(new URL('/alerts/unsubscribe?error=not_found', request.url))
  }

  // Send confirmation email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { subject, text, html } = getUnsubscribeConfirmationEmail({
      email: subscription.email,
      watchValue: subscription.watch_value,
    })
    await resend.emails
      .send({
        from: process.env.RESEND_FROM_EMAIL ?? 'alerts@tripwatch.io',
        to: subscription.email,
        subject,
        text,
        html,
      })
      .catch((err) => console.error('[alerts/unsubscribe] email error:', err))
  }

  return NextResponse.redirect(
    new URL(
      `/alerts/unsubscribe?success=1&watch=${encodeURIComponent(subscription.watch_value)}`,
      request.url
    )
  )
}
