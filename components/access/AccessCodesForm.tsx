// "use client";

// import { Loader2 } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { changeAccessCodesSchema, MIN_ACCESS_CODE_LENGTH } from "@/lib/validation/accessCodeSchemas";

// interface AccessCodesFormValues {
//   currentAdminCode: string;
//   newAdminCode: string;
//   newTeamCode: string;
// }

// const FORM_FIELDS = ["currentAdminCode", "newAdminCode", "newTeamCode"] as const;

// function isFormField(value: unknown): value is keyof AccessCodesFormValues {
//   return FORM_FIELDS.some((field) => field === value);
// }

// const errorBodySchema = z.object({
//   error: z.object({
//     message: z.string(),
//     fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
//   }),
// });

// const FIELD_LABELS: Record<keyof AccessCodesFormValues, string> = {
//   currentAdminCode: "Current admin code",
//   newAdminCode: "New admin code (leave blank to keep)",
//   newTeamCode: "New team code (leave blank to keep)",
// };

// /** Lets the admin change the shared admin and team access codes. */
// export default function AccessCodesForm() {
//   const {
//     register,
//     handleSubmit,
//     setError,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<AccessCodesFormValues>({
//     defaultValues: { currentAdminCode: "", newAdminCode: "", newTeamCode: "" },
//   });

//   async function onSubmit(values: AccessCodesFormValues) {
//     const parsed = changeAccessCodesSchema.safeParse({
//       currentAdminCode: values.currentAdminCode,
//       newAdminCode: values.newAdminCode.trim() || undefined,
//       newTeamCode: values.newTeamCode.trim() || undefined,
//     });
//     if (!parsed.success) {
//       for (const issue of parsed.error.issues) {
//         const field = issue.path[0];
//         if (isFormField(field)) setError(field, { message: issue.message });
//       }
//       return;
//     }

//     try {
//       const response = await fetch("/api/access/codes", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(parsed.data),
//       });
//       if (!response.ok) {
//         const body = errorBodySchema.safeParse(await response.json().catch(() => null));
//         if (body.success) {
//           for (const [field, messages] of Object.entries(body.data.error.fieldErrors ?? {})) {
//             if (isFormField(field) && messages[0]) setError(field, { message: messages[0] });
//           }
//           toast.error(body.data.error.message);
//         } else {
//           toast.error("Could not save the codes. Please try again.");
//         }
//         return;
//       }
//       toast.success("Access codes updated. People using an old code must sign in again.");
//       reset();
//     } catch {
//       toast.error("Could not reach the server. Check your connection and try again.");
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
//       {FORM_FIELDS.map((field) => (
//         <div key={field} className="space-y-2">
//           <Label htmlFor={field}>{FIELD_LABELS[field]}</Label>
//           <Input
//             id={field}
//             type="password"
//             autoComplete="off"
//             aria-invalid={errors[field] ? true : undefined}
//             {...register(field)}
//           />
//           {errors[field]?.message ? (
//             <p className="text-sm text-destructive" role="alert">
//               {errors[field]?.message}
//             </p>
//           ) : null}
//         </div>
//       ))}
//       <p className="text-sm text-muted-foreground">
//         New codes need at least {MIN_ACCESS_CODE_LENGTH} characters. Letters and numbers together are much harder to guess than digits alone.
//       </p>
//       <Button type="submit" disabled={isSubmitting}>
//         {isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
//         Save codes
//       </Button>
//     </form>
//   );
// }







"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { changeAccessCodesSchema, MIN_ACCESS_CODE_LENGTH } from "@/lib/validation/accessCodeSchemas";
import styles from "./AccessCodesForm.module.css";

interface AccessCodesFormValues {
  currentAdminCode: string;
  newAdminCode: string;
  newTeamCode: string;
}

type FormField = keyof AccessCodesFormValues;

const FORM_FIELDS = ["currentAdminCode", "newAdminCode", "newTeamCode"] as const;
const NEW_CODE_FIELDS = ["newAdminCode", "newTeamCode"] as const;

function isFormField(value: unknown): value is FormField {
  return FORM_FIELDS.some((field) => field === value);
}

