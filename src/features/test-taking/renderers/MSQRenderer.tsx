import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "../test-types";

interface Props {
  question: Question;
  answer: any;
  onChange: (a: any) => void;
}

export function MSQRenderer({ question, answer, onChange }: Props) {
  const selected = Array.isArray(answer) ? answer : [];

  const toggle = (i: number) => {
    const has = selected.includes(i);
    const next = has
      ? selected.filter((x: number) => x !== i)
      : [...selected, i].sort((a: number, b: number) => a - b);
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">Select all that apply.</p>
      {(question.options || []).map((opt: string, i: number) => {
        const isSelected = selected.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary-soft/40 ring-2 ring-primary/30"
                : "hover:border-primary/30",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background",
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </span>
            <span className="text-sm">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
