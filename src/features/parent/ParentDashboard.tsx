import { useMemo, useState, useEffect } from "react";
import { Activity, BookCheck, Sparkles, Target, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { PerformanceAreaChart } from "@/components/dashboard/PerformanceAreaChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { WeakTopicList } from "@/components/dashboard/WeakTopicList";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { ChildSwitcher } from "@/components/dashboard/ChildSwitcher";
import {
  useUser,
  useParentChildren,
  useParentDashboard,
} from "@/lib/api/hooks";
import { parentService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ParentDashboard() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const parentId = user?.profile?._id || user?.profile?.id || user?.id || user?._id || "";

  const { data: childrenList, isLoading: isChildrenLoading, refetch: refetchChildren } = useParentChildren(parentId);
  
  const [childId, setChildId] = useState<string>("");
  const [targetStudentId, setTargetStudentId] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkChild = async () => {
    if (!targetStudentId) return;
    setIsLinking(true);
    try {
      await parentService.linkChild(parentId, targetStudentId);
      toast.success("Child linked successfully!");
      setTargetStudentId("");
      refetchChildren();
    } catch (err: any) {
      toast.error(err.message || "Failed to link child. Check the ID.");
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    if (childrenList && childrenList.length > 0 && !childId) {
      setChildId(childrenList[0].id);
    }
  }, [childrenList, childId]);

  const { data, isLoading, error } = useParentDashboard(parentId, childId);

  const child = useMemo(
    () => childrenList?.find((c) => c.id === childId) ?? childrenList?.[0],
    [childrenList, childId],
  );

  const isInitiallyLoading = isUserLoading || isChildrenLoading;
  const isDashboardLoading = !!childId && isLoading && !data && !error;
  const noChildren = !isChildrenLoading && childrenList && childrenList.length === 0;

  if (isInitiallyLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading parent dashboard...</p>
      </div>
    );
  }

  if (noChildren) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed border-2">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Activity className="h-8 w-8 text-primary opacity-50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No children linked yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Enter your child's student ID to link their account and start monitoring their progress. You can find this ID in your child's dashboard profile.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              placeholder="Enter Student ID (e.g. 6629...)" 
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
            />
            <Button onClick={handleLinkChild} disabled={isLinking}>
              {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link Child"}
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (isDashboardLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Fetching child performance...</p>
      </div>
    );
  }

  if (error || !data || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-destructive font-medium">Failed to load data. Is the backend running?</p>
        {error && <p className="text-xs text-muted-foreground">{(error as any).message}</p>}
        <div className="mt-4 flex w-full max-w-sm items-center space-x-2">
          <Input 
            placeholder="Link another student ID" 
            value={targetStudentId}
            onChange={(e) => setTargetStudentId(e.target.value)}
          />
          <Button onClick={handleLinkChild} disabled={isLinking} variant="outline">
            Link
          </Button>
        </div>
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
              Parent overview
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Hello, {user.firstName}
            </h2>
            <div className="mt-1 flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {child ? `Here's how ${child.name.split(" ")[0]} is progressing — Grade ${child.grade}, ${child.board}.` : "Select a child below."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {childrenList && childrenList.length > 0 && (
              <ChildSwitcher children={childrenList} value={childId} onChange={setChildId} />
            )}
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Link student ID" 
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-40 h-9 text-xs"
              />
              <Button onClick={handleLinkChild} disabled={isLinking} size="sm" variant="outline" className="h-9 px-3">
                {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests completed" value={data.stats.testsCompleted} icon={BookCheck} hint="Last 30 days" />
        <StatCard label="Average score" value={`${data.stats.averageScore}%`} icon={Target} delta={data.stats.improvementTrend} hint="vs previous month" />
        <StatCard label="Weak topics" value={data.stats.weakTopicsCount} icon={Activity} hint="Areas needing support" />
        <StatCard label="Improvement" value={`${data.stats.improvementTrend > 0 ? "+" : ""}${data.stats.improvementTrend}%`} icon={Sparkles} delta={data.stats.improvementTrend} hint="Trend this month" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Recent performance"
          subtitle="Score across recent attempts"
          className="lg:col-span-2"
        >
          <PerformanceAreaChart data={data.performanceTrend} />
        </ChartCard>
        <ChartCard title="Subject comparison" subtitle="Average score by subject">
          <SubjectPerformanceChart data={data.subjectPerformance} />
        </ChartCard>
      </div>

      {/* Weak areas */}
      <div className="mt-8">
        <SectionHeader
          title="Where they need support"
          subtitle="Topics and subtopics with lower accuracy"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeakTopicList title="Weak topics" items={data.weakTopics} />
          <WeakTopicList title="Weak subtopics" items={data.weakSubtopics} variant="subtopic" />
        </div>
      </div>

      {/* Activity + Summary */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline items={data.activity || []} />
        </div>
        <Card className="h-full">
          <CardHeader className="p-5 pb-2">
            <h3 className="text-sm font-semibold tracking-tight">Academic summary</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{child && `A quick read on ${child.name.split(" ")[0]}`}</p>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-2">
            <p className="text-sm leading-relaxed text-foreground/90">{data.summary}</p>
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grade</span>
                <span className="font-medium">{child?.grade}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Board</span>
                <span className="font-medium">{child?.board}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tests this month</span>
                <span className="font-medium tabular-nums">{data.stats.testsCompleted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average score</span>
                <span className="font-medium tabular-nums">{data.stats.averageScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="mt-8">
        <SectionHeader
          title="Supportive insights"
          subtitle="What's going well, and where to help"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.insights.map((i) => (
            <InsightCard key={i.id} tone={i.tone} title={i.title} description={i.description} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
