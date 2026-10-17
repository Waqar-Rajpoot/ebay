"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { batchExportApiRoute } from "@/lib/constants";
import { downloadBlob, getErrorMessage, requestBlob } from "@/lib/http/apiClient";

/** Flat primary style. Full class names so Tailwind can detect them. */
const EXPORT_BUTTON_CLASS =
  "group h-9 rounded-xl bg-[#4f46e5] px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 active:translate-y-0 disabled:opacity-60 motion-reduce:transition-none dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc] dark:focus-visible:ring-[#818cf8]/40";

/** Downloads the updated Excel file for a batch. */
export default function ExportButton({ batchId }: { batchId: string }) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    const task = requestBlob(batchExportApiRoute(batchId)).then(({ blob, fileName }) => {
      downloadBlob(blob, fileName);
    });
    toast.promise(task, {
      loading: "Preparing the Excel file...",
      success: "Download started.",
      error: (error: unknown) => getErrorMessage(error),
    });
    try {
      await task;
    } catch {
      // The toast above already shows the error.
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} className={EXPORT_BUTTON_CLASS}>
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download
          className="size-4 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
      {isExporting ? "Preparing..." : "Download Excel"}
    </Button>
  );
}