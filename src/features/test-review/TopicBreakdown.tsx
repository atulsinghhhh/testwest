import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { GradedQuestion } from "@/features/test-taking/test-types";
import { resourcesFor, type StudyResource } from "./study-resources";
import { cn } from "@/lib/utils";

interface Props {
  graded: GradedQuestion[];
  subject: string;
}

type Mastery = "strong" | "attention" | "restudy";

interface SubtopicStat {
  subtopic: string;
  total: number;
  earned: number;
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
  pct: number;
  mastery: Mastery;
}

interface TopicStat {
  topic: string;
  total: number;
  earned: number;
  pct: number;
  mastery: Mastery;
  subtopics: SubtopicStat[];
}

function classifyMastery(pct: number): Mastery {
  if (pct >= 80) return "strong";
  if (pct >= 50) return "attention";
  return "restudy";
}

function masteryMeta(m: Mastery) {
  if (m === "strong") {
    return {
      label: "Strong",
      tone: "text-success",
      bg: "bg-success/10",
      border: "border-success/30",
      ring: "bg-success",
      icon: TrendingUp,
      message: "You've got this. Keep it sharp with quick reviews.",
    };
  }
  if (m === "attention") {
    return {
      label: "Needs attention",
      tone: "text-warning-foreground",
      bg: "bg-warning/10",
      border: "border-warning/30",
      ring: "bg-warning",
      icon: Pencil,
      message: "Almost there — revisit the tricky bits and retest.",
    };
  }
  return {
    label: "Restudy",
    tone: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    ring: "bg-destructive",
    icon: TrendingDown,
    message: "Start with the basics below before practicing more.",
  };
}

function resourceIcon(t: StudyResource["type"]) {
  if (t === "video") return PlayCircle;
  if (t === "article") return FileText;
  if (t === "notes") return BookOpen;
  return GraduationCap;
}

