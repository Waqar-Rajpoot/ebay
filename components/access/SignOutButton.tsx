"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/constants";
import { getErrorMessage, jsonInit, requestJson } from "@/lib/http/apiClient";

/** Flat outline style. Hover turns red so the sign-out action stays distinct from the indigo theme. */
const SIGN_OUT_BUTTON_CLASS =
  "group h-9 rounded-xl border border-[#d5daf7] bg-white px-4 text-sm font-semibold text-[#1e1b4b] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c62828] hover:bg-[#fde8e8] hover:text-[#c62828] focus-visible:ring-2 focus-visible:ring-[#c62828]/40 disabled:opacity-60 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#eef0ff] dark:hover:border-[#ff8a80] dark:hover:bg-[#4a2230] dark:hover:text-[#ff8a80] dark:focus-visible:ring-[#ff8a80]/40";

/** Clears the access cookie and refreshes the page so the access form shows again. */
export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await requestJson(API_ROUTES.access, jsonInit("DELETE"));
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={SIGN_OUT_BUTTON_CLASS}
    >
      {isSigningOut ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}