import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Child } from "@/types";

interface ChildSwitcherProps {
  children: Child[];
  value: string;
  onChange: (id: string) => void;
}

export function ChildSwitcher({ children, value, onChange }: ChildSwitcherProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-[220px]">
        <SelectValue placeholder="Select child" />
      </SelectTrigger>
      <SelectContent>
        {children.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              Grade {c.grade} · {c.board}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
