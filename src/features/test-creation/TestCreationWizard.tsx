import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { testService } from "@/services/api";
import { useUser } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { toast } from "sonner";
import { StepProgress } from "./components/StepProgress";
import { GeneratedView } from "./components/GeneratedView";
import { BoardStep } from "./steps/BoardStep";
import { GradeStep } from "./steps/GradeStep";
import { SubjectStep } from "./steps/SubjectStep";
import { ChapterStep } from "./steps/ChapterStep";
import { TopicStep } from "./steps/TopicStep";
import { SubtopicStep } from "./steps/SubtopicStep";
import { QuestionTypesStep } from "./steps/QuestionTypesStep";
import { DifficultyStep } from "./steps/DifficultyStep";
import { CountStep } from "./steps/CountStep";
import { ReviewStep } from "./steps/ReviewStep";
import {
  initialWizardState,
  isReadyToGenerate,
  isStepValid,
  STEPS,
  type StepId,
  type WizardState,
} from "./wizard-types";

export function TestCreationWizard() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [currentStep, setCurrentStep] = useState<StepId>("board");
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPreFilled, setHasPreFilled] = useState(false);

  // Prefill board and grade from user profile once
  useEffect(() => {
    if (user?.profile && !hasPreFilled) {
      setState(prev => ({
        ...prev,
        board: prev.board || user.profile.board || null,
        grade: prev.grade || user.profile.grade || null,
      }));
      setHasPreFilled(true);
    }
  }, [user, hasPreFilled]);

  const handleGenerate = async () => {
    const studentId = user?.profile?._id || user?.profile?.id || user?.id || user?._id;
    if (!studentId || !isReadyToGenerate(state)) {
      toast.error("Please complete all steps first.");
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        studentId,
        board: state.board,
        grade: state.grade,
        subject: state.subject,
        chapter: state.chapter,
        topic: state.topic,
        subtopic: state.subtopic,
        difficulty: state.difficulty,
        questionTypes: state.questionTypes,
        count: state.count,
      };

      // Filter out null values to satisfy backend validation (Zod optional() doesn't like null)
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== null)
      );

      const result = state.useAI 
        ? await testService.generateAI(filteredPayload)
        : await testService.create(filteredPayload);

      setGenerated(true);
      toast.success("Test generated successfully!");
      
      const testId = result.id || result._id;
      
      // Navigate to the test taking page
      window.setTimeout(() => {
        navigate({ to: "/test/$testId/take", params: { testId } });
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate test. Make sure you have enough questions in the database.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDef = useMemo(
    () => STEPS.find((s) => s.id === currentStep)!,
    [currentStep],
  );
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const stepValid = isStepValid(currentStep, state);

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      // Reset downstream selections when an upstream choice changes
      if (key === "board" || key === "grade") {
        next.subject = null;
        next.chapter = null;
        next.topic = null;
        next.subtopic = null;
      } else if (key === "subject") {
        next.chapter = null;
        next.topic = null;
        next.subtopic = null;
      } else if (key === "chapter") {
        next.topic = null;
        next.subtopic = null;
      } else if (key === "topic") {
        next.subtopic = null;
      }
      return next;
    });
  };

  const goNext = () => {
    if (!stepValid) return;
    setCompleted((c) => new Set(c).add(currentStep));
    const next = STEPS[currentIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[currentIndex - 1];
    if (prev) setCurrentStep(prev.id);
  };

  const jumpTo = (step: StepId) => setCurrentStep(step);

  const reset = () => {
    setState(initialWizardState);
    setCompleted(new Set());
    setCurrentStep("board");
    setGenerated(false);
  };

  if (generated) {
    return (
      <PageContainer>
        <GeneratedView state={state} onCreateAnother={reset} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
          Create a new test
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Build a focused practice test in a minute
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {currentIndex + 1} of {STEPS.length} · {currentDef.title}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar progress */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-3">
              <StepProgress
                currentStep={currentStep}
                completed={completed}
                onJump={jumpTo}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Step body */}
        <div className="min-w-0">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold tracking-tight">{currentDef.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{currentDef.description}</p>
              </div>

              <StepBody
                step={currentStep}
                state={state}
                update={update}
                jumpTo={jumpTo}
              />
            </CardContent>
          </Card>

          {/* Footer nav */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep === "review" ? (
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!isReadyToGenerate(state) || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate test
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!stepValid}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

interface BodyProps {
  step: StepId;
  state: WizardState;
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  jumpTo: (step: StepId) => void;
}

function StepBody({ step, state, update, jumpTo }: BodyProps) {
  switch (step) {
    case "board":
      return <BoardStep value={state.board} onChange={(v) => update("board", v)} />;
    case "grade":
      return <GradeStep value={state.grade} onChange={(v) => update("grade", v)} />;
    case "subject":
      if (!state.board || !state.grade) return <Prereq message="Choose a board and grade first." />;
      return (
        <SubjectStep
          board={state.board}
          grade={state.grade}
          value={state.subject}
          onChange={(v) => update("subject", v)}
        />
      );
    case "chapter":
      if (!state.board || !state.grade || !state.subject)
        return <Prereq message="Pick a subject first." />;
      return (
        <ChapterStep
          board={state.board}
          grade={state.grade}
          subject={state.subject}
          value={state.chapter}
          onChange={(v) => update("chapter", v)}
        />
      );
    case "topic":
      if (!state.board || !state.grade || !state.subject || !state.chapter)
        return <Prereq message="Pick a chapter first." />;
      return (
        <TopicStep
          board={state.board}
          grade={state.grade}
          subject={state.subject}
          chapter={state.chapter}
          value={state.topic}
          onChange={(v) => update("topic", v)}
        />
      );
    case "subtopic":
      if (!state.board || !state.grade || !state.subject || !state.chapter || !state.topic)
        return <Prereq message="Pick a topic first." />;
      return (
        <SubtopicStep
          board={state.board}
          grade={state.grade}
          subject={state.subject}
          chapter={state.chapter}
          topic={state.topic}
          value={state.subtopic}
          onChange={(v) => update("subtopic", v)}
        />
      );
    case "questionTypes":
      return (
        <QuestionTypesStep
          value={state.questionTypes}
          onChange={(v) => update("questionTypes", v)}
        />
      );
    case "difficulty":
      return (
        <DifficultyStep value={state.difficulty} onChange={(v) => update("difficulty", v)} />
      );
    case "count":
      return <CountStep value={state.count} onChange={(v) => update("count", v)} />;
    case "review":
      return (
        <ReviewStep
          state={state}
          onEdit={jumpTo}
          onToggleAI={(v) => update("useAI", v)}
        />
      );
  }
}

function Prereq({ message }: { message: string }) {
  return (
    <p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">{message}</p>
  );
}
