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

  if (!profile || profile.role !== 'admin') {
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
    const { error: teamErr } = await supabaseAdmin.from('teams').delete().eq('id', regData.team_data.team_id)
    if (teamErr) console.error('Error deleting team:', teamErr)
  }

  // Delete payment orders first to avoid foreign key constraint violations
  await supabaseAdmin.from('payment_orders').delete().eq('registration_id', regId)

  const { error } = await supabaseAdmin
    .from('registrations')
    .delete()
    .eq('id', regId)

  if (error) {
    console.error('Error deleting registration:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true }
}

export async function deleteBulkRegistrations(eventId: string, regIds: string[]) {
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
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createAdminClient();

  // Get team_ids to delete from teams if applicable
  const { data: regDatas } = await supabaseAdmin
    .from('registrations')
    .select('team_data')
    .in('id', regIds)

  const teamIds = regDatas
    ?.map((r: any) => r.team_data?.team_id)
    .filter(Boolean)

  if (teamIds && teamIds.length > 0) {
    const { error: teamErr } = await supabaseAdmin.from('teams').delete().in('id', teamIds)
    if (teamErr) console.error('Error deleting teams:', teamErr)
  }

  // Delete payment orders first to avoid foreign key constraint violations
  await supabaseAdmin.from('payment_orders').delete().in('registration_id', regIds)

  const { error } = await supabaseAdmin
    .from('registrations')
    .delete()
    .in('id', regIds)

  if (error) {
    console.error('Error deleting bulk registrations:', error)
    return { error: error.message }
  }

  revalidatePath(`/admin/events/${eventId}`)
  return { success: true }
}

function cleanString(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val).replace(/\u00A0/g, ' ').trim();
  const lower = s.toLowerCase();
  if (lower === 'none' || lower === 'n/a' || lower === 'null' || lower === 'undefined' || lower === '-' || lower === 'no') {
    return '';
  }
  return s;
}

