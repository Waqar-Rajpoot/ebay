import type { Metadata } from "next";
import RoleGate from "@/components/access/RoleGate";
import TeamBatchGrid from "@/components/team/TeamBatchGrid";

export const metadata: Metadata = { title: "Orders" };

export default async function TeamBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <RoleGate requiredRole="team">
      <TeamBatchGrid batchId={batchId} />
    </RoleGate>
  );
}