import { Metadata } from "next";

export const metadata: Metadata = {
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
