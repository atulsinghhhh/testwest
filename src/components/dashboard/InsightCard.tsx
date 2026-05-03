import { Lightbulb, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InsightTone } from "@/types";

interface InsightCardProps {
  tone: InsightTone;
  title: string;
  description: string;
  className?: string;
}

const toneStyles: Record<InsightTone, { bg: string; icon: React.ComponentType<{ className?: string }>; iconBg: string }> = {
  positive: {
    bg: "border-success/20",
    icon: CheckCircle2,
    iconBg: "bg-success/10 text-success",
  },
  attention: {
    bg: "border-warning/30",
    icon: AlertCircle,
    iconBg: "bg-warning/15 text-warning-foreground",
  },
  motivational: {
    bg: "border-primary/20 bg-primary-soft/40",
    icon: Sparkles,
    iconBg: "bg-primary text-primary-foreground",
  },
  neutral: {
    bg: "",
    icon: Lightbulb,
    iconBg: "bg-muted text-muted-foreground",
  },
};

export function InsightCard({ tone, title, description, className }: InsightCardProps) {
  const t = toneStyles[tone];
  const Icon = t.icon;
  return (
    <Card className={cn("transition-shadow hover:shadow-md", t.bg, className)}>
      <CardContent className="flex gap-3 p-5">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", t.iconBg)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-snug">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
