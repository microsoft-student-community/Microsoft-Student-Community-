import { Metadata } from "next";

export const metadata: Metadata = {
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
