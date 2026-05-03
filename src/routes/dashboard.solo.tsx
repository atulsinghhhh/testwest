import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { SoloDashboard } from "@/features/solo/SoloDashboard";


export const Route = createFileRoute("/dashboard/solo")({
  head: () => ({
    meta: [
      { title: "Solo Learner — TestWest" },
      {
        name: "description",
        content:
          "TestWest solo learner dashboard: auto-generated tests, self-created practice, and progress tracking — no school required.",
      },
      { property: "og:title", content: "Solo Learner — TestWest" },
      {
        property: "og:description",
        content:
          "Independent learners get auto-generated weekly tests, custom practice, and clear progress insights on TestWest.",
      },
    ],
  }),
  component: SoloDashboardRoute,
});

import { useUser } from "@/lib/api/hooks";
import { Loader2 } from "lucide-react";

function SoloDashboardRoute() {
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
      title="Solo dashboard"
      subtitle={user?.profile ? `Grade ${user.profile.grade} · Independent learner` : "Independent learner"}
      role="SOLO"
      userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
    >
      <SoloDashboard />
    </AppShell>
  );
}
