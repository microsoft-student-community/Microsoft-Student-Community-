import { createPublicClient } from "@/utils/supabase/public";
import EventsClientWrapper from "./EventsClientWrapper";
import "./events-premium.css";

export const revalidate = 60;

const EVENT_SELECT = [
  "id",
  "slug",
  "title",
  "type",
  "description",
  "status",
  "location",
  "image_url",
  "date_start",
  "date_end",
].join(", ");

const EVENTS_LOGO =
  "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png";
const DEFAULT_DESCRIPTION =
  "Explore hackathons, workshops, bootcamps, and technical conferences hosted by Microsoft Student Community at SRM University AP.";

async function getPublicEvents() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("date_start", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function generateMetadata() {
  try {
    const events = await getPublicEvents();
    const eventNames = events
      .map((event) => event.title)
      .filter(Boolean)
      .slice(0, 10);
    const description = eventNames.length
      ? `Explore MSC SRMAP events at SRM University AP, including ${eventNames.join(", ")}. Find event details, dates, workshops, hackathons, and registration information.`
      : DEFAULT_DESCRIPTION;

    return {
      title: {
        absolute: "Events — Hackathons, Workshops & Tech Events | MSC SRMAP",
      },
      description,
      keywords: [
        "MSC SRMAP events",
        "Microsoft Student Community events",
        "SRM University AP hackathons",
        "SRMAP workshops",
        ...eventNames,
      ],
      alternates: { canonical: "/events" },
      openGraph: {
        url: "/events",
        title: "Events — Microsoft Student Community · SRM University AP",
        description,
        images: [
          {
            url: EVENTS_LOGO,
            width: 1200,
            height: 630,
            alt: "MSC SRMAP events",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Events — Microsoft Student Community · SRM University AP",
        description,
        images: [EVENTS_LOGO],
      },
    };
  } catch {
    return {
      title: {
        absolute: "Events — Hackathons, Workshops & Tech Events | MSC SRMAP",
      },
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: "/events" },
    };
  }
}

export default async function EventsPage() {
  try {
    const events = await getPublicEvents();
    return <EventsClientWrapper events={events} />;
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0f14",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            Failed to load events
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            We&apos;re having trouble connecting to the database. Please try
            again later.
          </p>
        </div>
      </div>
    );
  }
}