export function TopicBreakdown({ graded, subject }: Props) {
  const stats = useMemo<TopicStat[]>(() => {
    const byTopic = new Map<string, Map<string, GradedQuestion[]>>();
    for (const g of graded) {
      const topic = g.question.topic || "General";
      const sub = g.question.subtopic || "General";
      if (!byTopic.has(topic)) byTopic.set(topic, new Map());
      const subMap = byTopic.get(topic)!;
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub)!.push(g);
    }

    const result: TopicStat[] = [];
    for (const [topic, subMap] of byTopic.entries()) {
      const subtopics: SubtopicStat[] = [];
      let earned = 0;
      let total = 0;
      for (const [subtopic, items] of subMap.entries()) {
        const e = items.reduce((s, g) => s + g.pointsEarned, 0);
        const t = items.length;
        const pct = t === 0 ? 0 : Math.round((e / t) * 100);
        subtopics.push({
          subtopic,
          total: t,
          earned: e,
          correct: items.filter((g) => g.status === "correct").length,
          partial: items.filter((g) => g.status === "partial").length,
          incorrect: items.filter((g) => g.status === "incorrect").length,
          skipped: items.filter((g) => g.status === "skipped").length,
          pct,
          mastery: classifyMastery(pct),
        });
        earned += e;
        total += t;
      }
      subtopics.sort((a, b) => a.pct - b.pct);
      const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
      result.push({
        topic,
        total,
        earned,
        pct,
        mastery: classifyMastery(pct),
        subtopics,
      });
    }
    result.sort((a, b) => a.pct - b.pct);
    return result;
  }, [graded]);

  const summary = useMemo(() => {
    const strong = stats.filter((s) => s.mastery === "strong");
    const attention = stats.filter((s) => s.mastery === "attention");
    const restudy = stats.filter((s) => s.mastery === "restudy");
    return { strong, attention, restudy };
  }, [stats]);

  if (stats.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          mastery="strong"
          count={summary.strong.length}
          topics={summary.strong.map((s) => s.topic)}
        />
        <SummaryCard
          mastery="attention"
          count={summary.attention.length}
          topics={summary.attention.map((s) => s.topic)}
        />
        <SummaryCard
          mastery="restudy"
          count={summary.restudy.length}
          topics={summary.restudy.map((s) => s.topic)}
        />
      </div>

      <Card>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Topic & subtopic mastery</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                See where you're strong, what needs attention, and what to restudy — with curated resources for each.
              </p>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-accent-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <Accordion type="multiple" className="w-full">
            {stats.map((t) => (
              <TopicRow key={t.topic} stat={t} subject={subject} />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  mastery,
  count,
  topics,
}: {
  mastery: Mastery;
  count: number;
  topics: string[];
}) {
  const meta = masteryMeta(mastery);
  const Icon = meta.icon;
  return (
    <Card className={cn("border", meta.border)}>
      <CardContent className={cn("flex h-full flex-col gap-2 p-4", meta.bg)}>
        <div className="flex items-center gap-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", meta.ring)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <p className={cn("text-xs font-semibold uppercase tracking-wider", meta.tone)}>
            {meta.label}
          </p>
        </div>
        <p className="text-2xl font-semibold tabular-nums leading-none">{count}</p>
        <p className="text-xs text-muted-foreground">
          {count === 0 ? "No topics in this band" : count === 1 ? "topic" : "topics"}
        </p>
        {topics.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {topics.slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">
                {t}
              </Badge>
            ))}
            {topics.length > 3 && (
              <Badge variant="secondary" className="font-normal">
                +{topics.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopicRow({ stat, subject }: { stat: TopicStat; subject: string }) {
  const meta = masteryMeta(stat.mastery);
  const Icon = meta.icon;
  return (
    <AccordionItem value={stat.topic} className="border-b last:border-b-0">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex flex-1 flex-col gap-2 text-left sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                meta.ring,
              )}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{stat.topic}</p>
              <p className="text-xs text-muted-foreground">
                {stat.total} {stat.total === 1 ? "question" : "questions"} ·{" "}
                {stat.subtopics.length} subtopic{stat.subtopics.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:w-64">
            <Progress value={stat.pct} className="h-2 flex-1" />
            <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
              {stat.pct}%
            </span>
            <Badge
              variant="outline"
              className={cn("hidden shrink-0 font-normal sm:inline-flex", meta.tone, meta.border)}
            >
              {meta.label}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className={cn("rounded-xl border p-3 text-xs", meta.border, meta.bg)}>
          <span className={cn("font-medium", meta.tone)}>{meta.label}.</span>{" "}
          <span className="text-muted-foreground">{meta.message}</span>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Subtopics
          </p>
          {stat.subtopics.map((s) => (
            <SubtopicRow key={s.subtopic} stat={s} />
          ))}
        </div>

        {stat.mastery !== "strong" && (
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recommended resources
            </p>
            <ResourceList resources={resourcesFor(subject, stat.topic)} />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SubtopicRow({ stat }: { stat: SubtopicStat }) {
  const meta = masteryMeta(stat.mastery);
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.ring)} />
          <p className="truncate text-sm">{stat.subtopic}</p>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5 pl-4">
          {stat.correct > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-success">
              <CheckCircle2 className="h-3 w-3" /> {stat.correct} correct
            </span>
          )}
          {stat.partial > 0 && (
            <span className="text-[11px] text-warning-foreground">{stat.partial} partial</span>
          )}
          {stat.incorrect > 0 && (
            <span className="text-[11px] text-destructive">{stat.incorrect} incorrect</span>
          )}
          {stat.skipped > 0 && (
            <span className="text-[11px] text-muted-foreground">{stat.skipped} skipped</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:w-56">
        <Progress value={stat.pct} className="h-1.5 flex-1" />
        <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">
          {stat.pct}%
        </span>
      </div>
    </div>
  );
}

function ResourceList({ resources }: { resources: StudyResource[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? resources : resources.slice(0, 3);
  return (
    <div className="space-y-2">
      {visible.map((r, i) => {
        const Icon = resourceIcon(r.type);
        const internal = r.url.startsWith("/");
        return (
          <a
            key={i}
            href={r.url}
            target={internal ? undefined : "_blank"}
            rel={internal ? undefined : "noopener noreferrer"}
            className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary-soft/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-accent-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.source}
                {r.durationMin ? ` · ${r.durationMin} min` : ""} · {r.type}
              </p>
            </div>
            {internal ? (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </a>
        );
      })}
      {resources.length > 3 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => setExpanded((x) => !x)}
        >
          {expanded ? "Show less" : `Show ${resources.length - 3} more`}
        </Button>
      )}
    </div>
  );
}
