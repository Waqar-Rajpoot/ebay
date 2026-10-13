import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface ProductFormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

/** Label + control + validation message, so every field renders consistently. */
export default function ProductFormField({ id, label, error, children }: ProductFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}