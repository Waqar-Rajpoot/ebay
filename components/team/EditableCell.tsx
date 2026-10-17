"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { rowApiRoute } from "@/lib/constants";
import { ApiClientError, getErrorMessage, jsonInit, requestJson } from "@/lib/http/apiClient";
import { toAddedCellValue, toInputText } from "@/lib/orders/cellValues";
import type { ColumnDefinition, OrderRowDto } from "@/lib/orders/orderTypes";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/** Flat input styles per save state. Full class names so Tailwind can detect them. */
const INPUT_BASE_CLASS =
  "h-9 w-32 rounded-lg border-[#d5daf7] bg-white px-3 text-sm tabular-nums transition-all duration-200 placeholder:text-[#5b5f8a]/60 hover:border-[#0d9488] focus-visible:border-[#0d9488] focus-visible:ring-2 focus-visible:ring-[#0d9488]/30 disabled:cursor-not-allowed disabled:bg-[#f4f6ff] disabled:opacity-60 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:placeholder:text-[#a3a8d6]/60 dark:hover:border-[#2dd4bf] dark:focus-visible:border-[#2dd4bf] dark:focus-visible:ring-[#2dd4bf]/30 dark:disabled:bg-[#252a60]";

const INPUT_STATUS_CLASS: Record<SaveStatus, string> = {
  idle: "",
  saving: "border-[#f5d58a] bg-[#fff8e1] dark:border-[#6b5420] dark:bg-[#3a3015]",
  saved: "border-[#0d9488] dark:border-[#2dd4bf]",
  error: "border-[#c62828] bg-[#fde8e8] dark:border-[#ff8a80] dark:bg-[#4a2230]",
};

interface EditableCellProps {
  row: OrderRowDto;
  column: ColumnDefinition;
  editorName: string;
  onRowChange: (row: OrderRowDto) => void;
}

/** One input box. It saves when you leave the box and shows saving, saved and failed states. */
export default function EditableCell({ row, column, editorName, onRowChange }: EditableCellProps) {
  const storedValue = row.addedValues[column.key] ?? null;
  const [draft, setDraft] = useState(() => toInputText(column, storedValue));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const isEditorNameMissing = editorName.trim() === "";

  async function commit() {
    if (status === "saving") return;
    if (draft === toInputText(column, storedValue)) return;

    setStatus("saving");
    try {
      const updated = await requestJson<OrderRowDto>(
        rowApiRoute(row.id),
        jsonInit("PATCH", {
          columnKey: column.key,
          value: draft.trim() === "" ? null : draft,
          expectedValue: storedValue,
          editorName: editorName.trim(),
        }),
      );
      onRowChange(updated);
      setDraft(toInputText(column, updated.addedValues[column.key] ?? null));
      setStatus("saved");
    } catch (error) {
      const message = getErrorMessage(error);
      setStatus("error");
      setErrorMessage(message);
      toast.error(message);

      if (error instanceof ApiClientError && error.status === 409) {
        // Someone else changed this cell: show their value instead of ours.
        const currentValue = toAddedCellValue(error.details?.currentValue);
        onRowChange({ ...row, addedValues: { ...row.addedValues, [column.key]: currentValue } });
        setDraft(toInputText(column, currentValue));
      }
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Pop-in animation for the status icon, disabled for reduced motion. */}
      <style>{`
        @keyframes editable-cell-pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .editable-cell-pop { animation: editable-cell-pop 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .editable-cell-pop { animation: none; }
        }
      `}</style>

      <Input
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setStatus("idle");
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setDraft(toInputText(column, storedValue));
            event.currentTarget.blur();
          }
        }}
        disabled={isEditorNameMissing}
        inputMode={column.type === "text" ? "text" : "decimal"}
        aria-label={`${column.label}, row ${row.rowNumber}`}
        aria-invalid={status === "error" ? true : undefined}
        title={isEditorNameMissing ? "Enter your name above to start editing" : undefined}
        className={`${INPUT_BASE_CLASS} ${INPUT_STATUS_CLASS[status]}`}
      />
      <span className="flex size-5 items-center justify-center" aria-live="polite">
        {status === "saving" ? (
          <Loader2
            className="editable-cell-pop size-4 animate-spin text-[#7a5200] dark:text-[#f5d58a]"
            aria-label="Saving"
          />
        ) : null}
        {status === "saved" ? (
          <CheckCircle2
            className="editable-cell-pop size-4 text-[#0d9488] dark:text-[#2dd4bf]"
            aria-label="Saved"
          />
        ) : null}
        {status === "error" ? (
          <AlertCircle
            className="editable-cell-pop size-4 text-[#c62828] dark:text-[#ff8a80]"
            aria-label={errorMessage}
          />
        ) : null}
      </span>
    </div>
  );
}