import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { TeacherDashboard } from "@/features/teacher/TeacherDashboard";


export const Route = createFileRoute("/dashboard/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — TestWest" },
      {
        name: "description",
        content:
          "TestWest teacher dashboard: manage classes, students, assignments, and subject analytics.",
      },
      { property: "og:title", content: "Teacher Dashboard — TestWest" },
      {
        property: "og:description",
        content:
          "Assign tests to classes, students, or groups and track performance across your students.",
      },
    ],
  }),
  component: TeacherDashboardRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function TeacherDashboardRoute() {
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
      title="Teacher dashboard"
      subtitle={user?.profile?.subjects ? `${user.profile.subjects.join(", ")} · Classes ${user.profile.classIds?.join(", ") || ""}` : "Classroom overview"}
      role="TEACHER"
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <TeacherDashboard />
    </AppShell>
  );
}
