import { createPublicClient } from "@/utils/supabase/public";
import EventsClientWrapper from "./EventsClientWrapper";
import "./events-premium.css";

export const revalidate = 60;

export default async function EventsPage() {
  try {
    const supabase = createPublicClient();
    const { data: events, error } = await supabase
      .from("events")
      .select(
        "id, slug, title, type, description, status, location, image_url, date_start, date_end",
      )
      .order("date_start", { ascending: false });

    if (error) throw error;
    return <EventsClientWrapper events={events || []} />;
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
