import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/utils/supabase/server';

// Setup Supabase Service Role Client to bypass RLS for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    // 🔒 AUTH GUARD: Verify the caller is an authenticated admin/core_member
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('member_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
      return NextResponse.json({ error: 'Forbidden: Admin or Core Member access required' }, { status: 403 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    let successCount = 0;
    const errors = [];

    // Process each item
    for (const item of items) {
      const { eventId, hash, type, memberIndex } = item;

      if (!hash || !eventId) {
        errors.push({ item, error: 'Missing hash or eventId' });
        continue;
      }

      // Fetch the registration
      const { data: reg, error: fetchError } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('hash_payload', hash)
        .eq('event_id', eventId)
        .single();

      if (fetchError || !reg) {
        errors.push({ item, error: 'Registration not found' });
        continue;
      }

      let updatePayload: any = {};

      if (type === 'PRIMARY') {
        updatePayload = { checked_in: true };
      } else if (type === 'MEMBER' && typeof memberIndex === 'number') {
        const teamData = reg.team_data || {};
        const members = teamData.members || [];
        
        if (members[memberIndex]) {
          members[memberIndex].checked_in = true;
          updatePayload = { team_data: { ...teamData, members } };
        } else {
          errors.push({ item, error: 'Member index out of bounds' });
          continue;
        }
      } else {
        errors.push({ item, error: 'Invalid type' });
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from('registrations')
        .update(updatePayload)
        .eq('id', reg.id);

      if (updateError) {
        errors.push({ item, error: updateError.message });
      } else {
        successCount++;
      }
    }

    console.log(`[AUDIT] User ${user.id} synced ${successCount} offline checkins`);
    return NextResponse.json({ 
      success: true, 
      processed: successCount, 
      errors 
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
