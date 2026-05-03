import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WeakArea } from "@/types";

interface WeakTopicListProps {
  title: string;
  subtitle?: string;
  items: WeakArea[];
  variant?: "topic" | "subtopic";
  className?: string;
}

export function WeakTopicList({
  title,
  subtitle,
  items,
  variant = "topic",
  className,
}: WeakTopicListProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="p-5 pb-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <ul className="space-y-2.5">
          {items.map((item) => {
            const label = variant === "subtopic" && item.subtopic ? item.subtopic : item.topic;
            const meta = `${item.subject} · ${item.chapter}`;
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">{meta}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-destructive">
                    {item.accuracy}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.attempts} attempts
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
