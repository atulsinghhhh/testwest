import { useMemo, useState } from "react";
import { Sparkles, AlertTriangle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Subject, WeakArea } from "@/types";

interface Props {
  strong: WeakArea[];
  weak: WeakArea[];
  className?: string;
}

interface SubjectGroup {
  subject: Subject;
  strong: WeakArea[];
  weak: WeakArea[];
}

export function SubjectTopicsBreakdown({ strong, weak, className }: Props) {
  const groups: SubjectGroup[] = useMemo(() => {
    const map = new Map<Subject, SubjectGroup>();
    const add = (item: WeakArea, kind: "strong" | "weak") => {
      const g = map.get(item.subject) ?? { subject: item.subject, strong: [], weak: [] };
      g[kind].push(item);
      map.set(item.subject, g);
    };
    strong.forEach((s) => add(s, "strong"));
    weak.forEach((w) => add(w, "weak"));
    return Array.from(map.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [strong, weak]);

  const [active, setActive] = useState<Subject>(groups[0]?.subject ?? "Mathematics");
  const current = groups.find((g) => g.subject === active) ?? groups[0];

  if (!current) return null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {groups.map((g) => {
            const isActive = g.subject === active;
            return (
              <button
                key={g.subject}
                type="button"
                onClick={() => setActive(g.subject)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                <BookOpen className="h-3 w-3" />
                {g.subject}
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    isActive ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {g.strong.length + g.weak.length}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 pt-2 md:grid-cols-2">
        <TopicColumn
          tone="strong"
          icon={<Sparkles className="h-4 w-4" />}
          title="Strong topics"
          subtitle="Keep practising to maintain mastery"
          items={current.strong}
          empty={`No strong topics in ${current.subject} yet — take a few tests!`}
        />
        <TopicColumn
          tone="weak"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Topics to focus on"
          subtitle="Revisit these for the biggest gains"
          items={current.weak}
          empty={`Great — no weak topics in ${current.subject}!`}
        />
      </CardContent>
    </Card>
  );
}

interface ColumnProps {
  tone: "strong" | "weak";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: WeakArea[];
  empty: string;
}

function TopicColumn({ tone, icon, title, subtitle, items, empty }: ColumnProps) {
  const isStrong = tone === "strong";
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isStrong ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            isStrong ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
          )}
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg bg-background/60 p-3 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-background/80 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{it.topic}</p>
                <p className="truncate text-[11px] text-muted-foreground">{it.chapter}</p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    isStrong ? "text-success" : "text-destructive",
                  )}
                >
                  {it.accuracy}%
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {it.attempts} attempts
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
