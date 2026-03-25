import { NextRequest, NextResponse } from 'next/server'
import { getActiveDisruptions } from '@/lib/aviation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * Cron job: refresh live flight disruption data.
 * Schedule: every 2 minutes (see vercel.json)
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate Vercel cron call
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const startMs = Date.now()

  try {
    const disruptions = await getActiveDisruptions()

    // Update source health record
    const supabase = await createSupabaseServerClient()
    await supabase.from('source_health').upsert(
      {
        source_name: 'OPENSKY',
        last_check_at: new Date().toISOString(),
        last_status: 200,
        last_success_at: new Date().toISOString(),
        response_ms: Date.now() - startMs,
        consecutive_failures: 0,
        error_message: null,
      },
      { onConflict: 'source_name' }
    )

    return NextResponse.json({
      ok: true,
      count: disruptions.length,
      durationMs: Date.now() - startMs,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/refresh-flights]', message)

    // Update source health with failure
    const supabase = await createSupabaseServerClient()
    await supabase
      .from('source_health')
      .upsert(
        {
          source_name: 'OPENSKY',
          last_check_at: new Date().toISOString(),
          last_status: 500,
          response_ms: Date.now() - startMs,
          error_message: message,
        },
        { onConflict: 'source_name' }
      )
      .then(
        () => null,
        () => null
      )

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
