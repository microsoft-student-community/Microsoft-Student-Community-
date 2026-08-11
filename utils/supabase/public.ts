import { createClient } from '@supabase/supabase-js'

declare global {
  var _supabasePublicClient: any
}

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Public database configuration is unavailable. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env, then restart the Next.js server.',
    )
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._supabasePublicClient) {
      global._supabasePublicClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    }
    return global._supabasePublicClient
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
