import { Metadata } from "next";
import { allTeamMembers } from "./teamData";

const teamNames = allTeamMembers.map((member) => member.name);
const teamRoles = [...new Set(allTeamMembers.map((member) => member.role))];
const teamDescription =
  "Meet the Microsoft Student Community at SRM University AP team: " +
  `${teamNames.join(", ").replace(/, ([^,]*)$/, " and $1")}. ` +
  "View the team roster, roles, and public professional links.";

export const metadata: Metadata = {
  title: "Team & Leadership — Microsoft Student Community SRMAP",
  description: teamDescription,
  keywords: [
    "MSC SRMAP team",
    "Microsoft Student Community team",
    "student community leaders",
    ...teamNames,
    ...teamRoles,
  ],
  alternates: { canonical: "/team" },
  openGraph: {
    url: "/team",
    title: "Team & Leadership — Microsoft Student Community · SRM University AP",
    description: teamDescription,
    images: [
      {
        url: "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
        width: 1200,
        height: 630,
        alt: "MSC SRMAP team and leadership",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team & Leadership — Microsoft Student Community · SRM University AP",
    description: teamDescription,
    images: [
      "https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png",
    ],
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
