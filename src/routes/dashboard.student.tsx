import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { StudentDashboard } from "@/features/student/StudentDashboard";

export const Route = createFileRoute("/dashboard/student")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — TestWest" },
      {
        name: "description",
        content:
          "TestWest student dashboard: track recent performance, weak topics, accuracy, and start a new test.",
      },
      { property: "og:title", content: "Student Dashboard — TestWest" },
      {
        property: "og:description",
        content: "Track recent performance, weak topics, and accuracy on TestWest.",
      },
    ],
  }),
  component: StudentDashboardRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function StudentDashboardRoute() {
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
      title="Student dashboard"
      subtitle={
        user?.profile ? `Grade ${user.profile.grade} · ${user.profile.board}` : "Learner overview"
      }
      role={user?.role || "STUDENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <StudentDashboard />
    </AppShell>
  );
}
