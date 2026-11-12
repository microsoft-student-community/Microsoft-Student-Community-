import TeamClientWrapper from "./TeamClientWrapper";
import { allTeamMembers, chiefBoard, boardMembers, teamMembers } from "./teamData";
import "./team-premium.css";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://mscsrmap.xyz"
).replace(/\/+$/, "");
const TEAM_URL = `${SITE_URL}/team`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${TEAM_URL}#webpage`,
      url: TEAM_URL,
      name: "MSC SRMAP Team & Leadership",
      description:
        "The official directory of Microsoft Student Community leaders and team members at SRM University AP.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      mainEntity: { "@id": `${TEAM_URL}#team-members` },
    },
    {
      "@type": "ItemList",
      "@id": `${TEAM_URL}#team-members`,
      name: "Microsoft Student Community SRMAP team members",
      numberOfItems: allTeamMembers.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: allTeamMembers.map((member, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: member.name,
        url: `${TEAM_URL}#${member.slug}`,
        item: {
          "@type": "Person",
          name: member.name,
          jobTitle: member.role,
          url: `${TEAM_URL}#${member.slug}`,
          image: member.image_url || undefined,
          worksFor: { "@id": `${SITE_URL}/#organization` },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Team",
          item: TEAM_URL,
        },
      ],
    },
  ],
};

export default function TeamPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <TeamClientWrapper
        chiefBoard={chiefBoard}
        boardMembers={boardMembers}
        teamMembers={teamMembers}
      />
    </>
  );
}
