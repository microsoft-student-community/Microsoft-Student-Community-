import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  const { data, error } = await supabase.from('events').insert([{
    title: 'Test Event Insert',
    slug: 'test-event-insert-' + Math.random(),
    date_start: new Date().toISOString(),
    status: 'upcoming',
    type: 'hackathon',
    location: 'Test',
    description: 'Test',
    image_url: '',
    banner_url: ''
  }]).select()
  console.log("Insert result:", data, error)
}
testInsert()
