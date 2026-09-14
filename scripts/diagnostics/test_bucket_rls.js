import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPolicies() {
  const { data, error } = await supabase.from('storage.policies').select('*')
  console.log("Policies:", data, error)
  
  // also check storage buckets
  const { data: buckets } = await supabase.storage.listBuckets()
  console.log("Buckets:", buckets)
}
checkPolicies()
