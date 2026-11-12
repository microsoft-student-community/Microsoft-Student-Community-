import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events — Hackathons, Workshops & Tech Summits",
  description:
    "Explore hackathons, workshops, bootcamps, and technical conferences hosted by Microsoft Student Community at SRM University-AP.",
  alternates: { canonical: "/events" },
  openGraph: {
    url: "/events",
    title: "Events — Microsoft Student Community · SRM University AP",
    description:
      "Explore upcoming hackathons, AI bootcamps, Azure workshops, and flagship tech events at SRM University AP.",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "MSC SRMAP Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events — Microsoft Student Community · SRM University AP",
    description:
      "Explore upcoming hackathons, AI bootcamps, Azure workshops, and flagship tech events at SRM University AP.",
    images: [
      "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://mscsrmap.xyz",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Events",
      item: "https://mscsrmap.xyz/events",
    },
  ],
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