const errorBodySchema = z.object({
  error: z.object({
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

interface FieldConfig {
  label: string;
  hint?: string;
  icon: LucideIcon;
}

const FIELD_CONFIG: Record<FormField, FieldConfig> = {
  currentAdminCode: {
    label: "Current admin code",
    hint: "Required to confirm the change.",
    icon: ShieldCheck,
  },
  newAdminCode: {
    label: "New admin code",
    hint: "Leave blank to keep the current admin code.",
    icon: KeyRound,
  },
  newTeamCode: {
    label: "New team code",
    hint: "Leave blank to keep the current team code.",
    icon: Users,
  },
};

const INITIAL_VISIBILITY: Record<FormField, boolean> = {
  currentAdminCode: false,
  newAdminCode: false,
  newTeamCode: false,
};

/** Lets the admin change the shared admin and team access codes. */
export default function AccessCodesForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccessCodesFormValues>({
    defaultValues: { currentAdminCode: "", newAdminCode: "", newTeamCode: "" },
  });

  const [visibleFields, setVisibleFields] = useState(INITIAL_VISIBILITY);

  function toggleVisibility(field: FormField) {
    setVisibleFields((previous) => ({ ...previous, [field]: !previous[field] }));
  }

  async function onSubmit(values: AccessCodesFormValues) {
    const parsed = changeAccessCodesSchema.safeParse({
      currentAdminCode: values.currentAdminCode,
      newAdminCode: values.newAdminCode.trim() || undefined,
      newTeamCode: values.newTeamCode.trim() || undefined,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (isFormField(field)) setError(field, { message: issue.message });
      }
      return;
    }

    try {
      const response = await fetch("/api/access/codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const body = errorBodySchema.safeParse(await response.json().catch(() => null));
        if (body.success) {
          for (const [field, messages] of Object.entries(body.data.error.fieldErrors ?? {})) {
            if (isFormField(field) && messages[0]) setError(field, { message: messages[0] });
          }
          toast.error(body.data.error.message);
        } else {
          toast.error("Could not save the codes. Please try again.");
        }
        return;
      }
      toast.success("Access codes updated. People using an old code must sign in again.");
      reset();
      setVisibleFields(INITIAL_VISIBILITY);
    } catch {
      toast.error("Could not reach the server. Check your connection and try again.");
    }
  }

  function renderField(field: FormField) {
    const { label, hint, icon: Icon } = FIELD_CONFIG[field];
    const errorMessage = errors[field]?.message;
    const isVisible = visibleFields[field];
    const messageId = errorMessage ? `${field}-error` : hint ? `${field}-hint` : undefined;

    return (
      <div key={field} className={styles.field}>
        <label htmlFor={field} className={styles.label}>
          {label}
        </label>

        <div className={styles.inputWrap}>
          <Icon className={styles.fieldIcon} aria-hidden="true" />
          <input
            id={field}
            type={isVisible ? "text" : "password"}
            autoComplete="off"
            className={styles.input}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={messageId}
            {...register(field)}
          />
          <button
            type="button"
            className={styles.toggle}
            onClick={() => toggleVisibility(field)}
            aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
            aria-pressed={isVisible}
          >
            {isVisible ? (
              <EyeOff className={styles.toggleIcon} aria-hidden="true" />
            ) : (
              <Eye className={styles.toggleIcon} aria-hidden="true" />
            )}
          </button>
        </div>

        {errorMessage ? (
          <p id={`${field}-error`} className={styles.error} role="alert">
            {errorMessage}
          </p>
        ) : hint ? (
          <p id={`${field}-hint`} className={styles.hint}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <section className={styles.section}>
        <header>
          <h2 className={styles.sectionTitle}>Confirm it&apos;s you</h2>
          <p className={styles.sectionText}>Enter your current admin code to make changes.</p>
        </header>
        {renderField("currentAdminCode")}
      </section>

      <section className={styles.section}>
        <header>
          <h2 className={styles.sectionTitle}>Set new codes</h2>
          <p className={styles.sectionText}>
            Change one or both. New codes need at least {MIN_ACCESS_CODE_LENGTH} characters.
          </p>
        </header>
        {NEW_CODE_FIELDS.map(renderField)}
      </section>

      <footer className={styles.footer}>
        <p className={styles.notice}>
          <Info className={styles.noticeIcon} aria-hidden="true" />
          <span>
            Anyone using an old code will need to sign in again. Letters and numbers together are
            much harder to guess than digits alone.
          </span>
        </p>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className={styles.spinner} aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : "Save codes"}
        </button>
      </footer>
    </form>
  );
}