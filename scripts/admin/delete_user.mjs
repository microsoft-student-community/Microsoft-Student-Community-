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
  console.error('Usage: node delete_user.mjs <user-email>')
  process.exit(1)
}

async function run() {
  // 1. Get the user ID from auth.users by email
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (usersError) {
    console.error("Error fetching users:", usersError)
    return
  }
  
  const user = usersData.users.find(u => u.email === email)
  
  if (!user) {
    console.log(`No authentication user found with email: ${email}`)
    return
  }

  // 2. Delete the user (this cascades to member_profiles)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  
  if (deleteError) {
    console.error("Error deleting user:", deleteError)
  } else {
    console.log(`Successfully deleted authentication user: ${email}`)
  }
}

run()
