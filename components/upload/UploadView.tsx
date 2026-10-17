"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowRight, Check, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_ROUTES, adminBatchRoute } from "@/lib/constants";
import { getErrorMessage, requestJson } from "@/lib/http/apiClient";
import { formatSourceValue } from "@/lib/orders/formatters";
import { ROW_NUMBER_KEY, ROW_NUMBER_LABEL } from "@/lib/orders/orderConstants";
import type { ImportResult, SheetPreview } from "@/lib/orders/orderTypes";
import { importMetadataSchema } from "@/lib/validation/schemas";

const MAX_SKIPPED_REASONS_SHOWN = 10;

const STEP_LABELS = ["Choose file", "Check and import", "Review result"] as const;

/** Shared flat styles. Full class names so Tailwind can detect them. */
const CARD_CLASS =
  "upload-rise rounded-2xl border border-[#d5daf7] bg-white p-6 dark:border-[#333a7a] dark:bg-[#1e2250]";
const MUTED_TEXT_CLASS = "text-[#5b5f8a] dark:text-[#a3a8d6]";
const FIELD_CLASS =
  "h-11 rounded-xl border-[#d5daf7] bg-[#f4f6ff] transition-colors focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 dark:border-[#333a7a] dark:bg-[#252a60] dark:focus-visible:border-[#818cf8] dark:focus-visible:ring-[#818cf8]/30";
const PRIMARY_BUTTON_CLASS =
  "h-11 rounded-xl bg-[#4f46e5] px-5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg active:translate-y-0 disabled:opacity-50 dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc]";

function stripExtension(fileName: string): string {
  return fileName.replace(/\.xlsx$/i, "");
}

/** Numbered heading used at the top of each step card. */
function StepHeading({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e0e3ff] text-sm font-bold text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
        {number}
      </span>
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className={`text-sm ${MUTED_TEXT_CLASS}`}>{description}</p>
      </div>
    </div>
  );
}

