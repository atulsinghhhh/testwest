import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, Target, Timer, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/shell/AppShell";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useUser, useStudentDashboard, useTests } from "@/lib/api/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Subject, TestAttempt, ScorePoint, WeakArea } from "@/types";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TestWest" },
      {
        name: "description",
        content: "Deep performance analytics: score trends, subject breakdowns, and topic mastery.",
      },
      { property: "og:title", content: "Analytics — TestWest" },
      {
        property: "og:description",
        content: "Track your performance over time across subjects and topics.",
      },
    ],
  }),
  component: AnalyticsRoute,
});

type Range = "7d" | "30d" | "90d" | "all";

function rangeToDays(r: Range) {
  return r === "7d" ? 7 : r === "30d" ? 30 : r === "90d" ? 90 : null;
}

function AnalyticsRoute() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isUserLoading, navigate]);

  if (isUserLoading) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppShell
      title="Analytics"
      subtitle="Performance, subjects, and topic mastery"
      role={user.role}
      userName={`${user.firstName} ${user.lastName}`}
    >
      <AnalyticsView user={user} />
    </AppShell>
  );
}

function AnalyticsView({ user }: { user: any }) {
  const studentId = user.profile?._id || "";
  const { data: dashboard, isLoading: isDashLoading } = useStudentDashboard(studentId);
  const { data: allTests, isLoading: isTestsLoading } = useTests(studentId);
  const [range, setRange] = useState<Range>("30d");
  const [view, setView] = useState<"overview" | "subject" | "topic">("overview");

  const filteredTests = useMemo(() => {
    if (!allTests) return [];
    const completed = allTests.filter((t) => t.status === "Completed");
    const days = rangeToDays(range);
    if (!days) return completed;
    const cutoff = Date.now() - days * 86400000;
    return completed.filter((t) => new Date(t.date).getTime() >= cutoff);
  }, [range, allTests]);

  const stats = useMemo(() => {
    const n = filteredTests.length;
    const avgScore = n ? Math.round(filteredTests.reduce((s, t) => s + (t.score || 0), 0) / n) : 0;
    const avgAccuracy = n
      ? Math.round(filteredTests.reduce((s, t) => s + (t.accuracy || 0), 0) / n)
      : 0;
    const totalMin = filteredTests.reduce((s, t) => s + (t.durationMinutes || 0), 0);
    const totalQ = filteredTests.reduce((s, t) => s + (t.questionCount || 0), 0);
    const avgTimePerQ = totalQ ? Math.round((totalMin * 60) / totalQ) : 0;
    return { count: n, avgScore, avgAccuracy, avgTimePerQ };
  }, [filteredTests]);

  const trend: ScorePoint[] = useMemo(() => {
    const sorted = [...filteredTests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sorted.slice(-15).map((t, i) => ({
      testIndex: i + 1,
      label: new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      }),
      score: t.score || 0,
      accuracy: t.accuracy || 0,
    }));
  }, [filteredTests]);

  const subjectBreakdown = useMemo(() => {
    const map = new Map<Subject, { total: number; n: number; acc: number }>();
    for (const t of filteredTests) {
      const cur = map.get(t.subject) ?? { total: 0, n: 0, acc: 0 };
      cur.total += t.score;
      cur.acc += t.accuracy;
      cur.n += 1;
      map.set(t.subject, cur);
    }
    return Array.from(map.entries())
      .map(([subject, v]) => ({
        subject,
        averageScore: Math.round(v.total / v.n),
        accuracy: Math.round(v.acc / v.n),
        testsTaken: v.n,
        trend: 0,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [filteredTests]);

  const difficultyBreakdown = useMemo(() => {
    const groups = ["Easy", "Medium", "Hard"] as const;
    return groups.map((d) => {
      const arr = filteredTests.filter((t) => t.difficulty === d);
      const avg = arr.length ? Math.round(arr.reduce((s, t) => s + t.score, 0) / arr.length) : 0;
      return { difficulty: d, count: arr.length, avgScore: avg };
    });
  }, [filteredTests]);

  if (isDashLoading || isTestsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <PageContainer>
      <SectionHeader
        title="Performance analytics"
        subtitle="Trends, subject breakdowns, and topic mastery"
        action={
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subject">By subject</TabsTrigger>
          <TabsTrigger value="topic">Topic mastery</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "overview" && (
        <OverviewSection
          stats={stats}
          trend={trend}
          subjectBreakdown={subjectBreakdown}
          difficultyBreakdown={difficultyBreakdown}
        />
      )}

      {view === "subject" && (
        <SubjectSection tests={filteredTests} subjectBreakdown={subjectBreakdown} />
      )}

      {view === "topic" && (
        <TopicSection
          weak={dashboard.weakTopics}
          strong={dashboard.strongTopics}
          weakSubtopics={dashboard.weakSubtopics}
        />
      )}
    </PageContainer>
  );
}

function OverviewSection({
  stats,
  trend,
  subjectBreakdown,
  difficultyBreakdown,
}: {
  stats: { count: number; avgScore: number; avgAccuracy: number; avgTimePerQ: number };
  trend: ScorePoint[];
  subjectBreakdown: { subject: Subject; averageScore: number; testsTaken: number; trend: number }[];
  difficultyBreakdown: { difficulty: string; count: number; avgScore: number }[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests in range" value={stats.count} icon={Trophy} hint="Completed only" />
        <StatCard
          label="Avg score"
          value={`${stats.avgScore}%`}
          icon={Target}
          hint="Across attempts"
        />
        <StatCard
          label="Accuracy"
          value={`${stats.avgAccuracy}%`}
          icon={Activity}
          hint="Correct / answered"
        />
        <StatCard
          label="Avg time / question"
          value={`${stats.avgTimePerQ}s`}
          icon={Timer}
          hint="Lower is faster"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Score trend"
          subtitle="Up to last 15 attempts in range"
          className="lg:col-span-2"
        >
          {trend.length === 0 ? <EmptyChart /> : <ScoreTrendChart data={trend} />}
        </ChartCard>
        <ChartCard title="Subject performance" subtitle="Average score by subject">
          {subjectBreakdown.length === 0 ? (
            <EmptyChart />
          ) : (
            <SubjectPerformanceChart data={subjectBreakdown} />
          )}
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Performance by difficulty" subtitle="Average score per difficulty band">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={difficultyBreakdown}
              margin={{ top: 8, right: 16, bottom: 0, left: -16 }}
            >
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="difficulty"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.8rem",
                }}
              />
              <Bar
                dataKey="avgScore"
                fill="var(--color-chart-1)"
                radius={[6, 6, 0, 0]}
                barSize={48}
                name="Avg score"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function SubjectSection({
  tests,
  subjectBreakdown,
}: {
  tests: TestAttempt[];
  subjectBreakdown: {
    subject: Subject;
    averageScore: number;
    accuracy?: number;
    testsTaken: number;
  }[];
}) {
  const subjects = subjectBreakdown.map((s) => s.subject);
  const [active, setActive] = useState<Subject | null>(subjects[0] ?? null);

  if (subjectBreakdown.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyChart />
        </CardContent>
      </Card>
    );
  }

  const currentSubject = active && subjects.includes(active) ? active : subjects[0];
  const subjectTests = tests
    .filter((t) => t.subject === currentSubject)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const subjectTrend: ScorePoint[] = subjectTests.slice(-12).map((t, i) => ({
    testIndex: i + 1,
    label: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    }),
    score: t.score,
    accuracy: t.accuracy,
  }));

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              currentSubject === s
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {subjectBreakdown.map((s) => {
          const isActive = s.subject === currentSubject;
          return (
            <Card
              key={s.subject}
              className={cn("transition-colors", isActive && "border-primary/40")}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.subject}
                  </p>
                  <Badge variant="secondary">{s.testsTaken} tests</Badge>
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                  {s.averageScore}%
                </p>
                <Progress value={s.averageScore} className="mt-3 h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <ChartCard
          title={`${currentSubject} score trend`}
          subtitle={`${subjectTests.length} attempts in range`}
        >
          {subjectTrend.length === 0 ? <EmptyChart /> : <ScoreTrendChart data={subjectTrend} />}
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard
          title="Recent attempts"
          subtitle={`Last ${Math.min(subjectTests.length, 8)} in this subject`}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={subjectTests.slice(-8).map((t) => ({
                label: new Date(t.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  timeZone: "UTC",
                }),
                score: t.score,
              }))}
              margin={{ top: 10, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--color-muted-foreground)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.8rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-chart-2)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function TopicSection({
  strong,
  weak,
  weakSubtopics,
}: {
  strong: WeakArea[];
  weak: WeakArea[];
  weakSubtopics: WeakArea[];
}) {
  const subjects = Array.from(new Set([...strong, ...weak].map((t) => t.subject)));
  const [active, setActive] = useState<Subject | "all">("all");

  const filteredStrong = active === "all" ? strong : strong.filter((s) => s.subject === active);
  const filteredWeak = active === "all" ? weak : weak.filter((s) => s.subject === active);
  const filteredSub =
    active === "all" ? weakSubtopics : weakSubtopics.filter((s) => s.subject === active);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            active === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted",
          )}
        >
          All subjects
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active === s
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopicListCard
          title="Strongest topics"
          tone="success"
          icon={TrendingUp}
          items={filteredStrong}
          emptyText="No strong topics yet for this subject."
        />
        <TopicListCard
          title="Topics to focus on"
          tone="destructive"
          icon={TrendingDown}
          items={filteredWeak}
          emptyText="No weak topics — great work!"
        />
      </div>

      <div className="mt-6">
        <SectionHeader title="Weak subtopics" subtitle="Drill down into specific gaps" />
        <Card>
          <CardContent className="p-0">
            {filteredSub.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No weak subtopics for this subject.
              </div>
            ) : (
              <ul className="divide-y">
                {filteredSub.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.subtopic ?? s.topic}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.subject} · {s.chapter} · {s.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={s.accuracy} className="h-1.5 w-24" />
                      <span className="w-12 text-right text-sm font-semibold tabular-nums text-destructive">
                        {s.accuracy}%
                      </span>
                      <Badge variant="outline" className="font-normal">
                        {s.attempts} attempts
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TopicListCard({
  title,
  tone,
  icon: Icon,
  items,
  emptyText,
}: {
  title: string;
  tone: "success" | "destructive";
  icon: React.ComponentType<{ className?: string }>;
  items: WeakArea[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              tone === "success"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((t) => (
              <li key={t.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.topic}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.subject} · {t.chapter}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      tone === "success" ? "text-success" : "text-destructive",
                    )}
                  >
                    {t.accuracy}%
                  </span>
                </div>
                <Progress value={t.accuracy} className="h-1.5" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      No data in this time range.
    </div>
  );
}
