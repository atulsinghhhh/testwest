import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TestAttempt } from "@/types";

interface RecentTestsTableProps {
  title?: string;
  subtitle?: string;
  tests: TestAttempt[];
  className?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function scoreClass(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-foreground";
  return "text-destructive";
}

export function RecentTestsTable({
  title = "Recent attempts",
  subtitle,
  tests,
  className,
}: RecentTestsTableProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="p-5 pb-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Subject</TableHead>
              <TableHead>Chapter / Topic</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="pl-5 font-medium">{t.subject}</TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="text-foreground">{t.chapter}</span>
                  <span className="mx-1.5">·</span>
                  {t.topic}
                </TableCell>
                <TableCell
                  className={cn("text-right font-semibold tabular-nums", scoreClass(t.score))}
                >
                  {t.score}%
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {t.accuracy}%
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                <TableCell className="pr-5">
                  <Badge variant="secondary" className="font-normal">
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
