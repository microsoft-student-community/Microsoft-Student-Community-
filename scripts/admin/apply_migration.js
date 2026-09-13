import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function apply() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'alter table public.events add column if not exists banner_url text;' })
  console.log("RPC Error (if any):", error)
  
  const { data: d2, error: e2 } = await supabase.from('events').select('id, title, image_url, banner_url').limit(1)
  console.log("Check:", d2, e2)
}
apply()
