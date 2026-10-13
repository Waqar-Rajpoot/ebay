import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface OptionSelectProps {
  id: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

/** shadcn Select wrapper that renders a list of {value, label} options. */
export default function OptionSelect({ id, value, options, onChange }: OptionSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}