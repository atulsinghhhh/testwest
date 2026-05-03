import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  meta?: string;
  className?: string;
}

export function OptionCard({
  title,
  subtitle,
  selected,
  onClick,
  icon,
  meta,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/30",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-primary-soft text-accent-foreground",
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
          {meta && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {meta}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
