"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/authClient";
import { APP_ROUTES } from "@/lib/auth/routes";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(APP_ROUTES.SIGN_IN);
          router.refresh();
        },
      },
    });
  }

  return (
    <button type="button" onClick={handleSignOut}>
      Sign out
    </button>
  );
}