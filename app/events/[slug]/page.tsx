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
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ invite?: string }>;
}) {
    const { slug } = await params;
    const { invite } = await searchParams;
    const supabase = createPublicClient();

    let selectedEvent = null;

    if (slug) {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(slug);

        const query = supabase.from("events").select("*");
        if (isUuid) {
            query.eq("id", slug);
        } else {
            query.eq("slug", slug);
        }

        const { data } = await query.single();
        selectedEvent = data;

        if (!selectedEvent) redirect("/events");

        // --- Custom UI Routing ---
        // If this event has a custom static UI, redirect to it.
        const isSynoraEvent = (selectedEvent.slug && selectedEvent.slug.toLowerCase() === 'synora') || 
                              (selectedEvent.slug && selectedEvent.slug.toLowerCase().includes('synora-o2ou')) || 
                              (selectedEvent.slug && selectedEvent.slug.toLowerCase().includes('synora-pitstop')) || 
                              (selectedEvent.title && selectedEvent.title.toLowerCase().includes('synora'));
                              
        if (isSynoraEvent) {
            // Bust browser cache during development by appending a timestamp
            const timestamp = new Date().getTime();
            return (
                <div className="w-full h-screen m-0 p-0 overflow-hidden relative z-50 bg-[#101010]">
                    <iframe 
                        src={`/custom-events/synora-pitstop-01/index.html?v=${timestamp}`}
                        className="w-full h-full border-none block bg-[#101010]"
                        title="Synora Pitstop Event"
                    />
                </div>
            );
        }
    }

    // Fetch invited team if invite param exists
    let invitedTeam = null;
    let openTeams: any[] = [];

    if (invite && selectedEvent?.id) {
        const { data: team } = await supabase
            .from("teams")
            .select("*")
            .eq("id", invite)
            .eq("event_id", selectedEvent.id)
            .single();
        invitedTeam = team;
    }

    return (
        <EventPortalClient
            selectedEvent={selectedEvent}
            invitedTeam={invitedTeam}
        />
    );
}
