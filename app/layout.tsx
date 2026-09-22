import "./globals.css";
import { Metadata } from "next";
import { Iceland, Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import ShapeGrid from "@/components/ShapeGrid";

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

const iceland = Iceland({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-iceland",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-narrative",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mscsrmap.xyz"),
  title: {
    default: "Microsoft Student Community — SRM University AP",
    template: "%s | MSC SRMAP",
  },
  description:
    "Microsoft Student Community at SRM University-AP is a premier student-led engineering collective dedicated to Cloud, AI, Hackathons, and Open Source development.",
  keywords: [
    "Microsoft Student Community",
    "MSC SRMAP",
    "MSC",
    "SRM University AP",
    "SRMAP",
    "SRM Amaravati",
    "Tech Community",
    "Student Developer Club",
    "Hackathons",
    "Synora",
    "Azure",
    "Cloud Computing",
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
    "Microsoft Learn Student Ambassadors",
  ],
  authors: [{ name: "Microsoft Student Community SRMAP", url: "https://mscsrmap.xyz" }],
  creator: "Microsoft Student Community SRMAP",
  publisher: "Microsoft Student Community SRMAP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Microsoft Student Community — SRM University AP",
    description:
      "Bridge the gap between classroom theory and production-grade code. Join the most active engineering collective at SRM University AP.",
    url: "https://mscsrmap.xyz",
    siteName: "Microsoft Student Community · SRM AP",
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "Microsoft Student Community - SRM University AP",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Microsoft Student Community — SRM University AP",
    description: "The definitive student engineering collective at SRM University-AP. Hackathons, workshops, and production-grade code.",
    site: "@mscsrmap",
    creator: "@mscsrmap",
    images: [
      "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
    ],
  },
  verification: {
    google: "SpjmQzFTFMgeRlZr-kOaB9aG-dh-VEPDX4fSdulrdJY",
  },
  alternates: { canonical: "/" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": "https://mscsrmap.xyz/#organization",
      name: "Microsoft Student Community - SRM University AP",
      alternateName: ["MSC SRMAP", "Microsoft Student Community SRMAP"],
      url: "https://mscsrmap.xyz",
      logo: {
        "@type": "ImageObject",
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        caption: "Microsoft Student Community Logo",
      },
      sameAs: [
        "https://github.com/mscsrmap",
        "https://linkedin.com/company/mscsrmap",
        "https://instagram.com/mscsrmap",
      ],
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "SRM University, AP",
        url: "https://srmap.edu.in",
      },
      description:
        "The official Microsoft Student Community at SRM University AP fostering hands-on technical skills, Azure cloud computing, AI, and developer hackathons.",
    },
    {
      "@type": "WebSite",
      "@id": "https://mscsrmap.xyz/#website",
      url: "https://mscsrmap.xyz",
      name: "Microsoft Student Community - SRM AP",
      description: "Bridge the gap between classroom theory and production-grade code.",
      publisher: {
        "@id": "https://mscsrmap.xyz/#organization",
      },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${iceland.variable} ${plusJakartaSans.variable}`}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ShapeGrid 
          interactiveRadius={240}
          spotlightOpacity={0.045}
        />
        {children}
      </body>
    </html>
  );
}

