import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPLETENESS_OPTIONS, type Completeness, type OrderRowFilters } from "@/lib/orders/orderFilters";

/** Shared flat field styles. Full class names so Tailwind can detect them. */
const FIELD_CLASS =
  "h-11 rounded-xl border-[#d5daf7] bg-[#f4f6ff] transition-colors hover:border-[#4f46e5] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:border-[#818cf8] dark:focus-visible:border-[#818cf8] dark:focus-visible:ring-[#818cf8]/30";

interface OrderFiltersProps {
  filters: OrderRowFilters;
  onChange: (filters: OrderRowFilters) => void;
}

/** Search box and "missing prices" filter. */
export default function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const completenessLabel =
    COMPLETENESS_OPTIONS.find((option) => option.value === filters.completeness)?.label ?? "All rows";

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="order-search" className="text-sm font-medium">
          Search
        </Label>
        <div className="group relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[#5b5f8a] transition-colors group-focus-within:text-[#4f46e5] motion-reduce:transition-none dark:text-[#a3a8d6] dark:group-focus-within:text-[#818cf8]"
            aria-hidden="true"
          />
          <Input
            id="order-search"
            value={filters.searchText}
            onChange={(event) => onChange({ ...filters, searchText: event.target.value })}
            placeholder="Name, address, order ID..."
            className={`w-72 pl-10 pr-10 ${FIELD_CLASS}`}
          />
          {filters.searchText !== "" ? (
            <button
              type="button"
              onClick={() => onChange({ ...filters, searchText: "" })}
              aria-label="Clear search"
              className="absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full text-[#5b5f8a] transition-colors hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:text-[#a3a8d6] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-completeness" className="text-sm font-medium">
          Show
        </Label>
        <Select
          value={filters.completeness}
          onValueChange={(value: string | null) => {
            const match = COMPLETENESS_OPTIONS.find((option) => option.value === value);
            if (match) onChange({ ...filters, completeness: match.value as Completeness });
          }}
        >
          <SelectTrigger id="order-completeness" className={`w-52 ${FIELD_CLASS}`}>
            <SelectValue>{completenessLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COMPLETENESS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}