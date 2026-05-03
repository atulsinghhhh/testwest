import { Input } from "@/components/ui/input";
import type { Question } from "../test-types";

interface Props {
  question: Question;
  answer: any;
  onChange: (a: any) => void;
}

export function FillBlankRenderer({ answer, onChange }: Props) {
  const text = typeof answer === "string" ? answer : "";
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Your answer
      </label>
      <Input
        value={text}
        placeholder="Type your answer here…"
        onChange={(e) => onChange(e.target.value)}
        className="h-11 text-base"
      />
      <p className="text-xs text-muted-foreground">
        Tip: spelling is checked but not case-sensitive.
      </p>
    </div>
  );
}
