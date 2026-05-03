import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  _id?: string;
  title: string;
  subject: string;
  chapter?: string;
  questionCount: number;
  difficulty: string;
  targetLabel?: string;
  className?: string;
  dueDate: string;
  submittedCount?: number;
  submitted?: number;
  totalCount?: number;
  totalStudents?: number;
  averageScore?: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  Assigned: "bg-primary-soft text-accent-foreground",
  "In progress": "bg-warning/20 text-warning-foreground",
  Completed: "bg-success/15 text-success",
  Overdue: "bg-destructive/15 text-destructive",
};

export function AssignmentTable({ assignments }: { assignments: Assignment[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Avg score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((a) => {
              const submitted = a.submitted ?? a.submittedCount ?? 0;
              const total = a.totalStudents ?? a.totalCount ?? 0;
              const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
              return (
                <TableRow key={a.id || a._id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.subject} · {a.chapter || "Mixed"} · {a.questionCount} Qs · {a.difficulty}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{a.targetLabel || a.className || "Class"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 w-20" />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {submitted}/{total}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {submitted > 0 ? `${a.averageScore}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${statusStyles[a.status] ?? ""}`}>
                      {a.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
