import { Metadata } from "next";
import "./portal.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Event Portal — Microsoft Student Community · SRM University AP",
  description: "Register for events, check team details, retrieve tickets, and download e-certificates.",
};

export default function EventPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
