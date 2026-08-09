import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://mscsrmap.edu.in"),
  title: "Microsoft Student Community - SRM University AP",
  description:
    "Microsoft Student Community at SRM University AP - A vibrant student-led tech community focused on Azure, AI, and cloud computing.",
  keywords: [
    "MSC",
    "Microsoft Student Community",
    "SRMAP",
    "SRM University AP",
    "Tech Community",
    "Hackathons",
    "Azure",
    "Cloud Computing",
  ],
  openGraph: {
    title: "Microsoft Student Community - SRM University AP",
    description:
      "Bridge the gap between classroom theory and production-grade code. Join the most active engineering community at SRMAP.",
    url: "https://mscsrmap.edu.in",
    siteName: "MSC SRMAP",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 800,
        height: 600,
        alt: "MSC SRMAP Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Microsoft Student Community - SRM University AP",
    description: "The definitive student engineering collective at SRMAP.",
    images: [
      "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
    ],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
