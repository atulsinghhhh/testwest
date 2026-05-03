import { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  startedAt: string;
  className?: string;
}

function format(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Timer({ startedAt, className }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-foreground",
        className,
      )}
    >
      <TimerIcon className="h-3.5 w-3.5 text-muted-foreground" />
      {format(elapsed)}
    </span>
  );
}
