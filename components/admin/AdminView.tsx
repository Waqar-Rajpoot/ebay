import { requireRole } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/roles";
import { listUsersForAdmin } from "@/lib/admin/listUsersForAdmin";
import { UserRoleTable } from "./UserRoleTable";

export async function AdminView() {
  const { user } = await requireRole([USER_ROLES.ADMIN]);
  const users = await listUsersForAdmin();

  return <UserRoleTable users={users} currentUserId={user.id} />;
}