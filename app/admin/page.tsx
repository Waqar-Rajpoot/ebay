import type { Metadata } from "next";
import RoleGate from "@/components/access/RoleGate";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <RoleGate requiredRole="admin">
      <AdminDashboard />
    </RoleGate>
  );
}