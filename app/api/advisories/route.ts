import { NextResponse } from 'next/server'
import { getAllAdvisories } from '@/lib/advisories'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAllAdvisories()
    return NextResponse.json({ data, updatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch advisories' }, { status: 500 })
  }
}
