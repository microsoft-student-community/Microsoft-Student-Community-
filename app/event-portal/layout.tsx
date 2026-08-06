import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Portal — Microsoft Student Community · SRM University AP",
  description:
    "Register for events, check your team details, download e-certificates and more at the MSC SRMAP Event Portal.",
};

export default function EventPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
