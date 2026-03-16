/**
 * Data-access layer — backed by Supabase (PostgreSQL via REST API).
 *
 * Design goals:
 *   - Atomic-enough writes: saveAccidents / saveStores DELETE then INSERT in
 *     order. If INSERT fails the user sees an upload error and can re-upload.
 *   - Batched inserts: Supabase PostgREST has a default 1 000-row limit per
 *     request, so rows are chunked at BATCH_SIZE.
 *   - filterAccidents stays as a pure in-memory helper — no change needed.
 *
 * Only this file and supabase.ts need to change if the backend is swapped.
 */
import { getSupabase } from './supabase'
import type { AccidentRow, StoreRow, UploadHistoryRow } from '@/types'

const BATCH_SIZE = 500

// ─── Accidents ────────────────────────────────────────────────────────────────

export async function loadAccidents(): Promise<AccidentRow[]> {
  const { data, error } = await getSupabase()
    .from('accidents')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw new Error(`loadAccidents: ${error.message}`)
  return (data ?? []) as AccidentRow[]
}

export async function saveAccidents(rows: AccidentRow[]): Promise<void> {
  const sb = getSupabase()

  // Clear existing data (gte('id', 0) matches all rows since id starts at 1)
  const { error: delErr } = await sb.from('accidents').delete().gte('id', 0)
  if (delErr) throw new Error(`saveAccidents delete: ${delErr.message}`)

  // Batch insert
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const { error } = await sb.from('accidents').insert(rows.slice(i, i + BATCH_SIZE))
    if (error) throw new Error(`saveAccidents insert (batch ${i / BATCH_SIZE + 1}): ${error.message}`)
  }
}

// ─── Stores ───────────────────────────────────────────────────────────────────

export async function loadStores(): Promise<StoreRow[]> {
  const { data, error } = await getSupabase()
    .from('stores')
    .select('store_name, team, type, open_date, address, lat, lng, area_pyeong')

  if (error) throw new Error(`loadStores: ${error.message}`)
  return (data ?? []) as StoreRow[]
}

export async function saveStores(rows: StoreRow[]): Promise<void> {
  const sb = getSupabase()
  const uploadedAt = new Date().toISOString()
  const withTs = rows.map((r) => ({ ...r, uploaded_at: uploadedAt }))

  // Clear existing data (gte matches all non-null store names)
  const { error: delErr } = await sb.from('stores').delete().gte('store_name', '')
  if (delErr) throw new Error(`saveStores delete: ${delErr.message}`)

  for (let i = 0; i < withTs.length; i += BATCH_SIZE) {
    const { error } = await sb.from('stores').insert(withTs.slice(i, i + BATCH_SIZE))
    if (error) throw new Error(`saveStores insert (batch ${i / BATCH_SIZE + 1}): ${error.message}`)
  }
}

// ─── Upload history ───────────────────────────────────────────────────────────

export async function loadHistory(): Promise<UploadHistoryRow[]> {
  const { data, error } = await getSupabase()
    .from('upload_history')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  if (error) throw new Error(`loadHistory: ${error.message}`)
  return (data ?? []) as UploadHistoryRow[]
}

export async function appendHistory(entry: Omit<UploadHistoryRow, 'id'>): Promise<void> {
  const { error } = await getSupabase().from('upload_history').insert(entry)
  if (error) throw new Error(`appendHistory: ${error.message}`)
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export interface AccidentFilters {
  year?: string
  month?: string
  department?: string
  team?: string
  accident_type?: string
  store?: string
}

export function filterAccidents(accidents: AccidentRow[], filters: AccidentFilters): AccidentRow[] {
  return accidents.filter((a) => {
    if (filters.year && filters.year !== 'all' && a.year !== parseInt(filters.year, 10)) return false
    if (filters.month && filters.month !== 'all' && a.month !== parseInt(filters.month, 10)) return false
    if (filters.department && filters.department !== 'all' && a.department !== filters.department) return false
    if (filters.team && filters.team !== 'all' && a.team_name !== filters.team) return false
    if (filters.accident_type && filters.accident_type !== 'all' && a.accident_type !== filters.accident_type) return false
    if (filters.store && filters.store !== 'all' && a.store_name !== filters.store) return false
    return true
  })
}
