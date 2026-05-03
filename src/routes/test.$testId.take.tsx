import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { TestRunner } from "@/features/test-taking/TestRunner";
import { useUser } from "@/lib/api/hooks";

export const Route = createFileRoute("/test/$testId/take")({
  head: () => ({
    meta: [
      { title: "Take Test — TestWest" },
      {
        name: "description",
        content:
          "Take your TestWest practice test with a question palette, autosave, and a built-in timer.",
      },
      { property: "og:title", content: "Take Test — TestWest" },
      {
        property: "og:description",
        content: "Practice test with palette, timer, and autosave.",
      },
    ],
  }),
  component: TakeTestRoute,
});

function TakeTestRoute() {
  const { testId } = Route.useParams();
  const { data: user } = useUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : "Student";

  if (!user) return null;

  return (
    <AppShell
      title="Test in progress"
      subtitle="Answer at your own pace · Autosave is on"
      role={user.role}
      userName={userName}
    >
      <TestRunner testId={testId} />
    </AppShell>
  );
}
