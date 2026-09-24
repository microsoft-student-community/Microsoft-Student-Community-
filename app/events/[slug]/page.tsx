import type { Metadata } from "next";
import { cache } from "react";
import { createPublicClient } from "@/utils/supabase/public";
import { redirect } from "next/navigation";
import EventPortalClient from "./EventPortalClient";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://mscsrmap.xyz"
).replace(/\/+$/, "");
const DEFAULT_EVENT_IMAGE =
  "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png";
const EVENT_SELECT = "*";

type EventRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invite?: string; view?: string }>;
};

const getEventBySlug = cache(async (slug: string) => {
  try {
    const supabase = createPublicClient();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(slug);
    const query = supabase.from("events").select(EVENT_SELECT);

    if (isUuid) {
      query.eq("id", slug);
    } else {
      query.eq("slug", slug);
    }

    const { data, error } = await query.maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
});

const getEventPath = (slug: string) => `/events/${encodeURIComponent(slug)}`;

const getEventLabel = (event: any) => {
  const type = String(event.type || "event").replace(/[-_]+/g, " ");
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getEventDescription = (event: any) => {
  const description = String(
    event.description ||
      `Join ${event.title} at Microsoft Student Community, SRM University AP.`,
  )
    .replace(/\s+/g, " ")
    .trim();

  return description.length > 300
    ? `${description.slice(0, 297).trimEnd()}…`
    : description;
};

const getEventImage = (event: any) =>
  event.banner_url || event.image_url || DEFAULT_EVENT_IMAGE;

const getEventStructuredData = (event: any, routeSlug: string) => {
  const eventSlug = event.slug || routeSlug;
  const eventUrl = `${SITE_URL}${getEventPath(eventSlug)}`;
  const community = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Microsoft Student Community — SRM University AP",
    url: SITE_URL,
  };
  const requirements = event.form_requirements || {};
  const fee = Number(requirements.registration_fee);
  const isFree = requirements.event_pricing === "free" || fee === 0;
  const hasFee = Number.isFinite(fee) && fee > 0;
  const offer = isFree
    ? {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: event.registration_open
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: eventUrl,
      }
    : hasFee
      ? {
          "@type": "Offer",
          price: String(fee),
          priceCurrency: "INR",
          availability: event.registration_open
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: eventUrl,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Event",
        "@id": `${eventUrl}#event`,
        name: event.title,
        description: getEventDescription(event),
        url: eventUrl,
        ...(event.date_start ? { startDate: event.date_start } : {}),
        ...(event.date_end ? { endDate: event.date_end } : {}),
        eventStatus:
          event.status === "completed"
            ? "https://schema.org/EventCompleted"
            : "https://schema.org/EventScheduled",
        eventAttendanceMode:
          "https://schema.org/OfflineEventAttendanceMode",
        ...(event.location
          ? {
              location: {
                "@type": "Place",
                name: event.location,
              },
            }
          : {}),
        image: [getEventImage(event)],
        organizer: community,
        ...(offer ? { offers: offer } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${eventUrl}#webpage`,
        url: eventUrl,
        name: `${event.title} — Microsoft Student Community SRMAP`,
        description: getEventDescription(event),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${eventUrl}#event` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Events",
            item: `${SITE_URL}/events`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: event.title,
            item: eventUrl,
          },
        ],
      },
    ],
  };
};

function EventStructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: EventRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const { invite, view } = await searchParams;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event — Microsoft Student Community SRMAP",
      robots: { index: false, follow: false },
    };
  }

  const title = `${event.title} — ${getEventLabel(event)} | Microsoft Student Community SRMAP`;
  const description = getEventDescription(event);
  const eventPath = getEventPath(event.slug || slug);
  const image = getEventImage(event);
  const isPrivateView = Boolean(invite || view === "portal");

  return {
    title: { absolute: title },
    description,
    keywords: [
      event.title,
      `${event.title} MSC SRMAP`,
      `${event.title} Microsoft Student Community`,
      `${event.title} SRM University AP`,
      getEventLabel(event),
      "MSC SRMAP events",
    ],
    alternates: { canonical: eventPath },
    robots: isPrivateView
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      url: eventPath,
      title,
      description,
      siteName: "Microsoft Student Community · SRM University AP",
      locale: "en_US",
      images: [
        {
          url: image,
          alt: `${event.title} — Microsoft Student Community SRMAP`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@mscsrmap",
      creator: "@mscsrmap",
      images: [image],
    },
  };
}

export default async function EventPortalPage({
  params,
  searchParams,
}: EventRouteProps) {
  const { slug } = await params;
  const { invite, view } = await searchParams;
  const selectedEvent = await getEventBySlug(slug);

  if (!selectedEvent) redirect("/events");

  const structuredData = getEventStructuredData(selectedEvent, slug);
  const isSynoraEvent =
    (selectedEvent.slug &&
      selectedEvent.slug.toLowerCase() === "synora") ||
    (selectedEvent.slug &&
      selectedEvent.slug.toLowerCase().includes("synora-o2ou")) ||
    (selectedEvent.slug &&
      selectedEvent.slug.toLowerCase().includes("synora-pitstop")) ||
    (selectedEvent.title &&
      selectedEvent.title.toLowerCase().includes("synora"));

  if (isSynoraEvent && view !== "portal") {
    const timestamp = new Date().getTime();
    return (
      <>
        <EventStructuredData data={structuredData} />
        <div className="w-full h-screen m-0 p-0 overflow-hidden relative z-50 bg-[#101010]">
          <iframe
            src={`/custom-events/synora-pitstop-01/index.html?v=${timestamp}`}
            className="w-full h-full border-none block bg-[#101010]"
            title={`${selectedEvent.title} — Microsoft Student Community event`}
          />
        </div>
      </>
    );
  }

  let invitedTeam = null;

  if (invite && selectedEvent?.id) {
    const supabase = createPublicClient();
    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("id", invite)
      .eq("event_id", selectedEvent.id)
      .single();
    invitedTeam = team;
  }

  return (
    <>
      <EventStructuredData data={structuredData} />
      <EventPortalClient
        selectedEvent={selectedEvent}
        invitedTeam={invitedTeam}
      />
    </>
  );
}
