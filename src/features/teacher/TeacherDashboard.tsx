import { useState } from "react";
import {
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import {
  useUser,
  useTeacherStats,
  useTeacherStudents,
  useTeacherAnalytics,
  useTeacherTopics,
  useAssignments,
} from "@/lib/api/hooks";
import { AssignTestDialog } from "./components/AssignTestDialog";
import { AssignmentTable } from "./components/AssignmentTable";
import { StudentRoster } from "./components/StudentRoster";
import { TopicMasteryGrid } from "./components/TopicMasteryGrid";

export function TeacherDashboard() {
  const [assignOpen, setAssignOpen] = useState(false);
  const { data: user, isLoading: isUserLoading } = useUser();
  const profileId = user?.profile?._id || user?.profile?.id || user?.id || user?._id || "";

  const { data: stats, isLoading: isStatsLoading } = useTeacherStats(profileId);
  const { data: subjects, isLoading: isAnalyticsLoading } = useTeacherAnalytics(profileId);
  const { data: students, isLoading: isStudentsLoading } = useTeacherStudents(profileId);
  const { data: topics, isLoading: isTopicsLoading } = useTeacherTopics(profileId);
  const { data: assignments, isLoading: isAssignmentsLoading } = useAssignments({ teacherId: profileId });

  const isLoading = isUserLoading || isStatsLoading || isAnalyticsLoading || isStudentsLoading || isTopicsLoading || isAssignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading teacher dashboard...</p>
      </div>
    );
  }

  if (!user || !stats || !subjects || !students || !topics || !assignments) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center p-4">
        <p className="text-destructive font-medium text-lg">Failed to load specialized teacher data.</p>
        <p className="text-sm text-muted-foreground">Make sure you are logged in as a teacher and your profile exists.</p>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Welcome */}
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary-soft/60 via-background to-background">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
              Teacher dashboard
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Welcome back, {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Teaching {user.profile?.subjects?.join(", ") || "No subjects"} · {user.profile?.experienceYears || 0} yrs experience
            </p>
          </div>
          <Button size="lg" onClick={() => setAssignOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Assign new test
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Students" value={stats.totalStudents} icon={Users} hint={`${stats.classes} classes`} />
        <StatCard label="Avg score" value={`${stats.averageScore}%`} icon={TrendingUp} hint="Across my students" />
        <StatCard label="Active" value={stats.activeAssignments} icon={ClipboardList} hint="Assignments" />
        <StatCard label="Completed" value={stats.completedAssignments} icon={CheckCircle2} hint="This term" />
        <StatCard label="Subjects" value={user.profile?.subjects?.length || 0} icon={BookOpen} hint={user.profile?.subjects?.[0] || "None"} />
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">My students</TabsTrigger>
          <TabsTrigger value="analytics">Subject analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Subject performance" subtitle="Avg across my students">
              <SubjectPerformanceChart data={subjects} />
            </ChartCard>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recent assignments
                </p>
                <div className="mt-3 space-y-3">
                  {assignments.slice(0, 4).map((a: any) => (
                    <div key={a.id || a._id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.targetLabel || a.className} · {a.submittedCount || 0}/{a.totalCount || 0} submitted
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <SectionHeader
            title="All assignments"
            subtitle="Tests you have assigned to classes, students, or groups"
            action={
              <Button size="sm" onClick={() => setAssignOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New assignment
              </Button>
            }
          />
          <AssignmentTable assignments={assignments} />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <SectionHeader
            title="My students"
            subtitle={`${students.length} students`}
          />
          <StudentRoster students={students} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          <ChartCard title="Subject performance" subtitle="My students vs school baseline">
            <SubjectPerformanceChart data={subjects} />
          </ChartCard>

          <div>
            <SectionHeader
              title="Topic mastery"
              subtitle={`Performance per topic`}
            />
            <TopicMasteryGrid topics={topics} />
          </div>
        </TabsContent>
      </Tabs>

      <AssignTestDialog open={assignOpen} onOpenChange={setAssignOpen} />
    </PageContainer>
  );
}
