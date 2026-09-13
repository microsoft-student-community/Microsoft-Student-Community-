const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const fileContent = "dummy content";
  const { data, error } = await supabase.storage.from('images').upload('test_anon.txt', fileContent, { upsert: true });
  console.log("Upload result:", data, error);
}
test();
