import { useMemo, useState } from "react";
import { ArrowLeft, Award, AlertTriangle, BookOpen, Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer } from "@/components/shell/PageContainer";
import { SectionHeader } from "@/components/shell/SectionHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { SubjectRanking } from "./SubjectRanking";
import { useUser, useSchoolClasses, useClassStudents } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  classId: string;
  onBack: () => void;
}

export function ClassDetail({ classId, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "avg" | "tests">("avg");

  const { data: user } = useUser();
  const schoolId = user?.schoolId || "";

  const { data: classesResult, isLoading: classesLoading } = useSchoolClasses(schoolId);
  const { data: studentsRaw, isLoading: studentsLoading } = useClassStudents(schoolId, classId);

  const classes = classesResult?.data || [];
  const cls = useMemo(
    () => classes.find((c: any) => c.id === classId || c._id === classId),
    [classes, classId],
  );

  const students = useMemo(() => {
    return (studentsRaw || []).map((s: any) => ({
      id: s.id || s._id,
      name: s.name || (s.user ? `${s.user.firstName} ${s.user.lastName}` : "Unknown"),
      rollNo: s.rollNo || "N/A",
      avgScore: s.avgScore || 0,
      testsTaken: s.testsTaken || 0,
      attendance: s.attendance || 0,
      strongSubject: s.strongSubject || "N/A",
      weakSubject: s.weakSubject || "N/A",
    }));
  }, [studentsRaw]);

  const subjects = useMemo(() => cls?.subjectPerformance || [], [cls]);
  const ranked = useMemo(
    () => [...subjects].sort((a: any, b: any) => b.averageScore - a.averageScore),
    [subjects],
  );
  const top = ranked[0] || { subject: "N/A", averageScore: 0 };
  const weak = ranked[ranked.length - 1] || { subject: "N/A", averageScore: 0 };

  const filtered = useMemo(() => {
    return students
      .filter(
        (s: any) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.rollNo.toString().toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a: any, b: any) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "tests") return b.testsTaken - a.testsTaken;
        return b.avgScore - a.avgScore;
      });
  }, [students, query, sort]);

  if (classesLoading || studentsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cls) {
    return (
      <PageContainer>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to school
        </Button>
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Class not found.
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to school
      </Button>

      {/* Header */}
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary-soft/60 via-background to-background">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground">
              Class overview
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              Class {cls.id}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Grade {cls.grade} · Section {cls.section} · Class teacher: {cls.teacher}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Students" value={cls.studentCount} icon={Users} />
        <StatCard
          label="Avg score"
          value={`${cls.avgScore}%`}
          icon={Award}
          delta={cls.trend}
          hint="vs previous term"
        />
        <StatCard label="Tests taken" value={cls.testsTaken} icon={BookOpen} />
        <StatCard
          label="Top subject"
          value={cls.topSubject.subject}
          hint={`${cls.topSubject.score}% avg`}
        />
      </div>

      {/* Best/weak subject for class */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15 text-success">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Best in class
              </p>
              <p className="mt-1 text-base font-semibold">
                {top.subject} · <span className="text-success">{top.averageScore}%</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Needs focus</p>
              <p className="mt-1 text-base font-semibold">
                {weak.subject} · <span className="text-destructive">{weak.averageScore}%</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject chart + ranking */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Subject performance" subtitle={`Class ${cls.id} averages`}>
          <SubjectPerformanceChart data={subjects} />
        </ChartCard>
        <div>
          <SectionHeader title="Ranked subjects" subtitle="Strongest to weakest" />
          <SubjectRanking subjects={subjects} />
        </div>
      </div>

      {/* Students */}
      <div className="mt-8">
        <SectionHeader
          title={`Students (${students.length})`}
          subtitle="Search, sort, and review individual performance"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or roll no"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 w-56 pl-8"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="avg">Sort: Avg score</option>
                <option value="name">Sort: Name</option>
                <option value="tests">Sort: Tests taken</option>
              </select>
            </div>
          }
        />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Roll</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Avg score</TableHead>
                  <TableHead className="text-right">Tests</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead>Strong</TableHead>
                  <TableHead>Weak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                      {s.rollNo}
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] justify-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                          s.avgScore >= 80
                            ? "bg-success/10 text-success"
                            : s.avgScore >= 60
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {s.avgScore}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.testsTaken}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {s.attendance}%
                    </TableCell>
                    <TableCell className="text-xs text-success">{s.strongSubject}</TableCell>
                    <TableCell className="text-xs text-destructive">{s.weakSubject}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No students match "{query}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
