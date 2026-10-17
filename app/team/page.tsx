import type { Metadata } from "next";
import RoleGate from "@/components/access/RoleGate";
import TeamBatchList from "@/components/team/TeamBatchList";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <RoleGate requiredRole="team">
      <TeamBatchList />
    </RoleGate>
  );
}