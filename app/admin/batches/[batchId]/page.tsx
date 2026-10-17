import type { Metadata } from "next";
import RoleGate from "@/components/access/RoleGate";
import AdminBatchDetail from "@/components/admin/AdminBatchDetail";

export const metadata: Metadata = { title: "Sheet" };

export default async function AdminBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <RoleGate requiredRole="admin">
      <AdminBatchDetail batchId={batchId} />
    </RoleGate>
  );
}