import "./globals.css";
import { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="dns-prefetch"
          href="https://lkbwunzswqbnoygxtilm.supabase.co"
        />
        <link
          rel="preconnect"
          href="https://lkbwunzswqbnoygxtilm.supabase.co"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
