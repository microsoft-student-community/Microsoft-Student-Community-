import "./globals.css";
import AppChrome from "@/components/AppChrome";
import { Metadata } from "next";

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Inter:wght@300,400,500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                document.documentElement.classList.remove('skip-loader');
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
