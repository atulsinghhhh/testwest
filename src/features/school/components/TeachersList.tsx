import { useState } from "react";
import { Search, Mail, Users as UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface TeachersListProps {
  teachers?: any[];
}

export function TeachersList({ teachers = [] }: TeachersListProps) {
  const [q, setQ] = useState("");

  // Format backend data to match UI expectations if necessary
  const formattedTeachers = teachers.map((t) => ({
    id: t._id || t.id,
    name: t.user ? `${t.user.firstName} ${t.user.lastName}` : t.name || "Unknown Teacher",
    email: t.user?.email || t.email || "",
    subjects: t.subjects || [],
    classIds: t.classIds || [],
    avgClassScore: t.avgClassScore || 0,
    studentsCount: t.studentsCount || 0,
  }));

  const filtered = formattedTeachers.filter((t) =>
    `${t.name} ${t.email} ${t.subjects.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teachers, subjects, classes…"
          className="h-9 pl-8"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary-soft text-sm text-accent-foreground">
                    {initials(t.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {t.email}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                  {t.avgClassScore}%
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.subjects.map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Classes:{" "}
                  <span className="font-medium text-foreground">{t.classIds.join(", ")}</span>
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="h-3 w-3" />
                  {t.studentsCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
