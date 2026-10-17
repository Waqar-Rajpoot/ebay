import type { ReactNode } from "react";
import { getCurrentRole } from "@/lib/access/accessSession";
import { roleSatisfies, type AccessRole } from "@/lib/access/accessRoles";
import AccessCodeForm from "./AccessCodeForm";

/** Shows its children only to visitors holding the required role; others see the access code form. */
export default async function RoleGate({ requiredRole, children }: { requiredRole: AccessRole; children: ReactNode }) {
  const role = await getCurrentRole();
  if (!roleSatisfies(role, requiredRole)) return <AccessCodeForm role={requiredRole} />;
  return <>{children}</>;
}