"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/authClient";
import { USER_ROLES, isUserRole } from "@/lib/auth/roles";
import type { AdminUserSummary } from "@/lib/admin/adminUserSummary";
import styles from "./UserRoleTable.module.css";

interface UserRoleTableProps {
  users: AdminUserSummary[];
  currentUserId: string;
}

export function UserRoleTable({ users, currentUserId }: UserRoleTableProps) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRoleChange(userId: string, nextRole: string) {
    if (!isUserRole(nextRole)) return;

    setPendingUserId(userId);
    setErrorMessage(null);

    const { error } = await authClient.admin.setRole({ userId, role: nextRole });

    if (error) {
      setErrorMessage(error.message ?? "Could not update the role.");
    } else {
      router.refresh();
    }
    setPendingUserId(null);
  }

  return (
    <main className={styles.container}>
      <h1>Users</h1>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {/* Admins can't change their own role, so nobody can lock themselves out. */}
                <select
                  value={user.role}
                  disabled={user.id === currentUserId || pendingUserId === user.id}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                >
                  {Object.values(USER_ROLES).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}