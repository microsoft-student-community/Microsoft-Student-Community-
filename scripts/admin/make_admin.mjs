import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment variables.")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const email = process.argv[2]
if (!email) {
  console.error('Usage: node make_admin.mjs <your-email>')
  process.exit(1)
}

async function run() {
  const { data, error } = await supabaseAdmin
    .from('member_profiles')
    .update({ role: 'admin' })
    .eq('email', email)
    .select()

  if (error) {
    console.error("Error updating role:", error)
  } else if (data && data.length > 0) {
    console.log(`Successfully elevated ${email} to admin!`)
  } else {
    console.log(`User ${email} not found in member_profiles.`)
  }
}

run()
