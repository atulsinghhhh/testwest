import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { TestResults } from "@/features/test-review/TestResults";

export const Route = createFileRoute("/test/$testId/results")({
  head: () => ({
    meta: [
      { title: "Test Results — TestWest" },
      {
        name: "description",
        content:
          "Review your TestWest results: score, accuracy, time per question, and a per-question explanation for every answer.",
      },
      { property: "og:title", content: "Test Results — TestWest" },
      {
        property: "og:description",
        content: "Score, accuracy, and per-question explanations for your test.",
      },
    ],
  }),
  component: ResultsRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function ResultsRoute() {
  const { testId } = Route.useParams();
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-[100vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell
      title="Test results"
      subtitle="Score, accuracy, and per-question review"
      role={user?.role || "STUDENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <TestResults testId={testId} />
    </AppShell>
  );
}
