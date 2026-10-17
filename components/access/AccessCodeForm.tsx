"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccessRole } from "@/lib/access/accessRoles";
import { API_ROUTES } from "@/lib/constants";
import { ApiClientError, getErrorMessage, jsonInit, requestJson } from "@/lib/http/apiClient";
import { accessRequestSchema } from "@/lib/validation/schemas";

const formSchema = accessRequestSchema.pick({ code: true });
type FormValues = z.infer<typeof formSchema>;

const ROLE_LABELS: Record<AccessRole, string> = { admin: "Admin", team: "Team" };

/** Flat accent colors per role. Full class names so Tailwind can detect them. */
const ROLE_THEMES: Record<AccessRole, { bar: string; iconBox: string; input: string; button: string; badge: string }> = {
  admin: {
    bar: "bg-[#4f46e5] dark:bg-[#818cf8]",
    iconBox: "bg-[#e0e3ff] text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]",
    input: "focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 dark:focus-visible:border-[#818cf8] dark:focus-visible:ring-[#818cf8]/30",
    button: "bg-[#4f46e5] text-white hover:bg-[#4338ca] dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc]",
    badge: "text-[#4f46e5] dark:text-[#818cf8]",
  },
  team: {
    bar: "bg-[#0d9488] dark:bg-[#2dd4bf]",
    iconBox: "bg-[#d5f3ef] text-[#0d9488] dark:bg-[#1b4552] dark:text-[#2dd4bf]",
    input: "focus-visible:border-[#0d9488] focus-visible:ring-[#0d9488]/30 dark:focus-visible:border-[#2dd4bf] dark:focus-visible:ring-[#2dd4bf]/30",
    button: "bg-[#0d9488] text-white hover:bg-[#0f766e] dark:bg-[#2dd4bf] dark:text-[#14173a] dark:hover:bg-[#5eead4]",
    badge: "text-[#0d9488] dark:text-[#2dd4bf]",
  },
};

/** Asks for the shared access code of one area (admin or team). */
export default function AccessCodeForm({ role }: { role: AccessRole }) {
  const router = useRouter();
  const theme = ROLE_THEMES[role];
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { code: "" } });

  async function onSubmit(values: FormValues) {
    try {
      await requestJson(API_ROUTES.access, jsonInit("POST", { role, code: values.code }));
      toast.success("Access granted.");
      router.refresh();
    } catch (error) {
      const message = getErrorMessage(error);
      if (error instanceof ApiClientError && error.status === 401) setError("code", { message });
      toast.error(message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1ff] px-6 py-12 text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Entrance animation, scoped by class name and disabled for reduced motion. */}
      <style>{`
        @keyframes access-form-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .access-form-rise { animation: access-form-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .access-form-rise { animation: none; }
        }
      `}</style>

      <section className="access-form-rise group relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d5daf7] bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-[#333a7a] dark:bg-[#1e2250]">
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${theme.bar}`} />

        <header className="mb-8 space-y-4 text-center">
          <div
            className={`mx-auto flex size-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${theme.iconBox}`}
          >
            <KeyRound className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${theme.badge}`}>
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Protected area
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{ROLE_LABELS[role]} access</h1>
            <p className="text-sm text-[#5b5f8a] dark:text-[#a3a8d6]">
              Enter the {ROLE_LABELS[role].toLowerCase()} access code to continue.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="access-code" className="text-sm font-medium">
              Access code
            </Label>
            <Input
              id="access-code"
              type="password"
              autoComplete="off"
              placeholder="••••••••"
              aria-invalid={errors.code ? true : undefined}
              className={`h-12 rounded-xl border-[#d5daf7] bg-[#f4f6ff] px-4 text-base tracking-widest transition-colors placeholder:text-[#5b5f8a]/60 dark:border-[#333a7a] dark:bg-[#252a60] dark:placeholder:text-[#a3a8d6]/60 ${theme.input}`}
              {...register("code")}
            />
            {errors.code ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {errors.code.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`group/button h-12 w-full rounded-xl text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${theme.button}`}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isSubmitting ? "Checking..." : "Continue"}
            {isSubmitting ? null : (
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/button:translate-x-1"
                aria-hidden="true"
              />
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}