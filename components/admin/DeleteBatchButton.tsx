"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES, batchApiRoute } from "@/lib/constants";
import { getErrorMessage, jsonInit, requestJson } from "@/lib/http/apiClient";

/** Flat styles. Full class names so Tailwind can detect them. Red is used only for destructive actions. */
const TRIGGER_CLASS =
  "group h-9 rounded-xl border border-[#d5daf7] bg-white px-4 text-sm font-semibold text-[#1e1b4b] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c62828] hover:bg-[#fde8e8] hover:text-[#c62828] focus-visible:ring-2 focus-visible:ring-[#c62828]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#eef0ff] dark:hover:border-[#ff8a80] dark:hover:bg-[#4a2230] dark:hover:text-[#ff8a80] dark:focus-visible:ring-[#ff8a80]/40";
const DIALOG_CLASS =
  "rounded-2xl border-[#d5daf7] bg-white text-[#1e1b4b] dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#eef0ff]";
const CANCEL_CLASS =
  "h-10 rounded-xl border-[#d5daf7] bg-transparent font-semibold hover:bg-[#e0e3ff] dark:border-[#333a7a] dark:hover:bg-[#2c3270]";
const CONFIRM_CLASS =
  "h-10 rounded-xl bg-[#c62828] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#a31f1f] hover:shadow-lg active:translate-y-0 disabled:opacity-60 motion-reduce:transition-none dark:bg-[#ff8a80] dark:text-[#14173a] dark:hover:bg-[#ffab a4]";

interface DeleteBatchButtonProps {
  batchId: string;
  batchName: string;
}

/** Deletes a sheet and all its rows after a confirmation. */
export default function DeleteBatchButton({ batchId, batchName }: DeleteBatchButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await requestJson(batchApiRoute(batchId), jsonInit("DELETE"));
      toast.success("Sheet deleted.");
      setIsOpen(false);
      router.push(ROUTES.admin);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className={TRIGGER_CLASS}>
        <Trash2
          className="size-4 transition-transform duration-200 group-hover:-rotate-12 motion-reduce:transition-none"
          aria-hidden="true"
        />
        Delete
      </Button>
      <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && setIsOpen(open)}>
        <AlertDialogContent className={DIALOG_CLASS}>
          <AlertDialogHeader>
            <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-[#fde8e8] text-[#c62828] dark:bg-[#4a2230] dark:text-[#ff8a80]">
              <TriangleAlert className="size-6" aria-hidden="true" />
            </span>
            <AlertDialogTitle className="text-xl font-bold tracking-tight">Delete this sheet?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#5b5f8a] dark:text-[#a3a8d6]">
              &quot;{batchName}&quot; and every order and price entered in it will be permanently removed. Download
              the Excel file first if you still need it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className={CANCEL_CLASS}>
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className={CONFIRM_CLASS}>
              {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {isDeleting ? "Deleting..." : "Delete sheet"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}