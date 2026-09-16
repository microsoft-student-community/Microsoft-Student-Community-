import TeamClientWrapper from "./TeamClientWrapper";
import { chiefBoard, boardMembers, teamMembers } from "./teamData";
import "./team-premium.css";

export default function TeamPage() {
  return (
    <TeamClientWrapper
      chiefBoard={chiefBoard}
      boardMembers={boardMembers}
      teamMembers={teamMembers}
    />
  );
}
