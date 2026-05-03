import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface Student {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  rollNo?: string;
  className?: string;
  grade: number;
  section?: string | null;
  avgScore?: number;
  testsTaken?: number;
  strongSubject?: string;
  weakSubject?: string;
  trend?: number;
}

function initials(firstName: string, lastName: string) {
  return (firstName[0] || "") + (lastName[0] || "").toUpperCase();
}

export function StudentRoster({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className || `${s.grade}${s.section || ""}`));
    return Array.from(set).filter(Boolean).sort();
  }, [students]);
  const [activeClass, setActiveClass] = useState<string>("");

  useEffect(() => {
    if (classes.length && !activeClass) {
      setActiveClass(classes[0]!);
    }
  }, [classes]);

  const filtered = students.filter((s) => {
    const cls = s.className || `${s.grade}${s.section || ""}`;
    if (activeClass && cls !== activeClass) return false;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return `${name} ${s.rollNo || ""} ${cls}`.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {classes.length > 0 && (
          <Tabs value={activeClass} onValueChange={setActiveClass}>
            <TabsList>
              {classes.map((c) => (
                <TabsTrigger key={c} value={c}>
                  Class {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students…"
            className="h-9 pl-8"
          />
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Avg score</TableHead>
                <TableHead className="text-right">Tests</TableHead>
                <TableHead>Strong</TableHead>
                <TableHead>Weak</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id || s._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-soft text-[10px] text-accent-foreground">
                          {initials(s.firstName, s.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{s.rollNo || ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {s.className || `${s.grade}${s.section || ""}`}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {s.avgScore || 0}%
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {s.testsTaken || 0}
                  </TableCell>
                  <TableCell className="text-xs text-success">{s.strongSubject || "—"}</TableCell>
                  <TableCell className="text-xs text-destructive">{s.weakSubject || "—"}</TableCell>
                  <TableCell
                    className={`text-right text-xs font-medium tabular-nums ${(s.trend || 0) >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {(s.trend || 0) >= 0 ? "+" : ""}
                    {s.trend || 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
