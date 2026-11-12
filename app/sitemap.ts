import { MetadataRoute } from "next";
import { createPublicClient } from "@/utils/supabase/public";

export const dynamic = "force-dynamic";

const toDate = (value: unknown, fallback: Date) => {
  if (!value) return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const getEventEntries = async (baseUrl: string, fallbackDate: Date) => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select("slug, status, date_start")
      .not("slug", "is", null);

    if (error || !data) return [];

    return data
      .filter(
        (event: {
          slug?: string | null;
          status?: string | null;
          date_start?: string | null;
        }) => event.slug,
      )
      .map(
        (event: {
          slug: string;
          status?: string | null;
          date_start?: string | null;
        }) => ({
        url: `${baseUrl}/events/${encodeURIComponent(event.slug)}`,
        lastModified: toDate(event.date_start, fallbackDate),
        changeFrequency:
          event.status === "upcoming" ? ("daily" as const) : ("monthly" as const),
        priority: 0.8,
      }));
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://mscsrmap.xyz"
  ).replace(/\/+$/, "");
  const lastModified = new Date();
  const eventEntries = await getEventEntries(baseUrl, lastModified);

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...eventEntries,
    {
      url: `${baseUrl}/gallery`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/custom-events/synora-pitstop-01`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];
}
