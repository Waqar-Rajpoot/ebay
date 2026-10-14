// import { redirect } from "next/navigation";
// import { getSession } from "@/lib/auth/session";
// import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/lib/auth/routes";
// import { AuthCard } from "./AuthCard";
// import { GoogleSignInButton } from "./GoogleSignInButton";

// export interface SignInViewProps {
//   searchParams: Promise<Record<string, string | string[] | undefined>>;
// }

// export async function SignInView({ searchParams }: SignInViewProps) {
//   const resolvedParams = await searchParams;
//   const rawCallbackUrl = resolvedParams[CALLBACK_URL_PARAM];
//   const callbackUrl = sanitizeCallbackUrl(
//     typeof rawCallbackUrl === "string" ? rawCallbackUrl : undefined,
//   );

//   // Already signed in: skip the sign-in screen.
//   if (await getSession()) redirect(callbackUrl);

//   return (
//     <AuthCard title="Sign in">
//       <GoogleSignInButton callbackUrl={callbackUrl} />
//     </AuthCard>
//   );
// }






import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/lib/auth/routes";
import { SIGN_IN_COPY } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";
import { BrandPanel } from "./BrandPanel";
import { GoogleSignInButton } from "./GoogleSignInButton";
import styles from "./SignInView.module.css";

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
    <main className={styles.layout}>
      <BrandPanel />

      <section className={styles.formPanel}>
        <div className={styles.mobileBrand}>
          <BrandLogo tone="dark" />
        </div>

        <div className={styles.card}>
          <header>
            <h1 className={styles.heading}>{SIGN_IN_COPY.HEADING}</h1>
            <p className={styles.subheading}>{SIGN_IN_COPY.SUBHEADING}</p>
          </header>

          <GoogleSignInButton callbackUrl={callbackUrl} />

          <p className={styles.legal}>{SIGN_IN_COPY.LEGAL}</p>
        </div>
      </section>
    </main>
  );
}