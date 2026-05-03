import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { SchoolDashboard } from "@/features/school/SchoolDashboard";
import { useUser, useSchool } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/school")({
  head: () => ({
    meta: [
      { title: "School Dashboard — TestWest" },
      {
        name: "description",
        content:
          "TestWest school dashboard: monitor classes, students, and subject performance across the school.",
      },
      { property: "og:title", content: "School Dashboard — TestWest" },
      {
        property: "og:description",
        content:
          "Monitor classes, students, and subject performance across your school on TestWest.",
      },
    ],
  }),
  component: SchoolDashboardRoute,
});

function SchoolDashboardRoute() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const schoolId = user?.profile?.schoolId || user?.profile?._id || "";
  const { data: school, isLoading: isSchoolLoading } = useSchool(schoolId);

  if (isUserLoading || isSchoolLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell
      title="School dashboard"
      subtitle={school ? `${school.name} · ${school.board}` : "Institutional Overview"}
      role="SCHOOL"
      userName={user ? `${user.firstName} ${user.lastName}` : "Admin"}
    >
      <SchoolDashboard />
    </AppShell>
  );
}
