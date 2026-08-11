import { createPublicClient } from "@/utils/supabase/public";
import TeamClientWrapper from "./TeamClientWrapper";
import "./team-premium.css";

export const revalidate = 60;

export default async function TeamPage() {
  try {
    const supabase = createPublicClient();
    const { data: members, error } = await supabase
      .from("team_members")
      .select("*");

    if (error) throw error;

    const safeMembers = members || [];

    let chiefBoard = safeMembers.filter(
      (m) => m.tier === "chief" || m.tier === "president",
    );
    let boardMembers = safeMembers.filter(
      (m) => m.tier === "board" || m.tier === "lead",
    );
    let teamMembers = safeMembers.filter(
      (m) => m.tier === "member" || !m.tier,
    );

    // If database is empty, restore the original static public content
    if (safeMembers.length === 0) {
      chiefBoard = [
        { name: "Jayanth Ramakrishnan", role: "President", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", twitter_url: "https://x.com/", instagram_url: "https://instagram.com/", email: "jayanth@srmap.edu.in", portfolio_url: "", image_url: "" },
        { name: "Vice President Name", role: "Vice President", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", twitter_url: "https://x.com/", instagram_url: "https://instagram.com/", email: "vp@srmap.edu.in", portfolio_url: "", image_url: "" },
        { name: "Managing Director Name", role: "Managing Director", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", twitter_url: "", instagram_url: "https://instagram.com/", email: "md@srmap.edu.in", portfolio_url: "", image_url: "" }
      ];

      boardMembers = [
        { name: "Technical Lead Name", role: "Technical Lead", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", twitter_url: "https://x.com/", instagram_url: "", email: "tech@srmap.edu.in", portfolio_url: "https://github.com/", image_url: "" },
        { name: "Design Lead Name", role: "Design & UI/UX Lead", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", twitter_url: "", instagram_url: "https://instagram.com/", email: "design@srmap.edu.in", portfolio_url: "", image_url: "" },
        { name: "Operations Lead Name", role: "Operations Lead", linkedin_url: "https://linkedin.com/in/", github_url: "", twitter_url: "", instagram_url: "https://instagram.com/", email: "ops@srmap.edu.in", portfolio_url: "", image_url: "" },
        { name: "Events Lead Name", role: "Events Lead", linkedin_url: "https://linkedin.com/in/", github_url: "", twitter_url: "https://x.com/", instagram_url: "https://instagram.com/", email: "events@srmap.edu.in", portfolio_url: "", image_url: "" },
        { name: "PR & Marketing Lead", role: "PR & Media Lead", linkedin_url: "https://linkedin.com/in/", github_url: "", twitter_url: "", instagram_url: "https://instagram.com/", email: "pr@srmap.edu.in", portfolio_url: "", image_url: "" }
      ];

      teamMembers = [
        { name: "Frontend Developer", role: "Core Web Developer", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", email: "", portfolio_url: "", image_url: "" },
        { name: "Backend Specialist", role: "Core Cloud / DevOps", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", email: "", portfolio_url: "", image_url: "" },
        { name: "AI & ML Researcher", role: "Core AI Member", linkedin_url: "https://linkedin.com/in/", github_url: "https://github.com/", email: "", portfolio_url: "", image_url: "" },
        { name: "Creative Strategist", role: "Core Design Member", linkedin_url: "https://linkedin.com/in/", github_url: "", email: "", portfolio_url: "", image_url: "" },
        { name: "Event Coordinator", role: "Core Logistics Member", linkedin_url: "https://linkedin.com/in/", github_url: "", email: "", portfolio_url: "", image_url: "" },
        { name: "Community Outreach", role: "Core PR Member", linkedin_url: "https://linkedin.com/in/", github_url: "", email: "", portfolio_url: "", image_url: "" }
      ];
    }

    return (
      <TeamClientWrapper
        chiefBoard={chiefBoard}
        boardMembers={boardMembers}
        teamMembers={teamMembers}
      />
    );
  } catch (error) {
    console.error("Error fetching team members:", error);
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0f14",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            Failed to load team
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            We couldn&apos;t retrieve the team data right now. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
