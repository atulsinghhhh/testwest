import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { TestCreationWizard } from "@/features/test-creation/TestCreationWizard";

export const Route = createFileRoute("/test/new")({
  head: () => ({
    meta: [
      { title: "Create a Test — TestWest" },
      {
        name: "description",
        content:
          "Build a focused practice test on TestWest by board, grade, subject, chapter, topic, question types, difficulty, and count.",
      },
      { property: "og:title", content: "Create a Test — TestWest" },
      {
        property: "og:description",
        content:
          "Build a focused practice test by board, grade, subject, chapter, topic, and difficulty.",
      },
    ],
  }),
  component: NewTestRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function NewTestRoute() {
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
      title="Create new test"
      subtitle="9-step wizard · Choose your focus"
      role={user?.role || "STUDENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <TestCreationWizard />
    </AppShell>
  );
}