/** Upload flow: choose a file, preview it, confirm the order ID column, and import. */
export default function UploadView() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<SheetPreview | null>(null);
  const [batchName, setBatchName] = useState("");
  const [keyColumn, setKeyColumn] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setPreview(null);
    setImportResult(null);
    setFormError(null);
  }

  async function handlePreview() {
    if (!file) {
      toast.error("Choose an .xlsx file first.");
      return;
    }
    setIsPreviewing(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await requestJson<SheetPreview>(API_ROUTES.batchPreview, { method: "POST", body: formData });
      setPreview(result);
      setKeyColumn(result.suggestedKeyColumn);
      setBatchName(stripExtension(file.name));
    } catch (error) {
      setPreview(null);
      toast.error(getErrorMessage(error));
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!file || !preview) return;
    const parsed = importMetadataSchema.safeParse({ batchName, keyColumn });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setFormError(null);
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batchName", parsed.data.batchName);
      formData.append("keyColumn", parsed.data.keyColumn);
      const result = await requestJson<ImportResult>(API_ROUTES.batches, { method: "POST", body: formData });
      toast.success(`Imported ${result.imported} rows.`);
      if (result.skippedCount === 0) {
        router.push(adminBatchRoute(result.batchId));
        router.refresh();
      } else {
        toast.warning(`${result.skippedCount} rows were skipped.`);
        setImportResult(result);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  }

  const keyColumnLabel = keyColumn === ROW_NUMBER_KEY ? ROW_NUMBER_LABEL : keyColumn || "Choose a column";
  const currentStep = importResult ? 3 : preview ? 2 : 1;

  return (
    <div className="space-y-6 text-[#1e1b4b] dark:text-[#eef0ff]">
      {/* Entrance and hover animations, disabled for reduced motion. */}
      <style>{`
        @keyframes upload-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .upload-rise { animation: upload-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .upload-rise { animation: none; }
        }
      `}</style>

      {/* Progress steps (visual only; derived from existing state) */}
      <ol className="upload-rise flex items-center gap-2 sm:gap-3" aria-label="Upload progress">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={isActive ? "step" : undefined}>
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                  isDone || isActive
                    ? "bg-[#4f46e5] text-white dark:bg-[#818cf8] dark:text-[#14173a]"
                    : "border border-[#d5daf7] text-[#5b5f8a] dark:border-[#333a7a] dark:text-[#a3a8d6]"
                }`}
              >
                {isDone ? <Check className="size-4" aria-hidden="true" /> : stepNumber}
              </span>
              <span className={`hidden text-sm font-medium sm:inline ${isActive ? "" : MUTED_TEXT_CLASS}`}>{label}</span>
              {stepNumber < STEP_LABELS.length ? (
                <span
                  aria-hidden="true"
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                    isDone ? "bg-[#4f46e5] dark:bg-[#818cf8]" : "bg-[#d5daf7] dark:bg-[#333a7a]"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Step 1 */}
      <section className={CARD_CLASS} style={{ animationDelay: "60ms" }}>
        <StepHeading
          number={1}
          title="Choose a file"
          description="The first row of the sheet must contain the column names."
        />
        <div className="flex flex-wrap items-stretch gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="sheet-file" className="text-sm font-medium">
              Excel file (.xlsx)
            </Label>
            <label
              htmlFor="sheet-file"
              className="group flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-[#d5daf7] bg-[#f4f6ff] px-4 py-4 transition-all duration-200 hover:border-[#4f46e5] hover:bg-[#e0e3ff] has-[:focus-visible]:border-[#4f46e5] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#4f46e5]/30 dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:has-[:focus-visible]:border-[#818cf8] dark:has-[:focus-visible]:ring-[#818cf8]/30"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#4f46e5] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105 dark:bg-[#1e2250] dark:text-[#818cf8]">
                <FileSpreadsheet className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 space-y-0.5">
                <span className="block truncate text-sm font-semibold">{file ? file.name : "Click to choose a file"}</span>
                <span className={`block text-xs ${MUTED_TEXT_CLASS}`}>
                  {file ? "Click to choose a different file" : "Only .xlsx files are accepted"}
                </span>
              </span>
              <Input id="sheet-file" type="file" accept=".xlsx" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>
          <Button onClick={handlePreview} disabled={!file || isPreviewing} className={`${PRIMARY_BUTTON_CLASS} self-end`}>
            {isPreviewing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            Preview
          </Button>
        </div>
      </section>

      {/* Step 2 */}
      {preview ? (
        <section className={`${CARD_CLASS} space-y-5`}>
          <StepHeading
            number={2}
            title="Check and import"
            description={`${preview.totalRows} rows and ${preview.headers.length} columns found in "${preview.sheetName}".`}
          />

          {preview.warnings.map((warning) => (
            <div
              key={warning}
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-[#f5d58a] bg-[#fff8e1] px-4 py-3 text-sm text-[#7a5200] dark:border-[#6b5420] dark:bg-[#3a3015] dark:text-[#f5d58a]"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{warning}</p>
            </div>
          ))}

          <div className="overflow-x-auto rounded-xl border border-[#d5daf7] dark:border-[#333a7a]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#d5daf7] bg-[#f4f6ff] hover:bg-[#f4f6ff] dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:bg-[#252a60]">
                  {preview.headers.map((header) => (
                    <TableHead
                      key={header}
                      className="text-xs font-semibold uppercase tracking-wide text-[#5b5f8a] dark:text-[#a3a8d6]"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.previewRows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border-[#d5daf7] transition-colors hover:bg-[#e0e3ff] dark:border-[#333a7a] dark:hover:bg-[#2c3270]"
                  >
                    {row.map((value, cellIndex) => (
                      <TableCell key={cellIndex} className="max-w-48 truncate">
                        {formatSourceValue(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="batch-name" className="text-sm font-medium">
                Sheet name
              </Label>
              <Input
                id="batch-name"
                value={batchName}
                onChange={(event) => setBatchName(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-column" className="text-sm font-medium">
                Order ID column (must be unique per order)
              </Label>
              <Select value={keyColumn} onValueChange={(value: string | null) => setKeyColumn(value ?? "")}>
                <SelectTrigger id="key-column" className={`w-full ${FIELD_CLASS}`}>
                  <SelectValue placeholder="Choose a column">{keyColumnLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {preview.headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                  <SelectItem value={ROW_NUMBER_KEY}>{ROW_NUMBER_LABEL}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <Button onClick={handleImport} disabled={isImporting} className={`${PRIMARY_BUTTON_CLASS} group/import`}>
            {isImporting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Import {preview.totalRows} rows
            {isImporting ? null : (
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/import:translate-x-1"
                aria-hidden="true"
              />
            )}
          </Button>
        </section>
      ) : null}

      {/* Step 3 */}
      {importResult ? (
        <section className={`${CARD_CLASS} space-y-4 border-[#f5d58a] dark:border-[#6b5420]`}>
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1] text-[#7a5200] dark:bg-[#3a3015] dark:text-[#f5d58a]">
              <AlertCircle className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold tracking-tight">
                Imported {importResult.imported} rows, skipped {importResult.skippedCount}
              </h2>
              <p className={`text-sm ${MUTED_TEXT_CLASS}`}>These rows could not be imported:</p>
            </div>
          </div>

          <ul className="space-y-2">
            {importResult.skipped.slice(0, MAX_SKIPPED_REASONS_SHOWN).map((skipped) => (
              <li
                key={skipped.rowNumber}
                className="flex gap-3 rounded-lg border border-[#d5daf7] bg-[#f4f6ff] px-3 py-2 text-sm dark:border-[#333a7a] dark:bg-[#252a60]"
              >
                <span className="shrink-0 font-semibold text-[#4f46e5] dark:text-[#818cf8]">Row {skipped.rowNumber}</span>
                <span className={MUTED_TEXT_CLASS}>{skipped.reason}</span>
              </li>
            ))}
          </ul>

          <Link
            href={adminBatchRoute(importResult.batchId)}
            className="group/open inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc]"
          >
            Open the imported sheet
            <ArrowRight className="size-4 transition-transform duration-200 group-hover/open:translate-x-1" aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </div>
  );
}