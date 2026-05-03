import { useState } from "react";
import { Sparkles, Target, Trophy, Zap, Globe2, Lock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { RecentTestsTable } from "@/components/dashboard/RecentTestsTable";
import { WeakTopicList } from "@/components/dashboard/WeakTopicList";
import { useStudentDashboard, useUser } from "@/lib/api/hooks";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function SoloDashboard() {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useUser();
  const studentId = user?.profile?._id || user?.profile?.id || user?.id || user?._id || "";
  const { data, isLoading, error } = useStudentDashboard(studentId);
  const [joinOpen, setJoinOpen] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");

  if (isUserLoading || (user && !studentId && isLoading)) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading your solo dashboard...</p>
      </div>
    );
  }

  if (!user || error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Welcome / status */}
      <Card className="overflow-hidden border-warning/30 bg-gradient-to-br from-warning/15 via-background to-background">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground">
              <Globe2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-warning-foreground">
                Solo learner
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Hi {data.student.name.split(" ")[0]} — keep up the rhythm
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                You're learning independently. Get smart auto-generated tests every week, or create
                your own. Want a teacher's guidance? Link your school below.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setJoinOpen(true)}>
              <Send className="mr-2 h-4 w-4" />
              Find my school
            </Button>
            <Button asChild>
              <Link to="/pricing">Upgrade plan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tests taken" value={data.stats.testsTaken} icon={Trophy} hint="All time" />
        <StatCard
          label="Avg score"
          value={`${data.stats.averageScore}%`}
          icon={Target}
          hint="Last 30 days"
        />
        <StatCard
          label="Accuracy"
          value={`${data.stats.accuracy}%`}
          icon={Zap}
          hint="Across attempts"
        />
        <StatCard label="Plan" value="Free" icon={Lock} hint="Upgrade for unlimited" />
      </div>

      <Tabs defaultValue="auto" className="mt-8">
        <TabsList>
          <TabsTrigger value="auto">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Recommended for you
          </TabsTrigger>
          <TabsTrigger value="progress">My progress</TabsTrigger>
          <TabsTrigger value="recent">Recent tests</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="mt-6 space-y-6">
          <SectionHeader
            title="Auto-generated tests this week"
            subtitle="Picked based on your weak topics and grade level"
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/test/new">Create my own</Link>
              </Button>
            }
          />
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {autoTests.map((t) => (
              <Card key={t.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-accent-foreground">
                    {t.subject}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">{t.chapter}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.questions} questions</span>
                    <span>{t.difficulty}</span>
                  </div>
                  <Button asChild size="sm" className="mt-4 w-full">
                    <Link to="/test/new">Start</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div> */}

          <Card className="bg-primary-soft/40">
            <CardContent className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Want unlimited auto-tests + parent reports?</p>
                <p className="text-xs text-muted-foreground">
                  Solo plans available monthly or yearly. Cancel anytime.
                </p>
              </div>
              <Button asChild>
                <Link to="/pricing">See plans</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Score trend" subtitle="Recent attempts">
              <ScoreTrendChart data={data.scoreTrend} />
            </ChartCard>
            <ChartCard title="Subject performance" subtitle="Average score per subject">
              <SubjectPerformanceChart data={data.subjectPerformance} />
            </ChartCard>
          </div>
          <WeakTopicList
            title="Weak topics"
            subtitle="Areas to focus on next"
            items={data.weakTopics}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <RecentTestsTable tests={data.recentTests} />
        </TabsContent>
      </Tabs>

      {/* Join school dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link your school</DialogTitle>
            <DialogDescription>
              Enter your school's TestWest code, or request to add your school if it isn't on
              TestWest yet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>School code</Label>
              <Input
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="e.g., WPS-BLR-2025"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Don't have a code?{" "}
              <button
                type="button"
                className="text-accent-foreground underline-offset-2 hover:underline"
                onClick={() => {
                  toast.success("Request sent", {
                    description: "We'll reach out to your school. Until then keep learning solo!",
                  });
                  setJoinOpen(false);
                }}
              >
                Request to add my school
              </button>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!schoolCode.trim()) return toast.error("Enter a school code");
                toast.success("Request sent", {
                  description: "Your school admin will approve the link soon.",
                });
                setJoinOpen(false);
                setSchoolCode("");
              }}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
