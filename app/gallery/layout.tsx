import { Metadata } from "next";

export const metadata: Metadata = {
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
