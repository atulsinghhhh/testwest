import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/types";

interface Props {
  items: ActivityEntry[];
  className?: string;
}

function relative(iso: string) {
  const d = new Date(iso);
  // Force UTC to keep SSR + client output identical across timezones.
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function ActivityTimeline({ items, className }: Props) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="p-5 pb-2">
        <h3 className="text-sm font-semibold tracking-tight">Recent activity</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <ol className="relative space-y-5 border-l border-border pl-5">
          {items.map((it) => (
            <li key={it.id} className="relative">
              <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{it.title}</p>
                <p className="shrink-0 text-xs text-muted-foreground">{relative(it.date)}</p>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{it.description}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
