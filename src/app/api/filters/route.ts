/**
 * GET /api/filters
 * Thin HTTP wrapper around lib/stats.ts — used by external clients only.
 * Server pages call getFilterOptions() directly to avoid HTTP round-trips.
 */
import { NextResponse } from 'next/server'
import { getFilterOptions, type FilterOptions } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<FilterOptions | { error: string }>> {
  try {
    return NextResponse.json(await getFilterOptions())
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
