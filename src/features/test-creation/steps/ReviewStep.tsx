import { Pencil, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { WizardState, StepId } from "../wizard-types";

interface Props {
  state: WizardState;
  onEdit: (step: StepId) => void;
  onToggleAI: (val: boolean) => void;
}

interface Row {
  label: string;
  value: React.ReactNode;
  step: StepId;
}

export function ReviewStep({ state, onEdit, onToggleAI }: Props) {
  const rows: Row[] = [
    { label: "Board", value: state.board, step: "board" },
    { label: "Grade", value: state.grade ? `Grade ${state.grade}` : null, step: "grade" },
    { label: "Subject", value: state.subject, step: "subject" },
    { label: "Chapter", value: state.chapter, step: "chapter" },
    { label: "Topic", value: state.topic, step: "topic" },
    { label: "Subtopic", value: state.subtopic ?? "All subtopics", step: "subtopic" },
    {
      label: "Question types",
      value: (
        <div className="flex flex-wrap justify-end gap-1.5">
          {state.questionTypes.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">
              {t}
            </Badge>
          ))}
        </div>
      ),
      step: "questionTypes",
    },
    { label: "Difficulty", value: state.difficulty, step: "difficulty" },
    { label: "Questions", value: `${state.count} questions`, step: "count" },
  ];

  const estMinutes = Math.max(5, Math.round(state.count * 1.2));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-5 pb-2">
          <h3 className="text-sm font-semibold tracking-tight">Test summary</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estimated duration: {estMinutes} minutes
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {rows.map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {r.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {r.value || <span className="text-muted-foreground">Not set</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit(r.step)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${r.label}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-4 border-t bg-primary/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="space-y-0.5">
                <Label htmlFor="ai-toggle" className="text-sm font-semibold">
                  AI Power-up
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Generate fresh questions using Groq AI
                </p>
              </div>
            </div>
            <Switch
              id="ai-toggle"
              checked={state.useAI}
              onCheckedChange={onToggleAI}
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Click <strong>Generate test</strong> below to create your test.
      </p>
    </div>
  );
}
