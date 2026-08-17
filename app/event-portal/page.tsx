import { createPublicClient } from "@/utils/supabase/public";
import { redirect } from "next/navigation";
import EventPortalClient from "./EventPortalClient";

export const dynamic = "force-dynamic";

type EventSummary = {
    id: string;
    slug?: string | null;
    registration_open?: boolean | null;
    status?: string | null;
};

export default async function EventPortalPage({
    searchParams,
}: {
    searchParams: Promise<{ event?: string; invite?: string }>;
}) {
    const params = await searchParams;
    const supabase = createPublicClient();

    if (!params.event) {
        // Fetch minimal event summary only when resolving default fallback
        const { data: events } = await supabase
            .from("events")
            .select("id, slug, registration_open, status")
            .order("date_start", { ascending: false });

        const defaultEvent =
            events?.find((event: EventSummary) => event.registration_open && event.status !== "completed") ||
            events?.find((event: EventSummary) => event.status !== "completed") ||
            events?.[0];
        redirect(defaultEvent ? `/event-portal?event=${defaultEvent.slug || defaultEvent.id}` : "/events");
    }

    // If a specific event is requested, fetch its details
    let selectedEvent = null;

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

        if (!selectedEvent) redirect("/events");
    }

    // Fetch invited team if invite param exists
    let invitedTeam = null;
    let openTeams: any[] = [];

    if (params.invite && selectedEvent?.id) {
        const { data: team } = await supabase
            .from("teams")
            .select("*")
            .eq("id", params.invite)
            .eq("event_id", selectedEvent.id)
            .single();
        invitedTeam = team;
    }

    // Fetch open teams for matchmaking tab
    if (selectedEvent?.id) {
        const { data: teams } = await supabase
            .from("teams")
            .select("*")
            .eq("event_id", selectedEvent.id)
            .eq("looking_for_members", true);
        openTeams = teams || [];
    }

    return (
        <EventPortalClient
            selectedEvent={selectedEvent}
            invitedTeam={invitedTeam}
            openTeams={openTeams}
        />
    );
}
