import { Link } from "@tanstack/react-router";
import { PlusCircle, Target, Timer, Trophy, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { WeakTopicList } from "@/components/dashboard/WeakTopicList";
import { SubjectTopicsBreakdown } from "@/components/dashboard/SubjectTopicsBreakdown";
import { RecentTestsTable } from "@/components/dashboard/RecentTestsTable";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { useStudentDashboard, useUser } from "@/lib/api/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUser();
  
  // Use the student ID from the user profile, or null if loading
  const studentId = user?.profile?._id || user?.profile?.id || user?.id || user?._id || "";
  
  const { data, isLoading, error } = useStudentDashboard(studentId); 

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isUserLoading, navigate]);

  if (isUserLoading || (user && !studentId && isLoading)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <p>Failed to load dashboard data. Ensure the backend is running.</p>
        <p className="text-sm">Error: {error?.message}</p>
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
              Welcome back
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Hi, {data.student.name.split(" ")[0]} 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Grade {data.student.grade} · {data.student.board} · You're up{" "}
              <span className="font-medium text-success">12%</span> this month — keep going.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" className="shadow-sm">
              <Link to="/test/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create new test
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard/student">View past tests</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests taken" value={data.stats.testsTaken} icon={Trophy} delta={8} hint="Last 30 days" />
        <StatCard label="Avg score" value={`${data.stats.averageScore}%`} icon={Target} delta={4} hint="Across all subjects" />
        <StatCard label="Accuracy" value={`${data.stats.accuracy}%`} icon={Activity} delta={3} hint="Correct / answered" />
        <StatCard label="Avg time / question" value={`${data.stats.avgTimePerQuestionSec}s`} icon={Timer} delta={-6} hint="Faster than last month" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Score trend"
          subtitle="Your last 10 tests"
          className="lg:col-span-2"
        >
          <ScoreTrendChart data={data.scoreTrend} />
        </ChartCard>
        <ChartCard title="Subject performance" subtitle="Average score by subject">
          <SubjectPerformanceChart data={data.subjectPerformance} />
        </ChartCard>
      </div>

      {/* Subject-wise strong & weak topics */}
      <div className="mt-8">
        <SectionHeader
          title="Strong & weak topics by subject"
          subtitle="Switch subjects to see what you've mastered and what needs work"
        />
        <SubjectTopicsBreakdown strong={data.strongTopics} weak={data.weakTopics} />
      </div>

      {/* Weak areas */}
      <div className="mt-8">
        <SectionHeader
          title="Where to focus"
          subtitle="Topics and subtopics that need attention"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeakTopicList title="Weak topics" items={data.weakTopics} />
          <WeakTopicList title="Weak subtopics" items={data.weakSubtopics} variant="subtopic" />
        </div>
      </div>

      {/* Recent tests */}
      <div className="mt-8">
        <SectionHeader title="Recent attempts" subtitle="Your latest tests, scores, and accuracy" />
        <RecentTestsTable tests={data.recentTests} />
      </div>

      {/* Focus insights */}
      <div className="mt-8">
        <SectionHeader title="Recommended focus this week" subtitle="Bite-sized actions to lift your scores" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.focusInsights.map((i) => (
            <InsightCard key={i.id} tone={i.tone} title={i.title} description={i.description} />
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="mt-8">
        <InsightCard
          tone={data.motivation.tone}
          title={data.motivation.title}
          description={data.motivation.description}
        />
      </div>
    </PageContainer>
  );
}
