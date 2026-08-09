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

    // Fetch all events for the selector
    const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("date_start", { ascending: false });

    if (!params.event) {
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

    return (
        <EventPortalClient
            selectedEvent={selectedEvent}
        />
    );
}
