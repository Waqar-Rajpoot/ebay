"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Columns3, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { batchColumnApiRoute, batchColumnsApiRoute } from "@/lib/constants";
import { getErrorMessage, jsonInit, requestJson } from "@/lib/http/apiClient";
import { describeColumn } from "@/lib/orders/calculatedColumns";
import { CALCULATION_OPERATIONS, COLUMN_TYPES } from "@/lib/orders/orderConstants";
import type { CalculationOperation, ColumnDefinition, ColumnKind, ColumnType } from "@/lib/orders/orderTypes";
import { createColumnSchema } from "@/lib/validation/schemas";

const KIND_LABELS: Record<ColumnKind, string> = { input: "Typed by the team", calculated: "Calculated" };
const TYPE_LABELS: Record<ColumnType, string> = { money: "Amount", number: "Number", text: "Text" };
const OPERATION_LABELS: Record<CalculationOperation, string> = { subtract: "Subtract (A - B)", add: "Add (A + B)" };

/** Shared flat styles. Full class names so Tailwind can detect them. */
const MUTED_TEXT_CLASS = "text-[#5b5f8a] dark:text-[#a3a8d6]";
const BORDER_CLASS = "border-[#d5daf7] dark:border-[#333a7a]";
const FIELD_CLASS =
  "h-11 rounded-xl border-[#d5daf7] bg-white transition-colors focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 dark:border-[#333a7a] dark:bg-[#1e2250] dark:focus-visible:border-[#818cf8] dark:focus-visible:ring-[#818cf8]/30";
const PRIMARY_BUTTON_CLASS =
  "h-11 rounded-xl bg-[#4f46e5] px-5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg active:translate-y-0 disabled:opacity-50 motion-reduce:transition-none dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc]";
const KIND_BADGE_CLASS: Record<ColumnKind, string> = {
  input: "bg-[#e0e3ff] text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]",
  calculated: "bg-[#d5f3ef] text-[#0d9488] dark:bg-[#1b4552] dark:text-[#2dd4bf]",
};

interface ColumnManagerProps {
  batchId: string;
  columns: ColumnDefinition[];
}

