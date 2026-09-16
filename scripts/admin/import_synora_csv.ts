import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const args = process.argv.slice(2);
  const csvFilePath = args[0];
  const eventSlug = args[1] || 'synora-pitstop-01';
  const dryRun = !args.includes('--execute');

  if (!csvFilePath) {
    console.error('Usage: tsx scripts/admin/import_synora_csv.ts <path_to_csv> [event_slug] [--execute]');
    process.exit(1);
  }

  console.log(`Starting import for event: ${eventSlug} from ${csvFilePath}`);
  if (dryRun) {
    console.log('--- DRY RUN MODE (No data will be inserted). Pass --execute to run for real. ---');
  }

  // 1. Fetch Event ID
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id')
    .eq('slug', eventSlug)
    .single();

  if (eventError || !event) {
    console.error(`Error fetching event with slug ${eventSlug}:`, eventError);
    process.exit(1);
  }

  const eventId = event.id;
  console.log(`Found Event ID: ${eventId}`);

  // 2. Read and parse CSV
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  console.log(`Found ${records.length} records in CSV.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const record of records) {
    const leadEmail = record['Username'] || record['Team Member 1 SRM Official Email ID'];
    if (!leadEmail) {
      console.warn('Skipping record without Username or Lead Email:', record);
      skippedCount++;
      continue;
    }

    const teamName = record['Team Name'] || 'Unknown Team';
    
    // Extract Members
    const members: {
      fullName: string;
      email: string;
      regNum: string;
      branch: string;
      checked_in: boolean;
    }[] = [];
    for (let i = 1; i <= 5; i++) {
      const name = record[`Team Member ${i} Name`];
      const email = record[`Team Member ${i} SRM Official Email ID`];
      const regNum = record[`Team Member ${i} Registration Number`];
      
      // Stop if there is no name and no email for this member slot
      if (!name && !email) continue;

      members.push({
        fullName: name || '',
        email: email || '',
        regNum: regNum || '',
        branch: '', // Not in CSV
        checked_in: false
      });
    }

    // Senior Student
    const hasSenior = record['Do you want to add Senior Student ?']?.toLowerCase() === 'yes';
    if (hasSenior || record['Senior Student Name']) {
      members.push({
        fullName: record['Senior Student Name'] || '',
        email: record['Senior Student SRM Official Email ID'] || '',
        regNum: record['Senior Student Registration Number'] || '',
        branch: 'Senior',
        checked_in: false
      });
    }

    const teamData = {
      teamName,
      members,
    };

    const formData = {
      fullName: members[0]?.fullName || '',
      email: leadEmail,
      regNum: members[0]?.regNum || '',
      raw_import: record, // Store the raw record just in case
    };

    const transactionId = record['Transaction Id'];
    const amountStr = record['Amount'] || record['Amount '] || '0';
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

    if (dryRun) {
      console.log(`[DRY RUN] Would insert Registration for ${leadEmail} (Team: ${teamName}, Members: ${members.length})`);
      continue;
    }

    // Check for existing registration
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .ilike('lead_email', leadEmail)
      .maybeSingle();

    let registrationId = existingReg?.id;

    if (existingReg) {
      console.log(`Registration already exists for ${leadEmail}. Updating...`);
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          form_data: formData,
          team_data: teamData,
          status: 'confirmed',
        })
        .eq('id', registrationId);

      if (updateError) {
        console.error(`Failed to update registration for ${leadEmail}:`, updateError);
        continue;
      }
    } else {
      console.log(`Inserting new registration for ${leadEmail}...`);
      const { data: newReg, error: insertError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          lead_email: leadEmail,
          form_data: formData,
          team_data: teamData,
          status: 'confirmed',
        })
        .select('id')
        .single();

      if (insertError || !newReg) {
        console.error(`Failed to insert registration for ${leadEmail}:`, insertError);
        continue;
      }
      registrationId = newReg.id;
    }

    // Insert payment if there's a transaction ID
    if (transactionId && transactionId.trim() !== '') {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('razorpay_payment_id', transactionId)
        .maybeSingle();

      if (!existingPayment) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            event_id: eventId,
            registration_id: registrationId,
            razorpay_payment_id: transactionId,
            amount: amount * 100, // Typically stored in paisa if Razorpay
            charge_type: 'import',
            payer_email: leadEmail,
            status: 'paid',
            verified_at: new Date().toISOString()
          });
        
        if (paymentError) {
          console.error(`Failed to insert payment for ${transactionId}:`, paymentError);
        }
      }
    }

    insertedCount++;
  }

  console.log(`\nImport Summary:`);
  console.log(`- Inserted/Updated: ${insertedCount}`);
  console.log(`- Skipped: ${skippedCount}`);
}

main().catch(console.error);
