import { Textarea } from "@/components/ui/textarea";
import type { Question } from "../test-types";

interface Props {
  question: Question;
  answer: any;
  onChange: (a: any) => void;
}

export function ShortAnswerRenderer({ answer, onChange }: Props) {
  const text = typeof answer === "string" ? answer : "";
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Your answer
      </label>
      <Textarea
        value={text}
        rows={5}
        placeholder="Write 2–3 sentences…"
        onChange={(e) => onChange(e.target.value)}
        className="resize-y text-sm"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Tip: include key concepts in your answer.</span>
        <span className="tabular-nums">
          {text.trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
