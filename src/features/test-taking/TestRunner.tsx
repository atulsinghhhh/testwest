import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Eraser,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageContainer } from "@/components/shell/PageContainer";
import { Timer } from "./components/Timer";
import { AutosaveIndicator, type SaveStatus } from "./components/AutosaveIndicator";
import { QuestionPalette } from "./components/QuestionPalette";
import { MCQRenderer } from "./renderers/MCQRenderer";
import { MSQRenderer } from "./renderers/MSQRenderer";
import { FillBlankRenderer } from "./renderers/FillBlankRenderer";
import { ShortAnswerRenderer } from "./renderers/ShortAnswerRenderer";
import { useTest } from "@/lib/api/hooks";
import { testService } from "@/services/api";
import { toast } from "sonner";
import type { AnswerValue, Question } from "./test-types";

interface Props {
  testId: string;
}

export function TestRunner({ testId }: Props) {
  const navigate = useNavigate();
  const { data: test, isLoading, error, refetch } = useTest(testId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Sync answers from backend
  useEffect(() => {
    if (test?.questions) {
      const initialAnswers: Record<string, AnswerValue> = {};
      const initialMarked = new Set<string>();
      test.questions.forEach((q: any) => {
        initialAnswers[q._id] = q.givenAnswer;
        if (q.flagged) initialMarked.add(q._id);
      });
      setAnswers(initialAnswers);
      setMarked(initialMarked);
    }
  }, [test]);

  const persist = useCallback(
    async (qid: string, value: any, isFlagged: boolean) => {
      setSaveStatus("saving");
      try {
        await testService.autosaveResponse(testId, qid, {
          givenAnswer: value,
          flagged: isFlagged,
          timeSpentSeconds: 0, // Could implement real timer tracking here
        });
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), 1200);
      } catch (err) {
        setSaveStatus("idle");
        toast.error("Failed to autosave answer.");
      }
    },
    [testId],
  );

  const setAnswer = (qid: string, value: AnswerValue) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: value };
      return next;
    });
    // Debounce/Persist
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      persist(qid, value, marked.has(qid));
    }, 500);
  };

  const clearAnswer = (qid: string) => {
    setAnswer(qid, null);
  };

  const toggleMarked = (qid: string) => {
    const isNowMarked = !marked.has(qid);
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
    persist(qid, answers[qid], isNowMarked);
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await testService.submit(testId);
      toast.success("Test submitted!");
      navigate({ to: "/test/$testId/results", params: { testId } });
    } catch (err) {
      toast.error("Failed to submit test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    if (!test) return { answered: 0, total: 0, unanswered: 0 };
    const answered = test.questions.filter((q: any) => {
      const a = answers[q._id];
      return a !== null && a !== undefined && a !== "";
    }).length;
    return { answered, total: test.questions.length, unanswered: test.questions.length - answered };
  }, [test, answers]);

  if (error) {
    return (
      <PageContainer>
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold">Test not found</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              This test couldn't be loaded. It may have expired or been deleted.
            </p>
            <Button onClick={() => navigate({ to: "/test/new" })}>Create new test</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (isLoading || !test) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            Loading test…
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const q = test.questions[currentIndex]!;
  const a = answers[q._id];
  const isMarked = marked.has(q._id);

  return (
    <PageContainer>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
            Test in progress
          </p>
          <h2 className="mt-0.5 truncate text-base font-semibold md:text-lg">
            {test.subject} · {test.chapter} — {test.topic}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Grade {test.grade} · {test.board} · {test.difficulty} · {test.questions.length}{" "}
            questions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Timer startedAt={test.createdAt} />
          <AutosaveIndicator status={saveStatus} />
          <Button onClick={() => setConfirmOpen(true)} className="ml-auto md:ml-0">
            <Send className="mr-2 h-4 w-4" />
            Submit test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Question {currentIndex + 1} of {test.questions.length}
                </p>
                <Badge variant="secondary" className="mt-2 font-normal">
                  {q.type}
                </Badge>
              </div>
              <Button
                variant={isMarked ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleMarked(q._id)}
              >
                {isMarked ? (
                  <>
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    Marked
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Mark for review
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-3">
              <p className="text-base leading-relaxed text-foreground">{q.body}</p>

              {q.type === "MCQ" && (
                <MCQRenderer question={q} answer={a} onChange={(v) => setAnswer(q._id, v)} />
              )}
              {q.type === "MSQ" && (
                <MSQRenderer question={q} answer={a} onChange={(v) => setAnswer(q._id, v)} />
              )}
              {q.type === "Fill in the blanks" && (
                <FillBlankRenderer question={q} answer={a} onChange={(v) => setAnswer(q._id, v)} />
              )}
              {q.type === "Short answer" && (
                <ShortAnswerRenderer
                  question={q}
                  answer={a}
                  onChange={(v) => setAnswer(q._id, v)}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={() => clearAnswer(q._id)}>
              <Eraser className="mr-2 h-4 w-4" />
              Clear answer
            </Button>
            {currentIndex < test.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(test.questions.length - 1, i + 1))}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setConfirmOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Submit test
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-4">
              <QuestionPalette
                questions={test.questions.map((qu: any) => ({ ...qu, id: qu._id }))}
                answers={answers}
                marked={marked}
                currentIndex={currentIndex}
                onJump={setCurrentIndex}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your test?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered <strong>{stats.answered}</strong> of {stats.total} questions.
              {stats.unanswered > 0 && (
                <>
                  {" "}
                  <strong>{stats.unanswered}</strong>{" "}
                  {stats.unanswered === 1 ? "question is" : "questions are"} still unanswered.
                </>
              )}{" "}
              You won't be able to change your answers after submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Keep working</AlertDialogCancel>
            <AlertDialogAction onClick={submit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
