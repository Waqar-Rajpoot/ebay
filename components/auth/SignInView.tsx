import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/lib/auth/routes";
import { AuthCard } from "./AuthCard";
import { GoogleSignInButton } from "./GoogleSignInButton";

export interface SignInViewProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function SignInView({ searchParams }: SignInViewProps) {
  const resolvedParams = await searchParams;
  const rawCallbackUrl = resolvedParams[CALLBACK_URL_PARAM];
  const callbackUrl = sanitizeCallbackUrl(
    typeof rawCallbackUrl === "string" ? rawCallbackUrl : undefined,
  );

  // Already signed in: skip the sign-in screen.
  if (await getSession()) redirect(callbackUrl);

  return (
    <AuthCard title="Sign in">
      <GoogleSignInButton callbackUrl={callbackUrl} />
    </AuthCard>
  );
}