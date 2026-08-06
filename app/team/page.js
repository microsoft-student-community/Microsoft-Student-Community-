import { createPublicClient } from "@/utils/supabase/public";
import TeamClientWrapper from "./TeamClientWrapper";
import "./team-premium.css";

export const revalidate = 60;

export default async function TeamPage() {
  const supabase = createPublicClient();

  try {
    const { data: members, error } = await supabase
      .from("team_members")
      .select("*");

    if (error) throw error;

    const safeMembers = members || [];

    // Separate by tier field from Supabase
    const chiefBoard = safeMembers.filter(
      (m) => m.tier === "chief" || m.tier === "president",
    );
    const boardMembers = safeMembers.filter(
      (m) => m.tier === "board" || m.tier === "lead",
    );
    const teamMembers = safeMembers.filter(
      (m) => m.tier === "member" || !m.tier,
    );

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
