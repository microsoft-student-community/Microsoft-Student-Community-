import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About — MSC SRMAP", description: "Learn about the mission and people behind MSC SRMAP." },
  twitter: { card: "summary_large_image", title: "About — MSC SRMAP", description: "Learn about the mission and people behind MSC SRMAP." },
  title: "About — Microsoft Student Community · SRM University AP",
  description:
    "Learn about the Microsoft Student Community at SRM University AP — our origin, mission, and the people driving real engineering projects.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
