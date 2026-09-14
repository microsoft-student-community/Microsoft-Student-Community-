import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpload() {
  const { data, error } = await supabase.storage.from('images').upload('test_anon.txt', 'test content anon', {
    contentType: 'text/plain',
    upsert: true
  })
  console.log("Upload result:", data)
  if (error) console.log("Upload error:", error)
}
testUpload()
