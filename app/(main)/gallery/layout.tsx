import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Community Moments & Hackathon Highlights",
  description:
    "Explore the visual chronicle of MSC SRMAP — hackathons, project showcases, tech workshops, and student developer memories.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    url: "/gallery",
    title: "Gallery — Microsoft Student Community · SRM University AP",
    description:
      "Explore the visual chronicle of MSC SRMAP — hackathons, project showcases, tech workshops, and student developer memories.",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "MSC SRMAP Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Microsoft Student Community · SRM University AP",
    description:
      "Explore the visual chronicle of MSC SRMAP — hackathons, project showcases, tech workshops, and student developer memories.",
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
      name: "Gallery",
      item: "https://mscsrmap.xyz/gallery",
    },
  ],
};

export default function GalleryLayout({
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

