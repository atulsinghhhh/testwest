import { CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WizardState } from "../wizard-types";

interface Props {
  state: WizardState;
  onCreateAnother: () => void;
}

export function GeneratedView({ state, onCreateAnother }: Props) {
  const id = `test_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const estMinutes = Math.max(5, Math.round(state.count * 1.2));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-success/30 bg-gradient-to-br from-success/10 via-background to-background">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your test is ready</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {state.count} questions · {state.difficulty} · ≈ {estMinutes} minutes
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Taking you to the test…</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Test ID: <span className="font-mono">{id}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <h3 className="text-sm font-semibold">What you'll be tested on</h3>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SummaryRow label="Board" value={state.board ?? ""} />
            <SummaryRow label="Grade" value={state.grade ? `Grade ${state.grade}` : ""} />
            <SummaryRow label="Subject" value={state.subject ?? ""} />
            <SummaryRow label="Chapter" value={state.chapter ?? ""} />
            <SummaryRow label="Topic" value={state.topic ?? ""} />
            <SummaryRow label="Subtopic" value={state.subtopic ?? "All subtopics"} />
          </ul>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Question types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {state.questionTypes.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" disabled>
          Start test
          <span className="ml-2 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
            Phase 3
          </span>
        </Button>
        <Button size="lg" variant="outline" onClick={onCreateAnother}>
          Create another test
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Test taking will be wired up in Phase 3. For now, this is a mock generation step.
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-sm font-medium">{value || "—"}</span>
    </li>
  );
}
