import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (n: number) => void;
}

const PRESETS = [5, 10, 15, 20, 30, 50];

export function CountStep({ value, onChange }: Props) {
  const estMinutes = Math.max(5, Math.round(value * 1.2));
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Questions
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ {estMinutes} minutes to complete
            </p>
          </div>
          <Slider
            value={[value]}
            min={5}
            max={50}
            step={1}
            onValueChange={(v) => onChange(v[0]!)}
          />
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  value === p
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {p} questions
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Choose between 5 and 50 questions. Shorter tests are great for daily practice.
      </p>
    </div>
  );
}
