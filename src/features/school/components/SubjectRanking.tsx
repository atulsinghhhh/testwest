import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SubjectStat } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  subjects: SubjectStat[];
}

export function SubjectRanking({ subjects }: Props) {
  const ranked = [...subjects].sort((a, b) => b.averageScore - a.averageScore);
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {ranked.map((s, idx) => {
          const isTop = idx === 0;
          const isWorst = idx === ranked.length - 1;
          const tone = isTop
            ? "text-success"
            : isWorst
              ? "text-destructive"
              : "text-muted-foreground";
          const trendUp = s.trend >= 0;
          return (
            <div key={s.subject} className="flex items-center gap-4 px-5 py-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                  isTop
                    ? "bg-success/10 text-success"
                    : isWorst
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.subject}</p>
                <p className="text-xs text-muted-foreground">{s.testsTaken} tests this term</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-muted sm:block">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isTop ? "bg-success" : isWorst ? "bg-destructive" : "bg-primary",
                    )}
                    style={{ width: `${s.averageScore}%` }}
                  />
                </div>
                <span className={cn("w-12 text-right text-sm font-semibold tabular-nums", tone)}>
                  {s.averageScore}%
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                    trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {trendUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(s.trend)}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
