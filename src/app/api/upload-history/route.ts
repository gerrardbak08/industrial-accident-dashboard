/**
 * GET /api/upload-history
 * Returns the last 20 upload events.
 */
import { NextResponse } from 'next/server'
import { loadHistory } from '@/lib/store'
import type { UploadHistoryRow } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<UploadHistoryRow[] | { error: string }>> {
  try {
    return NextResponse.json((await loadHistory()).slice(0, 20))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