function getField(row: Record<string, any>, possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      const cleaned = cleanString(row[key]);
      if (cleaned) return cleaned;
    }
  }
  // Try case-insensitive matching across actual row keys
  const rowKeys = Object.keys(row);
  for (const pattern of possibleKeys) {
    const patternLower = pattern.toLowerCase().trim();
    const matchedKey = rowKeys.find(k => k.toLowerCase().trim() === patternLower);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      const cleaned = cleanString(row[matchedKey]);
      if (cleaned) return cleaned;
    }
  }
  return '';
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
    // 1. Extract Team Leader (Team Member 1) and Team Name
    const teamName = getField(row, [
      'Team Name',
      'Team',
      'team_name',
      'Team name'
    ]);

    let leadEmail = getField(row, [
      'Team Member 1 SRM Official Email ID',
      'Member 1 SRM Official Email ID',
      'Team Member 1 SRM Official Email',
      'Team Member 1 Email ID',
      'Team Member 1 Email',
      'Member 1 Email',
      'SRM Official Email ID',
      'Email Address',
      'Email',
      'email',
      "Candidate's Email"
    ]);

    const leadName = getField(row, [
      'Team Member 1 Name',
      'Member 1 Name',
      'Team Leader Name',
      'Leader Name',
      'Name',
      'Full Name',
      'name',
      'First Name',
      "Candidate's Name"
    ]);

    // Cleanly skip empty / abandoned CSV rows (e.g. trailing blank lines)
    if (!leadEmail && !teamName && !leadName) {
      continue;
    }

    if (!leadEmail) {
      errors.push(`Row ${skipCount + successCount + 1}: Missing SRM official email for Team Member 1 (Team Leader). Expected 'Team Member 1 SRM Official Email ID'.`);
      skipCount++;
      continue;
    }

    leadEmail = leadEmail.toLowerCase().trim();

    let leadRegNum = getField(row, [
      'Team Member 1 Registration Number',
      'Member 1 Registration Number',
      'Team Member 1 Reg Number',
      'Team Member 1 Reg No',
      'Registration Number',
      'Registration No',
      'Roll Number',
      'reg_num',
      "Candidate's Registration Number"
    ]);
    if (leadRegNum) leadRegNum = leadRegNum.toUpperCase().trim();

    const leadPhone = getField(row, [
      'Team Member 1 Mobile Number',
      'Member 1 Mobile Number',
      'Team Member 1 Mobile',
      'Team Member 1 Phone',
      'Mobile Number',
      'Phone Number',
      'Phone',
      'Mobile',
      'Contact Number'
    ]);

    const collegeName = getField(row, [
      'College Name',
      'College',
      'Institution Name',
      "Candidate's Organisation"
    ]) || 'SRM University AP';

    const year = getField(row, [
      'Year of Study',
      'Year',
      'Year of Graduation'
    ]) || 'Unknown';

    // 2. Extract Normal Team Members (Members 2 to 10)
    const members: Array<{
      fullName: string;
      email: string;
      regNum: string;
      phone?: string;
      role?: string;
      checked_in: boolean;
    }> = [];

    for (let i = 2; i <= 10; i++) {
      const mName = getField(row, [
        `Team Member ${i} Name`,
        `Member ${i} Name`,
        `Team Member ${i}: Name`,
        `Member ${i}: Name`
      ]);

      let mRegNum = getField(row, [
        `Team Member ${i} Registration Number`,
        `Member ${i} Registration Number`,
        `Team Member ${i} Reg Number`,
        `Team Member ${i} Reg No`,
        `Member ${i} Reg No`
      ]);
      if (mRegNum) mRegNum = mRegNum.toUpperCase().trim();

      let mEmail = getField(row, [
        `Team Member ${i} SRM Official Email ID`,
        `Member ${i} SRM Official Email ID`,
        `Team Member ${i} SRM Official Email`,
        `Team Member ${i} Email`,
        `Member ${i} Email`,
        `Team Member ${i} Email ID`,
        `Member ${i} Email ID`
      ]);
      if (mEmail) mEmail = mEmail.toLowerCase().trim();

      const mPhone = getField(row, [
        `Team Member ${i} Mobile Number`,
        `Member ${i} Mobile Number`,
        `Team Member ${i} Mobile`,
        `Team Member ${i} Phone`,
        `Member ${i} Phone`
      ]);

      // If at least name, email, or registration number is provided, add as normal team member
      if (mName || mEmail || mRegNum) {
        members.push({
          fullName: mName || (mEmail ? mEmail.split('@')[0] : `Member ${i}`),
          email: mEmail,
          regNum: mRegNum,
          phone: mPhone || undefined,
          role: 'Member',
          checked_in: false
        });
      }
    }

    // 3. Extract Senior Student (if added) as a normal member
    const seniorName = getField(row, [
      'Senior Student Name',
      'Senior Name'
    ]);

    let seniorRegNum = getField(row, [
      'Senior Student Registration Number',
      'Senior Registration Number',
      'Senior Reg No'
    ]);
    if (seniorRegNum) seniorRegNum = seniorRegNum.toUpperCase().trim();

    let seniorEmail = getField(row, [
      'Senior Student SRM Official Email ID',
      'Senior Student Email',
      'Senior Email'
    ]);
    if (seniorEmail) seniorEmail = seniorEmail.toLowerCase().trim();

    const seniorPhone = getField(row, [
      'Senior Student Mobile Number',
      'Senior Mobile Number',
      'Senior Phone'
    ]);

    if (seniorName || seniorEmail || seniorRegNum) {
      // Check if this senior student was already captured in members (deduplicate)
      const existingMember = members.find(m => 
        (seniorEmail && m.email && m.email.toLowerCase() === seniorEmail.toLowerCase()) ||
        (seniorRegNum && m.regNum && m.regNum.toUpperCase() === seniorRegNum.toUpperCase())
      );

      if (existingMember) {
        existingMember.role = 'Member';
        if (seniorPhone && !existingMember.phone) existingMember.phone = seniorPhone;
      } else {
        members.push({
          fullName: seniorName || (seniorEmail ? seniorEmail.split('@')[0] : 'Member'),
          email: seniorEmail,
          regNum: seniorRegNum,
          phone: seniorPhone || undefined,
          role: 'Member',
          checked_in: false
        });
      }
    }

    try {
      const formData: Record<string, any> = {
        fullName: leadName,
        email: leadEmail,
        regNum: leadRegNum || undefined,
        phone: leadPhone || undefined,
        collegeName: collegeName,
        year: year
      };

      const teamData = (teamName || members.length > 0) ? {
        teamName: teamName || `${leadName}'s Team`,
        team_name: teamName || `${leadName}'s Team`,
        leadIndex: 0,
        team_lead_index: 0,
        members: members
      } : null;

      // Check if registration already exists for this email
      const { data: existingReg } = await supabaseAdmin.from('registrations')
        .select('id, team_data')
        .eq('event_id', eventId)
        .eq('lead_email', leadEmail)
        .maybeSingle();

      if (existingReg) {
        // If existing registration has no team members and we now have members, enrich it!
        const existingMembers = existingReg.team_data?.members;
        if ((!existingMembers || existingMembers.length === 0) && teamData && teamData.members.length > 0) {
          await supabaseAdmin.from('registrations')
            .update({
              team_data: teamData,
              form_data: formData
            })
            .eq('id', existingReg.id);
          successCount++;
          continue;
        }

        skipCount++;
        continue;
      }

      const hashPayload = crypto.randomUUID();
      const { error: regError } = await supabaseAdmin.from('registrations').insert({
        event_id: eventId,
        lead_email: leadEmail,
        form_data: formData,
        team_data: teamData,
        hash_payload: hashPayload,
        checked_in: false
      });

      if (regError) {
        errors.push(`Failed to create registration for ${leadEmail}: ${regError.message}`);
        skipCount++;
      } else {
        successCount++;
      }

    } catch (err: any) {
      errors.push(`Exception for ${leadEmail}: ${err.message}`);
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
  revalidatePath('/events', 'layout')
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

