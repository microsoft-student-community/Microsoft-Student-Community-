import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/team" },
  openGraph: { url: "/team", title: "The People — MSC SRMAP", description: "Meet the people behind MSC SRMAP." },
  twitter: { card: "summary_large_image", title: "The People — MSC SRMAP", description: "Meet the people behind MSC SRMAP." },
  title: "The People — Microsoft Student Community · SRM University AP",
  description:
    "The people behind Microsoft Student Community at SRM University AP — core team, leads, and members.",
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