/** Lists the added columns of a sheet and lets the admin add or delete them. */
export default function ColumnManager({ batchId, columns }: ColumnManagerProps) {
  const router = useRouter();
  const moneyInputColumns = columns.filter((column) => column.kind === "input" && column.type === "money");

  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<ColumnKind>("input");
  const [type, setType] = useState<ColumnType>("money");
  const [operation, setOperation] = useState<CalculationOperation>("subtract");
  const [leftKey, setLeftKey] = useState(moneyInputColumns[0]?.key ?? "");
  const [rightKey, setRightKey] = useState(moneyInputColumns[1]?.key ?? "");
  const [floorAtZero, setFloorAtZero] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ColumnDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const labelForKey = (key: string) => moneyInputColumns.find((column) => column.key === key)?.label ?? "Choose a column";

  async function handleAdd() {
    const payload =
      kind === "input" ? { kind, label, type } : { kind, label, operation, leftKey, rightKey, floorAtZero };
    const parsed = createColumnSchema.safeParse(payload);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setFormError(null);
    setIsAdding(true);
    try {
      await requestJson(batchColumnsApiRoute(batchId), jsonInit("POST", parsed.data));
      toast.success(`Column "${parsed.data.label}" added.`);
      setLabel("");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await requestJson(batchColumnApiRoute(batchId, deleteTarget.key), jsonInit("DELETE"));
      toast.success(`Column "${deleteTarget.label}" deleted.`);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      className={`column-manager-rise overflow-hidden rounded-2xl border bg-white text-[#1e1b4b] dark:bg-[#1e2250] dark:text-[#eef0ff] ${BORDER_CLASS}`}
    >
      {/* Entrance animation, disabled for reduced motion. */}
      <style>{`
        @keyframes column-manager-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .column-manager-rise { animation: column-manager-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .column-manager-rise { animation: none; }
        }
      `}</style>

      <header className={`flex flex-wrap items-start justify-between gap-3 border-b p-6 ${BORDER_CLASS}`}>
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e0e3ff] text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
            <Columns3 className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold tracking-tight">Added columns</h2>
            <p className={`text-sm ${MUTED_TEXT_CLASS}`}>
              These columns appear after the original columns, with a box in every row.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#e0e3ff] px-3 py-1 text-xs font-semibold text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
          {columns.length} {columns.length === 1 ? "column" : "columns"}
        </span>
      </header>

      <div className="space-y-6 p-6">
        <div className={`overflow-x-auto rounded-xl border ${BORDER_CLASS}`}>
          <Table>
            <TableHeader>
              <TableRow className="border-[#d5daf7] bg-[#f4f6ff] hover:bg-[#f4f6ff] dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:bg-[#252a60]">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#5b5f8a] dark:text-[#a3a8d6]">
                  Column
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#5b5f8a] dark:text-[#a3a8d6]">
                  Kind
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#5b5f8a] dark:text-[#a3a8d6]">
                  How it is filled
                </TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Delete</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column) => (
                <TableRow
                  key={column.key}
                  className="border-[#d5daf7] transition-colors hover:bg-[#e0e3ff] motion-reduce:transition-none dark:border-[#333a7a] dark:hover:bg-[#2c3270]"
                >
                  <TableCell className="py-3.5 font-medium">{column.label}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${KIND_BADGE_CLASS[column.kind]}`}
                    >
                      {KIND_LABELS[column.kind]}
                    </span>
                  </TableCell>
                  <TableCell className={MUTED_TEXT_CLASS}>{describeColumn(column, columns)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete column ${column.label}`}
                      onClick={() => setDeleteTarget(column)}
                      className="rounded-lg text-[#5b5f8a] transition-colors hover:bg-[#fde8e8] hover:text-[#c62828] dark:text-[#a3a8d6] dark:hover:bg-[#4a2230] dark:hover:text-[#ff8a80]"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className={`space-y-5 rounded-xl border bg-[#f4f6ff] p-5 dark:bg-[#252a60] ${BORDER_CLASS}`}>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Plus className="size-4 text-[#4f46e5] dark:text-[#818cf8]" aria-hidden="true" />
            Add a column
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="column-label" className="text-sm font-medium">
                Column name
              </Label>
              <Input
                id="column-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="column-kind" className="text-sm font-medium">
                Kind
              </Label>
              <Select value={kind} onValueChange={(value: string | null) => setKind(value === "calculated" ? "calculated" : "input")}>
                <SelectTrigger id="column-kind" className={`w-full ${FIELD_CLASS}`}>
                  <SelectValue>{KIND_LABELS[kind]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="input">{KIND_LABELS.input}</SelectItem>
                  <SelectItem value="calculated">{KIND_LABELS.calculated}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {kind === "input" ? (
              <div className="space-y-2">
                <Label htmlFor="column-type" className="text-sm font-medium">
                  Type
                </Label>
                <Select
                  value={type}
                  onValueChange={(value: string | null) => {
                    const match = COLUMN_TYPES.find((candidate) => candidate === value);
                    if (match) setType(match);
                  }}
                >
                  <SelectTrigger id="column-type" className={`w-full ${FIELD_CLASS}`}>
                    <SelectValue>{TYPE_LABELS[type]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="column-operation" className="text-sm font-medium">
                  Operation
                </Label>
                <Select
                  value={operation}
                  onValueChange={(value: string | null) => {
                    const match = CALCULATION_OPERATIONS.find((candidate) => candidate === value);
                    if (match) setOperation(match);
                  }}
                >
                  <SelectTrigger id="column-operation" className={`w-full ${FIELD_CLASS}`}>
                    <SelectValue>{OPERATION_LABELS[operation]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CALCULATION_OPERATIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {OPERATION_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {kind === "calculated" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="column-left" className="text-sm font-medium">
                  Column A
                </Label>
                <Select value={leftKey} onValueChange={(value: string | null) => setLeftKey(value ?? "")}>
                  <SelectTrigger id="column-left" className={`w-full ${FIELD_CLASS}`}>
                    <SelectValue placeholder="Choose a column">{labelForKey(leftKey)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {moneyInputColumns.map((column) => (
                      <SelectItem key={column.key} value={column.key}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="column-right" className="text-sm font-medium">
                  Column B
                </Label>
                <Select value={rightKey} onValueChange={(value: string | null) => setRightKey(value ?? "")}>
                  <SelectTrigger id="column-right" className={`w-full ${FIELD_CLASS}`}>
                    <SelectValue placeholder="Choose a column">{labelForKey(rightKey)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {moneyInputColumns.map((column) => (
                      <SelectItem key={column.key} value={column.key}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-3">
                <Checkbox
                  id="column-floor"
                  checked={floorAtZero}
                  onCheckedChange={(checked) => setFloorAtZero(checked === true)}
                />
                <Label htmlFor="column-floor" className="text-sm font-medium">
                  Never below 0
                </Label>
              </div>
            </div>
          ) : null}

          {formError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <Button onClick={handleAdd} disabled={isAdding} className={PRIMARY_BUTTON_CLASS}>
            {isAdding ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            Add column
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !isDeleting && !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-[#d5daf7] bg-white text-[#1e1b4b] dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#eef0ff]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete column &quot;{deleteTarget?.label}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className={MUTED_TEXT_CLASS}>
              Values the team typed in this column will be removed from every row. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl border-[#d5daf7] bg-transparent hover:bg-[#e0e3ff] dark:border-[#333a7a] dark:hover:bg-[#2c3270]"
            >
              Cancel
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-xl">
              {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Delete column
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}