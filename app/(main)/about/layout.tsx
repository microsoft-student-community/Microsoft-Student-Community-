import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Mission, Heritage & Vision",
  description:
    "Discover the Microsoft Student Community at SRM University-AP. Learn about our founding ethos, initiatives, leadership, and student-first engineering culture.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Us — Microsoft Student Community · SRM University AP",
    description:
      "Discover our mission, initiatives, leadership, and student-first engineering culture at SRM University AP.",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "About MSC SRMAP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — Microsoft Student Community · SRM University AP",
    description:
      "Discover our mission, initiatives, leadership, and student-first engineering culture at SRM University AP.",
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
      name: "About",
      item: "https://mscsrmap.xyz/about",
    },
  ],
};

export default function AboutLayout({
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

