import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const { data, error } = await supabase.from('events').select('id, title, slug')
  console.log('Events:', data)
  
  const synoraEvent = data.find(e => e.title.toLowerCase().includes('synora'))
  if (synoraEvent) {
    const { error: updateError } = await supabase.from('events').update({ slug: 'synora' }).eq('id', synoraEvent.id)
    if (updateError) console.error(updateError)
    else console.log('Updated Synora slug to "synora"')
  }
}
main()
