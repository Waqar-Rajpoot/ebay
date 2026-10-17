// import type { Metadata } from "next";
// import Link from "next/link";
// import AccessCodesForm from "@/components/access/AccessCodesForm";
// import RoleGate from "@/components/access/RoleGate";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// export const metadata: Metadata = { title: "Access codes" };

// export default function AccessCodesPage() {
//   return (
//     <RoleGate requiredRole="admin">
//       <main className="mx-auto max-w-lg space-y-4 p-6">
//         <Link href="/admin" className="text-sm text-muted-foreground hover:underline">
//           ← Back to admin
//         </Link>
//         <Card>
//           <CardHeader>
//             <CardTitle>Access codes</CardTitle>
//             <CardDescription>
//               Change the shared codes. Anyone signed in with a changed code is signed out.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <AccessCodesForm />
//           </CardContent>
//         </Card>
//       </main>
//     </RoleGate>
//   );
// }






import type { Metadata } from "next";
import AccessCodesForm from "@/components/access/AccessCodesForm";
import RoleGate from "@/components/access/RoleGate";
import PageHeader from "@/components/shared/PageHeader";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Access codes" };

// Needs the tw-animate-css classes that shadcn/ui installs; harmless if they're missing.
const FADE_IN_CLASS =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-backwards";

/** Admin-only screen for changing the shared admin and team access codes. */
export default function AccessCodesPage() {
  return (
    <RoleGate requiredRole="admin">
      <div className="min-h-screen bg-[#eef1ff] text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
        <main className="mx-auto max-w-xl space-y-6 px-6 py-10">
          <div className={FADE_IN_CLASS}>
            <PageHeader
              title="Access codes"
              description="Change the shared codes. Anyone signed in with a changed code is signed out."
              backHref={ROUTES.admin}
              backLabel="Admin"
            />
          </div>

          <div className={FADE_IN_CLASS} style={{ animationDelay: "120ms" }}>
            <AccessCodesForm />
          </div>
        </main>
      </div>
    </RoleGate>
  );
}