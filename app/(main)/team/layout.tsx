import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Collective — Board, Directors & Core Engineers",
  description:
    "Meet the developers, designers, directors, and leaders driving the Microsoft Student Community at SRM University-AP.",
  alternates: { canonical: "/team" },
  openGraph: {
    url: "/team",
    title: "Team & Leadership — Microsoft Student Community · SRM University AP",
    description:
      "Meet the developers, designers, directors, and leaders driving the Microsoft Student Community at SRM University-AP.",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "MSC SRMAP Team & Leadership",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team & Leadership — Microsoft Student Community · SRM University AP",
    description:
      "Meet the developers, designers, directors, and leaders driving the Microsoft Student Community at SRM University-AP.",
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
      name: "Team",
      item: "https://mscsrmap.xyz/team",
    },
  ],
};

export default function TeamLayout({
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

