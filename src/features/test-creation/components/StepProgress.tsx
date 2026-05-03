import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, type StepId } from "../wizard-types";

interface Props {
  currentStep: StepId;
  completed: Set<StepId>;
  onJump: (step: StepId) => void;
}

export function StepProgress({ currentStep, completed, onJump }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <ol className="flex flex-col gap-1">
      {STEPS.map((step, idx) => {
        const isCurrent = step.id === currentStep;
        const isDone = completed.has(step.id) && !isCurrent;
        const isReachable = isDone || idx <= currentIndex;
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onJump(step.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                isCurrent && "bg-primary-soft",
                !isCurrent && isReachable && "hover:bg-muted",
                !isReachable && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-accent-foreground",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    isCurrent ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {step.shortLabel}
                </p>
                <p className="truncate text-xs text-muted-foreground">{step.title}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
