import { createPublicClient } from "@/utils/supabase/public";
import EventPortalClient from "./EventPortalClient";

export const dynamic = "force-dynamic";

export default async function EventPortalPage({
 searchParams,
}: {
 searchParams: Promise<{ event?: string; invite?: string }>;
}) {
 const params = await searchParams;
 const supabase = createPublicClient();

 // Fetch all events for the selector
 const { data: events } = await supabase
 .from("events")
 .select("*")
 .eq("is_published", true)
 .order("date_start", { ascending: false });

 // If a specific event is requested, fetch its details
 let selectedEvent = null;
 let openTeams: any[] = [];
 let invitedTeam = null;

 if (params.event) {
 const uuidRegex =
 /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const isUuid = uuidRegex.test(params.event);

 const query = supabase.from("events").select("*");
 if (isUuid) {
 query.eq("id", params.event);
 } else {
 query.eq("slug", params.event);
 }

 const { data } = await query.single();
 selectedEvent = data;

 if (selectedEvent) {
 // Fetch open teams for matchmaking
 const { data: teams } = await supabase
 .from("teams")
 .select("*")
 .eq("event_id", selectedEvent.id)
 .eq("looking_for_members", true);
 openTeams = teams || [];

 // If invite param, fetch that team
 if (params.invite) {
 const { data: team } = await supabase
 .from("teams")
 .select("*")
 .eq("id", params.invite)
 .single();
 invitedTeam = team;
 }
 }
 }

 return (
 <EventPortalClient
 events={events || []}
 selectedEvent={selectedEvent}
 openTeams={openTeams}
 invitedTeam={invitedTeam}
 />
 );
}
