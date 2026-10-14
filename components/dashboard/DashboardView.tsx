import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { USER_ROLES, hasAnyRole } from "@/lib/auth/roles";
import { APP_ROUTES } from "@/lib/auth/routes";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignOutButton } from "@/components/auth/SignOutButton";

export async function DashboardView() {
  const { user } = await requireSession();
  const isAdmin = hasAnyRole(user.role, [USER_ROLES.ADMIN]);

  return (
    <AuthCard title={`Welcome, ${user.name}`}>
      <p>{user.email}</p>
      <p>Role: {user.role ?? USER_ROLES.USER}</p>
      {isAdmin && <Link href={APP_ROUTES.ADMIN}>Open admin panel</Link>}
      <SignOutButton />
    </AuthCard>
  );
}