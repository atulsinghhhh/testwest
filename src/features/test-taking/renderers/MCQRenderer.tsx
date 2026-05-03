import { cn } from "@/lib/utils";
import type { Question } from "../test-types";

interface Props {
  question: Question;
  answer: any;
  onChange: (a: any) => void;
}

export function MCQRenderer({ question, answer, onChange }: Props) {
  const selected = answer;

  return (
    <div className="space-y-2.5">
      {(question.options || []).map((opt: string, i: number) => {
        const isSelected = selected === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "border-primary bg-primary-soft/40 ring-2 ring-primary/30" : "hover:border-primary/30",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
              )}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-sm">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
