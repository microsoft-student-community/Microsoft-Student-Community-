import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('registrations').select('id, lead_email, form_data, checked_in')
  
  if (data) {
    const withCert = data.filter(r => r.form_data && r.form_data.certificate_type)
    console.log("Registrations with certificate:", JSON.stringify(withCert, null, 2))
  }
}

check()
