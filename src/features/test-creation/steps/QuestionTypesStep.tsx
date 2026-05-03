import { CheckSquare, ListChecks, PencilLine, Type } from "lucide-react";
import { OptionCard } from "../components/OptionCard";
import { ALL_QUESTION_TYPES, QUESTION_TYPE_DESCRIPTIONS } from "@/lib/constants";
import type { QuestionType } from "@/types";

interface Props {
  value: QuestionType[];
  onChange: (v: QuestionType[]) => void;
}

const ICONS: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  MCQ: CheckSquare,
  MSQ: ListChecks,
  "Fill in the blanks": Type,
  "Short answer": PencilLine,
};

export function QuestionTypesStep({ value, onChange }: Props) {
  const toggle = (t: QuestionType) => {
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ALL_QUESTION_TYPES.map((t) => {
          const Icon = ICONS[t];
          return (
            <OptionCard
              key={t}
              title={t}
              subtitle={QUESTION_TYPE_DESCRIPTIONS[t]}
              selected={value.includes(t)}
              onClick={() => toggle(t)}
              icon={<Icon className="h-4 w-4" />}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Tip: combine MCQ and Short answer for a balanced practice set.
      </p>
    </div>
  );
}
