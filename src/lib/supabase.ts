/**
 * Supabase client — server-only singleton.
 *
 * Uses the SERVICE ROLE key so all operations bypass Row Level Security.
 * Never import this file from client components — the key must stay server-side.
 *
 * Environment variables required:
 *   SUPABASE_URL              — e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — long JWT starting with "eyJ..."
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[db] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.\n' +
      'Create a .env.local file — see .env.local.example for the required variables.',
    )
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return _client
}
