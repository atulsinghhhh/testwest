import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
interface TopicMastery {
  chapter: string;
  topic: string;
  mastery: number;
  studentsAttempted: number;
}

function toneFor(v: number) {
  if (v >= 80) return { label: "Strong", className: "text-success", bar: "bg-success" };
  if (v >= 60) return { label: "Steady", className: "text-warning-foreground", bar: "bg-warning" };
  return { label: "Needs work", className: "text-destructive", bar: "bg-destructive" };
}

export function TopicMasteryGrid({ topics }: { topics: TopicMastery[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((t) => {
        const tone = toneFor(t.mastery);
        return (
          <Card key={`${t.chapter}-${t.topic}`}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.chapter}</p>
              <p className="mt-0.5 text-sm font-semibold">{t.topic}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={tone.className}>{tone.label}</span>
                <span className="font-medium tabular-nums">{t.mastery}%</span>
              </div>
              <Progress value={t.mastery} className="mt-1.5 h-1.5" />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t.studentsAttempted} students attempted
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
