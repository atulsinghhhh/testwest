import { cn } from "@/lib/utils";
import { useGrades } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

import { ALL_GRADES } from "@/lib/constants";

interface Props {
  value: number | null;
  onChange: (g: number) => void;
}

function band(g: number) {
  if (g <= 5) return "Primary";
  if (g <= 8) return "Middle";
  if (g <= 10) return "Secondary";
  return "Senior";
}

export function GradeStep({ value, onChange }: Props) {
  const { data: gradesResult, isLoading } = useGrades();
  const grades = gradesResult && gradesResult.length > 0 ? gradesResult : ALL_GRADES;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {(grades || []).map((g) => {
        const selected = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl border bg-card p-4 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/30",
            )}
          >
            <span className="text-2xl font-semibold tabular-nums">{g}</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {band(g)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
