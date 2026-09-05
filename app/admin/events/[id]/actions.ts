'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function assignCertificates(eventId: string, registrationIds: string[], type: string) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();
  console.log(`assignCertificates: Fetching regs for ids: ${registrationIds.join(', ')}`);

  // Fetch all target registrations to update their form_data
  const { data: regs, error: fetchError } = await supabaseAdmin
    .from('registrations')
    .select('id, form_data')
    .in('id', registrationIds)

  if (fetchError || !regs) return { error: fetchError?.message || 'Failed to fetch registrations' }
  console.log(`assignCertificates: Fetched ${regs.length} registrations. Updating with type: ${type}`);

  // Update each registration's form_data individually to inject certificate_type
  for (const reg of regs) {
    const parsedFormData = typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data;
    const updatedFormData = {
      ...(parsedFormData as Record<string, any> || {}),
      certificate_type: type
    }
    console.log(`assignCertificates: Updating reg ${reg.id} with new form_data`, updatedFormData);

    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({ form_data: updatedFormData })
      .eq('id', reg.id)

    if (updateError) {
      console.error(`Failed to update cert for reg ${reg.id}`, updateError)
    }
  }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true }
}

export async function updateRegistrationDetails(eventId: string, regId: string, leadEmail: string, formData: any, teamData: any) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('registrations')
    .update({
      lead_email: leadEmail,
      form_data: formData,
      team_data: teamData
    })
    .eq('id', regId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true }
}

export async function deleteRegistration(eventId: string, regId: string) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();

  // Get team_id to delete from teams if applicable
  const { data: regData } = await supabaseAdmin
    .from('registrations')
    .select('team_data')
    .eq('id', regId)
    .single()

  if (regData?.team_data?.team_id) {
    await supabaseAdmin.from('teams').delete().eq('id', regData.team_data.team_id)
  }

  const { error } = await supabaseAdmin
    .from('registrations')
    .delete()
    .eq('id', regId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true }
}

export async function importExternalRegistrations(eventId: string, rows: any[]) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();

  // Fetch event details for confirmation emails
  const { data: eventData } = await supabaseAdmin
    .from('events')
    .select('title, date_start, location')
    .eq('id', eventId)
    .single();

  let successCount = 0;
  let skipCount = 0;
  let errors: string[] = [];

  for (const row of rows) {
    const email = row['Email Address'] || row['Email'] || row['email'] || row["Candidate's Email"];
    const name = row['Name'] || row['Full Name'] || row['name'] || row['First Name'] || row["Candidate's Name"];
    const teamName = row['Team Name'] || row['Team'] || row['team_name'];
    const regNum = row['Registration Number'] || row['Registration No'] || row['Roll Number'] || row['reg_num'];
    const collegeName = row['College Name'] || row['College'] || row['Institution Name'] || row["Candidate's Organisation"];
    const year = row['Year of Study'] || row['Year'] || row['Year of Graduation'] || 'Unknown';

    if (!email) {
      errors.push(`Row ${skipCount + successCount + 1}: Missing email address. Expected column name 'Email', 'Email Address', 'email', or 'Candidate\\'s Email'. Actual columns: ${Object.keys(row).join(', ')}`);
      skipCount++;
      continue;
    }

    try {
      // We will create individual registrations for now, or if Team Name exists, group them? 
      // Unstop usually provides one row per team OR one row per member. 
      // If it's one row per team, Unstop will have "Member 1 Email", "Member 2 Email".
      // Assuming a flattened structure for simplicity where we just make a Team Lead registration.
      
      // Let's check if a registration for this email already exists for this event
      const { data: existingReg } = await supabaseAdmin.from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('lead_email', email)
        .single();
        
      if (existingReg) {
        skipCount++;
        continue; // Already registered
      }

      const formData = {
        fullName: name || email.split('@')[0],
        email: email,
        regNum: regNum || undefined,
        collegeName: collegeName || undefined,
        year: year
      };
      
      const teamData = teamName ? {
        teamName: teamName,
        leadIndex: 0,
        members: [] // Not parsing complex nested members for now
      } : null;

      const hashPayload = crypto.randomUUID();
      const { error: regError } = await supabaseAdmin.from('registrations').insert({
        event_id: eventId,
        lead_email: email,
        form_data: formData,
        team_data: teamData,
        hash_payload: hashPayload
      });

      if (regError) {
        errors.push(`Failed to create registration for ${email}: ${regError.message}`);
        skipCount++;
      } else {
        successCount++;
        
        // Email sending removed as per request
      }

    } catch (err: any) {
      errors.push(`Exception for ${email}: ${err.message}`);
      skipCount++;
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
  
  return { success: true, successCount, skipCount, errors };
}

export async function updateEventDetails(eventId: string, updateData: any) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)

  if (error) return { error: error.message }

  revalidatePath('/admin', 'layout')
  revalidatePath('/events', 'layout')
  revalidatePath('/event-portal', 'layout')
  revalidatePath(`/admin/events/${eventId}`, 'page')
  return { success: true }
}

export async function syncOfflineCheckins(eventId: string, checkins: Array<{
  id?: number;
  hash: string;
  type: 'PRIMARY' | 'MEMBER';
  memberIndex?: number;
}>) {
  const supabase = await createClient()

  // Verify access
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('member_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'core_member')) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();

  let successCount = 0;
  const successIds: number[] = [];
  const errors: string[] = [];

  for (const checkin of checkins) {
    try {
      if (checkin.type === 'PRIMARY') {
        const { error } = await supabaseAdmin
          .from('registrations')
          .update({ checked_in: true })
          .eq('hash_payload', checkin.hash)
          .eq('event_id', eventId);
          
        if (error) {
          errors.push(`Failed to check in primary ${checkin.hash}: ${error.message}`);
        } else {
          successCount++;
          if (checkin.id) successIds.push(checkin.id);
        }
      } else if (checkin.type === 'MEMBER' && typeof checkin.memberIndex === 'number') {
        // Fetch latest team_data
        const { data: reg, error: fetchError } = await supabaseAdmin
          .from('registrations')
          .select('team_data')
          .eq('hash_payload', checkin.hash)
          .eq('event_id', eventId)
          .single();

        if (fetchError || !reg) {
          errors.push(`Failed to fetch registration for member checkin: ${fetchError?.message}`);
          continue;
        }

        const teamData = { ...reg.team_data };
        if (teamData && teamData.members && teamData.members[checkin.memberIndex]) {
          teamData.members[checkin.memberIndex].checked_in = true;
          
          const { error: updateError } = await supabaseAdmin
            .from('registrations')
            .update({ team_data: teamData })
            .eq('hash_payload', checkin.hash)
            .eq('event_id', eventId);

          if (updateError) {
            errors.push(`Failed to check in member index ${checkin.memberIndex} of ${checkin.hash}: ${updateError.message}`);
          } else {
            successCount++;
            if (checkin.id) successIds.push(checkin.id);
          }
        } else {
          errors.push(`Invalid member index ${checkin.memberIndex} for ${checkin.hash}`);
        }
      }
    } catch (e: any) {
      errors.push(`System exception checking in ${checkin.hash}: ${e.message}`);
    }
  }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true, successCount, successIds, errors };
}

