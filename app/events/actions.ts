"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { sendTeamJoinNotificationEmail } from "@/utils/resend";

/**
 * Submit a public (unauthenticated) registration for an event.
 * Uses the service-role Supabase client so no user session is required.
 */
export async function submitPublicRegistration(eventId: string, formData: any) {
  const supabase = createAdminClient();

  // Check if already registered
  const { data: existing } = await supabase
    .from("registrations")
    .select("id, hash_payload")
    .eq("event_id", eventId)
    .eq("lead_email", formData.email?.toLowerCase())
    .maybeSingle();

  if (existing) {
    return {
      error:
        "You are already registered for this event with this email address.",
    };
  }

  // Check event capacity & status
  const { data: event } = await supabase
    .from("events")
    .select("id, registration_open, max_capacity")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found." };
  if (!event.registration_open)
    return { error: "Registrations are currently closed for this event." };

  // Count existing registrations
  const { count } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .neq("status", "cancelled");

  const isWaitlisted = event.max_capacity && (count || 0) >= event.max_capacity;

  const hash = crypto.randomUUID();

  // Build team data
  let teamData = null;
  let teamId = null;

  if (formData.teamName && formData.teamMembers?.length > 0) {
    // Create team first
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        event_id: eventId,
        team_name: formData.teamName,
        leader_name: formData.fullName,
        leader_email: formData.email?.toLowerCase(),
        leader_year: formData.year,
        leader_branch: formData.branch || null,
        looking_for_members: formData.lookingForMembers || false,
      })
      .select("id")
      .single();

    if (teamError) {
      console.error("Team creation failed:", teamError);
      return { error: "Failed to create team. Please try again." };
    }
    teamId = team.id;

    teamData = {
      team_id: teamId,
      team_name: formData.teamName,
      members: formData.teamMembers.map((m: any) => ({
        fullName: m.fullName,
        email: m.email,
        year: m.year,
        regNum: m.regNum,
        branch: m.branch,
        checked_in: false,
      })),
      team_lead_index: formData.teamLeadIndex || 0,
    };
  }

  // Insert registration
  const { data: registration, error } = await supabase
    .from("registrations")
    .insert({
      event_id: eventId,
      lead_email: formData.email?.toLowerCase(),
      hash_payload: hash,
      status: isWaitlisted ? "waitlisted" : "confirmed",
      form_data: {
        fullName: formData.fullName,
        email: formData.email,
        year: formData.year,
        regNum: formData.regNum,
        branch: formData.branch,
        specialization: formData.specialization,
        collegeName: formData.collegeName,
        city: formData.city,
      },
      team_data: teamData,
      checked_in: false,
      payment_data: formData.payment_data || null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Registration insert failed:", error);
    return { error: "Registration failed. Please try again." };
  }

  return {
    success: true,
    hash_payload: hash,
    team_id: teamId,
    registration,
    isWaitlisted,
  };
}

/**
 * Lookup a registration by event ID and team lead email.
 */
export async function lookupTeamRegistration(eventId: string, email: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("lead_email", email.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    return { error: "No registration found for this email address." };
  }

  return {
    success: true,
    hash_payload: data.hash_payload,
    registration: data,
  };
}

/**
 * Join an open matchmaking team.
 */
export async function joinMatchmakingTeam(teamId: string, memberData: any) {
  const supabase = createAdminClient();

  // Get team info
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*, registrations!inner(id, event_id, team_data, hash_payload)")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    return { error: "Team not found or no longer accepting members." };
  }

  const registration = team.registrations?.[0] || team.registrations;
  if (!registration) return { error: "No registration linked to this team." };

  // Add member to team data
  const updatedTeamData = registration.team_data || { members: [] };
  updatedTeamData.members = updatedTeamData.members || [];
  updatedTeamData.members.push({
    fullName: memberData.fullName,
    email: memberData.email,
    year: memberData.year,
    branch: memberData.branch,
    regNum: memberData.regNum,
    checked_in: false,
  });

  const { error: updateError } = await supabase
    .from("registrations")
    .update({ team_data: updatedTeamData })
    .eq("id", registration.id);

  if (updateError) {
    console.error("Failed to join team:", updateError);
    return { error: "Failed to join team. Please try again." };
  }

  // Fire-and-forget notification email to team leader
  supabase.from("events").select("title").eq("id", team.event_id).single().then(({ data: ev }: { data: any }) => {
    if (ev) {
      sendTeamJoinNotificationEmail({
        to: team.leader_email,
        leaderName: team.leader_name || 'Team Leader',
        teamName: team.team_name,
        eventTitle: ev.title,
        newMemberName: memberData.fullName || 'Participant',
        newMemberEmail: memberData.email || '',
      }).then(() => {}, (e: any) => console.error("Team join email error:", e));
    }
  }, (e: any) => console.error("Team join event lookup error:", e));

  return {
    success: true,
    hash_payload: registration.hash_payload,
  };
}
