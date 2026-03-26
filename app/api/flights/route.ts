import { NextResponse } from 'next/server'
import { getAllFlightStatuses } from '@/lib/aviation'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAllFlightStatuses()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch flight status' }, { status: 500 })
  }
}
