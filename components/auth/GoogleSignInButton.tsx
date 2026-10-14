"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/authClient";

interface GoogleSignInButtonProps {
  /** Already sanitized, same-site path to open after sign-in. */
  callbackUrl: string;
}

export function GoogleSignInButton({ callbackUrl }: GoogleSignInButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setIsRedirecting(true);
    setErrorMessage(null);

    // On success the browser is redirected to Google, so there is nothing to do afterwards.
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (error) {
      setErrorMessage(error.message ?? "Unable to start Google sign-in.");
      setIsRedirecting(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleGoogleSignIn} disabled={isRedirecting}>
        {isRedirecting ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </div>
  );
}