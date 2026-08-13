"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

/**
 * Submit a public (unauthenticated) registration for an event.
 * Uses the service-role Supabase client so no user session is required.
 */
export async function submitPublicRegistration(eventId: string, formData: any) {
 // 🔒 INPUT VALIDATION
 const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 if (!eventId || typeof eventId !== "string" || !UUID_REGEX.test(eventId)) {
  return { error: "Invalid event ID." };
 }

 if (!formData || typeof formData !== "object") {
  return { error: "Invalid form data." };
 }

 // Sanitize string fields: trim and enforce max length
 const sanitize = (val: unknown, maxLen = 500): string => {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
 };

 const email = sanitize(formData.email, 254);
 if (!email || !email.includes("@")) {
  return { error: "A valid email address is required." };
 }

 const fullName = sanitize(formData.fullName, 200);
 if (!fullName) {
  return { error: "Full name is required." };
 }

 // Sanitize all optional fields
 formData.fullName = fullName;
 formData.email = email;
 formData.year = sanitize(formData.year, 20);
 formData.regNum = sanitize(formData.regNum, 50);
 formData.branch = sanitize(formData.branch, 100);
 formData.specialization = sanitize(formData.specialization, 100);
 formData.collegeName = sanitize(formData.collegeName, 200);
 formData.city = sanitize(formData.city, 100);
 if (formData.teamName) formData.teamName = sanitize(formData.teamName, 200);

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
 .select("id, registration_open, max_capacity, form_requirements")
 .eq("id", eventId)
 .single();

 if (!event) return { error: "Event not found." };
 if (!event.registration_open)
 return { error: "Registrations are currently closed for this event." };

 const reqs = event.form_requirements || {};
 const minTeamSize = Number(reqs.min_team_size) || 1;
 const maxTeamSize = Number(reqs.max_team_size) || 1;
 const teamsRequired = !!(reqs.allow_teams && maxTeamSize > 1);

 if (teamsRequired && !formData.teamName) {
 return {
 error: "This event requires team registration. Please register as part of a team.",
 };
 }

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

 if (formData.teamName) {
 const filledMembers = formData.teamMembers?.length
 ? formData.teamMembers.filter(
 (m: any) => m.email && String(m.email).trim() !== "",
 ).length
 : 0;
 const totalMembers = 1 + filledMembers;

 if (totalMembers < minTeamSize) {
 return {
 error: `A team needs at least ${minTeamSize} member${minTeamSize > 1 ? "s" : ""}. Please add ${minTeamSize - 1} more member${minTeamSize - 1 > 1 ? "s" : ""}.`,
 };
 }

 if (totalMembers > maxTeamSize) {
 return { error: `Teams can have a maximum of ${maxTeamSize} members.` };
 }

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
 members: (formData.teamMembers || []).map((m: any) => ({
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
 payment_data: formData.payment_data || null,
 },
 team_data: teamData,
 checked_in: false,
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

 return {
 success: true,
 hash_payload: registration.hash_payload,
 };
}
