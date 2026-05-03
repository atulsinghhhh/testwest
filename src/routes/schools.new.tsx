import { createFileRoute } from "@tanstack/react-router";
import { CreateSchoolForm } from "@/features/school/components/CreateSchoolForm";
import { AppShell } from "@/components/shell/AppShell";
import { useUser } from "@/lib/api/hooks";

export const Route = createFileRoute("/schools/new")({
  head: () => ({
    meta: [
      { title: "Register New School — TestWest" },
      {
        name: "description",
        content: "Onboard your institution to TestWest Insights and start tracking collective performance.",
      },
    ],
  }),
  component: CreateSchoolNewPage,
});

function CreateSchoolNewPage() {
  const { data: user } = useUser();
  const userName = user ? `${user.firstName} ${user.lastName}` : "Admin";

  return (
    <AppShell 
      title="Register School" 
      subtitle="Institutional Onboarding"
      role="SCHOOL"
      userName={userName}
    >
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <CreateSchoolForm />
      </div>
    </AppShell>
  );
}
