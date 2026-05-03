import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerValue, Question } from "../test-types";
import { isEmpty } from "../test-types";

interface Props {
  questions: Question[];
  answers: Record<string, AnswerValue>;
  marked: Set<string>;
  currentIndex: number;
  onJump: (index: number) => void;
}

export function QuestionPalette({ questions, answers, marked, currentIndex, onJump }: Props) {
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && !isEmpty(a);
  }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="Answered" value={answeredCount} accent="success" />
        <Stat label="Remaining" value={questions.length - answeredCount} accent="muted" />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Questions
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const answered = a && !isEmpty(a);
            const isMarked = marked.has(q.id);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Question ${i + 1}`}
                className={cn(
                  "relative flex h-9 w-full items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-all",
                  isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                  answered
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {i + 1}
                {isMarked && (
                  <Bookmark className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-warning text-warning-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Legend />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "success" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-2.5",
        accent === "success" ? "border-success/30 bg-success/5" : "bg-muted/40",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Legend() {
  return (
    <div className="space-y-1.5 border-t pt-3 text-[11px] text-muted-foreground">
      <LegendRow color="bg-success/10 border border-success/40" label="Answered" />
      <LegendRow color="bg-background border border-border" label="Unanswered" />
      <LegendRow color="bg-background border border-border ring-2 ring-primary" label="Current" />
      <LegendRow icon label="Marked for review" />
    </div>
  );
}

function LegendRow({ color, label, icon }: { color?: string; label: string; icon?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {icon ? (
        <Bookmark className="h-3 w-3 fill-warning text-warning-foreground" />
      ) : (
        <span className={cn("h-3.5 w-3.5 rounded-sm", color)} />
      )}
      <span>{label}</span>
    </div>
  );
}
