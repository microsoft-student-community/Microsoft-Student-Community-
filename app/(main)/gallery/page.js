import { createPublicClient } from "@/utils/supabase/public";
import GalleryClientWrapper from "./GalleryClientWrapper";
import "./gallery-premium.css";

export const metadata = {
  title: "Gallery | MSC SRMAP",
  description:
    "An interactive chronicle of hackathons, technical bootcamps, hardware exhibitions, and community moments hosted by Microsoft Student Community at SRM University AP.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  try {
    const supabase = createPublicClient();
    const { data: galleryItems, error } = await supabase
      .from("gallery_items")
      .select("id, title, category, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return <GalleryClientWrapper items={galleryItems || []} />;
  } catch (error) {
    console.error("Error fetching gallery items:", error);
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
            Failed to load gallery
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            We couldn&apos;t connect to the media server. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
