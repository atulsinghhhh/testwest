import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleAlert,
  CircleSlash2,
  Clock,
  PlusCircle,
  Target,
  Timer as TimerIcon,
  Trophy,
  Loader2,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageContainer } from "@/components/shell/PageContainer";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { useTest } from "@/lib/api/hooks";
import type { AnswerValue, Question } from "@/features/test-taking/test-types";
import { TopicBreakdown } from "./TopicBreakdown";
import { cn } from "@/lib/utils";

interface Props {
  testId: string;
}

export function TestResults({ testId }: Props) {
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useTest(testId);

  const stats = useMemo(() => {
    if (!test) return null;
    const correct = test.questions.filter((q: any) => q.isCorrect === true).length;
    const incorrect = test.questions.filter((q: any) => q.isCorrect === false).length;
    const pending = test.questions.filter(
      (q: any) => q.isCorrect === null || q.isCorrect === undefined,
    ).length;
    const answered = test.questions.filter(
      (q: any) => q.givenAnswer !== null && q.givenAnswer !== undefined,
    ).length;

    return {
      score: test.score ?? 0,
      accuracy: test.accuracy ?? 0,
      durationSec: test.durationSeconds ?? 0,
      correct,
      incorrect,
      pending,
      answered,
      total: test.questions.length,
      avgSec:
        test.questions.length > 0
          ? Math.round((test.durationSeconds ?? 0) / test.questions.length)
          : 0,
    };
  }, [test]);

  if (error) {
    return (
      <PageContainer>
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <h2 className="text-lg font-semibold">Results not found</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              We couldn't find results for this test. It may have been deleted.
            </p>
            <Button onClick={() => navigate({ to: "/test/new" })}>Create a new test</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (isLoading || !test || !stats) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            Loading results…
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const types = Array.from(new Set(test.questions.map((q: any) => q.type)));
  const perTypeData = types.map((t) => {
    const items = test.questions.filter((q: any) => q.type === t);
    const correct = items.filter((q: any) => q.isCorrect === true).length;
    const avg = items.length === 0 ? 0 : Math.round((correct / items.length) * 100);
    return { type: t, score: avg, count: items.length };
  });

  return (
    <PageContainer>
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary-soft/60 via-background to-background">
        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8">
          <ScoreRing score={stats.score} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
              Test complete
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {test.subject} · {test.topic}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Grade {test.grade} · {test.board} · {test.difficulty} · {test.questions.length}{" "}
              questions
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="font-normal">
                {stats.correct} correct
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {stats.incorrect} incorrect
              </Badge>
              {stats.pending > 0 && (
                <Badge variant="secondary" className="font-normal">
                  {stats.pending} pending
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col">
            <Button asChild>
              <Link to="/test/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Try another test
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard/student">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Score"
          value={`${stats.score}%`}
          icon={Trophy}
          hint={`${stats.correct}/${stats.total} correct`}
        />
        <StatCard
          label="Accuracy"
          value={`${stats.accuracy}%`}
          icon={Target}
          hint="Correct / answered"
        />
        <StatCard
          label="Time taken"
          value={formatDuration(stats.durationSec)}
          icon={Clock}
          hint="Total time"
        />
        <StatCard
          label="Avg / question"
          value={`${stats.avgSec}s`}
          icon={TimerIcon}
          hint="Time per question"
        />
      </div>

      {perTypeData.length > 0 && (
        <div className="mt-6">
          <ChartCard title="Performance by question type" subtitle="Average score across each type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perTypeData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="type"
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
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.8rem",
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="var(--color-chart-1)"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Simplified for now - can re-enable with real backend data if needed */}
      {/* <div className="mt-8">
        <TopicBreakdown graded={[]} subject={test.subject} />
      </div> */}

      <div className="mt-8">
        <Card>
          <CardHeader className="p-5 pb-2">
            <h3 className="text-sm font-semibold tracking-tight">Question-by-question review</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap any question to see your answer, the correct answer, and an explanation.
            </p>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <Accordion type="multiple" className="w-full">
              {test.questions.map((q: any, i: number) => (
                <AccordionItem key={q._id} value={q._id} className="border-b last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-1 items-center gap-3 text-left">
                      <StatusDot isCorrect={q.isCorrect} />
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        Q{i + 1}
                      </span>
                      <Badge variant="secondary" className="font-normal">
                        {q.type}
                      </Badge>
                      <span className="line-clamp-1 flex-1 text-sm text-foreground">{q.body}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ReviewBody question={q} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorVar =
    score >= 85
      ? "var(--color-success)"
      : score >= 60
        ? "var(--color-chart-1)"
        : "var(--color-destructive)";
  return (
    <div className="relative mx-auto h-28 w-28 shrink-0 md:mx-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="9"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={colorVar}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums leading-none">{score}</span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

function StatusDot({ isCorrect }: { isCorrect: boolean | null | undefined }) {
  if (isCorrect === true)
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Correct" />;
  if (isCorrect === false)
    return (
      <Circle
        className="h-4 w-4 shrink-0 fill-destructive text-destructive"
        aria-label="Incorrect"
      />
    );
  return <CircleSlash2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-label="Pending" />;
}

function statusLabel(isCorrect: boolean | null | undefined) {
  if (isCorrect === true) return "Correct";
  if (isCorrect === false) return "Incorrect";
  return "Pending";
}

function statusClass(isCorrect: boolean | null | undefined) {
  if (isCorrect === true) return "bg-success/10 text-success border-success/30";
  if (isCorrect === false) return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function ReviewBody({ question }: { question: any }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            statusClass(question.isCorrect),
          )}
        >
          {statusLabel(question.isCorrect)}
        </span>
      </div>
      <AnswerComparison question={question} />
      <div className="rounded-xl border bg-primary-soft/30 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
          Explanation
        </p>
        <p className="text-sm leading-relaxed">{question.explanation}</p>
      </div>
    </div>
  );
}

function AnswerComparison({ question }: { question: any }) {
  const { type, options, answer, givenAnswer } = question;

  if (type === "MCQ") {
    return (
      <div className="space-y-2">
        {(options || []).map((opt: string, i: number) => {
          const isCorrect = i === answer;
          const isUser = givenAnswer === i;
          return (
            <OptionRow
              key={i}
              label={String.fromCharCode(65 + i)}
              text={opt}
              isCorrect={isCorrect}
              isUser={isUser}
            />
          );
        })}
      </div>
    );
  }
  if (type === "MSQ") {
    const userAnswers = Array.isArray(givenAnswer) ? givenAnswer : [];
    const correctAnswers = Array.isArray(answer) ? answer : [];
    return (
      <div className="space-y-2">
        {(options || []).map((opt: string, i: number) => {
          const isCorrect = correctAnswers.includes(i);
          const isUser = userAnswers.includes(i);
          return (
            <OptionRow
              key={i}
              label={String.fromCharCode(65 + i)}
              text={opt}
              isCorrect={isCorrect}
              isUser={isUser}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AnswerBlock label="Your answer" value={String(givenAnswer || "—")} variant="user" />
      <AnswerBlock
        label={type === "Short answer" ? "Model answer" : "Accepted answer"}
        value={String(answer)}
        variant="correct"
      />
    </div>
  );
}

function OptionRow({
  label,
  text,
  isCorrect,
  isUser,
}: {
  label: string;
  text: string;
  isCorrect: boolean;
  isUser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3",
        isCorrect && "border-success/40 bg-success/5",
        !isCorrect && isUser && "border-destructive/40 bg-destructive/5",
        !isCorrect && !isUser && "bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
          isCorrect
            ? "border-success bg-success text-success-foreground"
            : isUser
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border bg-background text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span className="flex-1 text-sm">{text}</span>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {isCorrect && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-success">
            Correct
          </span>
        )}
        {isUser && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your answer
          </span>
        )}
      </div>
    </div>
  );
}

function AnswerBlock({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "user" | "correct";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        variant === "correct" ? "border-success/30 bg-success/5" : "bg-card",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
