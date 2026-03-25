import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { rateLimiters, getIpFromRequest } from '@/lib/ratelimit'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getVerificationEmail } from '@/lib/email-templates'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  alertType: z.enum(['FLIGHT', 'ROUTE', 'AIRLINE', 'AIRPORT'], {
    errorMap: () => ({ message: 'Alert type must be FLIGHT, ROUTE, AIRLINE, or AIRPORT' }),
  }),
  watchValue: z
    .string()
    .min(2, 'Watch value must be at least 2 characters')
    .max(20, 'Watch value must be at most 20 characters')
    .transform((v) => v.trim().toUpperCase()),
})

export async function POST(request: NextRequest) {
  // 1. Rate limit — 5 per hour per IP
  const ip = getIpFromRequest(request)
  const { success: rateLimitOk } = await rateLimiters.alertSubscribe.limit(ip)
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please wait before trying again.' },
      { status: 429 }
    )
  }

  // 2. Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, alertType, watchValue } = parsed.data

  // 3. Generate verify token
  const verifyToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h

  // 4. Upsert subscription in Supabase
  const supabase = await createSupabaseServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = (await (supabase as any)
    .from('alert_subscriptions')
    .select('id, email_verified')
    .eq('email', email)
    .eq('alert_type', alertType)
    .eq('watch_value', watchValue)
    .single()) as { data: { id: string; email_verified: boolean } | null }

  if (existing?.email_verified) {
    // Already verified — don't re-send
    return NextResponse.json({
      message: 'You are already subscribed to this alert.',
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await (supabase as any).from('alert_subscriptions').upsert(
    {
      email,
      alert_type: alertType,
      watch_value: watchValue,
      email_verified: false,
      verify_token: verifyToken,
      verify_token_expires_at: expiresAt,
      is_active: true,
    },
    { onConflict: 'email,alert_type,watch_value' }
  )

  if (upsertError) {
    console.error('[alerts/subscribe] upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }

  // 5. Send verification email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tripwatch.io'
  const verifyUrl = `${siteUrl}/api/alerts/verify?token=${verifyToken}`
  const { subject, text, html } = getVerificationEmail({
    verifyUrl,
    email,
    alertType,
    watchValue,
  })

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'alerts@tripwatch.io',
      to: email,
      subject,
      text,
      html,
    })

    if (emailError) {
      console.error('[alerts/subscribe] email send error:', emailError)
      // Don't fail the request — subscription was saved
    }
  } else {
    // Dev mode — log the verify URL
    console.warn(`[alerts/subscribe] RESEND_API_KEY not set. Verify URL: ${verifyUrl}`)
  }

  return NextResponse.json({
    message: 'Check your email to verify your alert subscription.',
  })
}
