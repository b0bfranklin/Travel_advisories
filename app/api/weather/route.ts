import { NextResponse } from 'next/server'
import { getAllWeather } from '@/lib/weather'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAllWeather()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
