import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events — Microsoft Student Community · SRM University AP",
  description:
    "Browse past and upcoming events from MSC SRMAP — hackathons, workshops, bootcamps, and tech festivals.",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
