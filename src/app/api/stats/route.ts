/**
 * GET /api/stats?year=&department=&team=&accident_type=&store=
 * Thin HTTP wrapper around lib/stats.ts — used by external clients only.
 * Server pages call getDashboardStats() directly to avoid HTTP round-trips.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/stats'
import type { DashboardStats } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse<DashboardStats | { error: string }>> {
  try {
    const { searchParams } = req.nextUrl
    const stats = await getDashboardStats({
      year:          searchParams.get('year')          ?? undefined,
      month:         searchParams.get('month')         ?? undefined,
      department:    searchParams.get('department')    ?? undefined,
      team:          searchParams.get('team')          ?? undefined,
      accident_type: searchParams.get('accident_type') ?? undefined,
      store:         searchParams.get('store')         ?? undefined,
    })
    return NextResponse.json(stats)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[stats] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
