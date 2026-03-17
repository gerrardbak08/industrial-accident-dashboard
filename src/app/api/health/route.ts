/**
 * GET /api/health
 * Production diagnostic endpoint — does NOT expose secret values.
 * Visit this URL to verify env vars and Supabase connectivity.
 */
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  const envStatus = {
    SUPABASE_URL: url ? `✅ set (${url})` : '❌ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: key
      ? `✅ set (length=${key.length})`
      : '❌ MISSING',
  }

  if (!url || !key) {
    return NextResponse.json({ ok: false, env: envStatus, supabase: '⚠️ skipped (env missing)' }, { status: 500 })
  }

  try {
    const { count, error } = await getSupabase()
      .from('accidents')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ ok: false, env: envStatus, supabase: `❌ ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, env: envStatus, supabase: `✅ connected (accidents: ${count} rows)` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, env: envStatus, supabase: `❌ ${msg}` }, { status: 500 })
  }
}
