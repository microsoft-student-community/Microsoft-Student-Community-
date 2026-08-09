import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/gallery" },
  openGraph: { url: "/gallery", title: "Gallery — MSC SRMAP", description: "A visual archive of MSC SRMAP events and community moments." },
  twitter: { card: "summary_large_image", title: "Gallery — MSC SRMAP", description: "A visual archive of MSC SRMAP events and community moments." },
  title: "Gallery — Microsoft Student Community · SRM University AP",
  description:
    "A visual archive of MSC SRMAP events — hackathons, workshops, tech fests, and community moments.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
