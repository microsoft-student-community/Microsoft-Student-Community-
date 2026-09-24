import { Metadata } from "next";
import "./portal.css";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  title: "Event Portal — Microsoft Student Community · SRM University AP",
  description:
    "Explore event details, schedules, speakers, registration information, and tickets from Microsoft Student Community at SRM University AP.",
};

export default function EventPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
