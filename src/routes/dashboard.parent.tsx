import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { ParentDashboard } from "@/features/parent/ParentDashboard";

export const Route = createFileRoute("/dashboard/parent")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — TestWest" },
      {
        name: "description",
        content:
          "TestWest parent dashboard: monitor your child's progress, weak areas, and recent activity.",
      },
      { property: "og:title", content: "Parent Dashboard — TestWest" },
      {
        property: "og:description",
        content: "Monitor your child's progress, weak areas, and recent activity on TestWest.",
      },
    ],
  }),
  component: ParentDashboardRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function ParentDashboardRoute() {
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
      title="Parent dashboard"
      subtitle="Linked children · Performance overview"
      role={user?.role || "PARENT"}
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <ParentDashboard />
    </AppShell>
  );
}
