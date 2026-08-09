import { Metadata } from "next";

export const metadata: Metadata = {
 alternates: { canonical: "/events" },
 openGraph: { url: "/events", title: "Events — MSC SRMAP", description: "Browse upcoming and past MSC SRMAP events." },
 twitter: { card: "summary_large_image", title: "Events — MSC SRMAP", description: "Browse upcoming and past MSC SRMAP events." },
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
