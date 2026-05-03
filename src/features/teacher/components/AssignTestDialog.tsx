import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  useUser,
  useTeacherStudents,
  useBoards,
  useGrades,
  useSubjects,
} from "@/lib/api/hooks";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Mode = "class" | "students" | "group";

export function AssignTestDialog({ open, onOpenChange }: Props) {
  const { data: user } = useUser();
  const profileId = user?.profile?._id || "";
  const { data: myStudents = [] } = useTeacherStudents(profileId);
  
  const [mode, setMode] = useState<Mode>("class");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [questionCount, setQuestionCount] = useState("10");
  const [difficulty, setDifficulty] = useState("Medium");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  );
  
  // Teachers usually have classes assigned in their profile
  const teacherClasses = useMemo(() => {
    return user?.profile?.classes || [];
  }, [user]);

  const [classIds, setClassIds] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [studentQuery, setStudentQuery] = useState("");

  // For now, let's assume we don't have custom groups in the backend yet or they are part of the profile
  const customGroups = useMemo(() => user?.profile?.customGroups || [], [user]);

  useEffect(() => {
    if (user?.profile?.subjects?.length && !subject) {
      setSubject(user.profile.subjects[0]);
    }
    if (teacherClasses.length && !classIds.length) {
      setClassIds([teacherClasses[0]._id || teacherClasses[0].id]);
    }
  }, [user, teacherClasses]);

  const targetCount = useMemo(() => {
    if (mode === "class") {
      // In real scenario, we might need to count students in selected classes
      // For now, let's approximate or just show selected classes count if we don't have student-to-class mapping here
      return myStudents.filter((s: any) => classIds.includes(s.classId || s.className)).length;
    }
    if (mode === "students") return studentIds.length;
    const group = customGroups.find((g: any) => (g.id || g._id) === groupId);
    return group?.studentIds?.length ?? 0;
  }, [mode, classIds, studentIds, groupId, myStudents, customGroups]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.toLowerCase();
    return myStudents.filter((s: any) =>
      `${s.firstName} ${s.lastName} ${s.rollNo || ""}`.toLowerCase().includes(q),
    );
  }, [myStudents, studentQuery]);

  function reset() {
    setTitle("");
    setChapter("");
    setQuestionCount("10");
    setDifficulty("Medium");
    setMode("class");
    if (teacherClasses.length) {
      setClassIds([teacherClasses[0]._id || teacherClasses[0].id]);
    } else {
      setClassIds([]);
    }
    setStudentIds([]);
  }

  function handleAssign() {
    if (!title.trim()) {
      toast.error("Please enter a test title");
      return;
    }
    if (targetCount === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    let label = "";
    if (mode === "class") label = `${classIds.length} class${classIds.length > 1 ? "es" : ""}`;
    else if (mode === "students") label = `${studentIds.length} student${studentIds.length > 1 ? "s" : ""}`;
    else {
      const group = customGroups.find((g: any) => (g.id || g._id) === groupId);
      label = group?.name ?? "group";
    }

    toast.success("Test assigned", {
      description: `"${title}" sent to ${label} (${targetCount} student${targetCount > 1 ? "s" : ""}).`,
    });
    onOpenChange(false);
    reset();
  }

  function toggle<T>(value: T, list: T[], set: (v: T[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assign a new test
          </DialogTitle>
          <DialogDescription>
            Configure the test and choose who should receive it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Test title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Algebra Practice Set 4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as typeof subject)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {user?.profile?.subjects?.map((s: string) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Chapter</Label>
              <Input
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g., Algebra"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Questions</Label>
              <Input
                type="number"
                min="1"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Assign to</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList className="w-full">
                <TabsTrigger value="class" className="flex-1">Class</TabsTrigger>
                <TabsTrigger value="students" className="flex-1">Individual students</TabsTrigger>
                <TabsTrigger value="group" className="flex-1">Custom group</TabsTrigger>
              </TabsList>

              <TabsContent value="class" className="mt-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {teacherClasses.map((c: any) => (
                    <label
                      key={c._id || c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={classIds.includes(c._id || c.id)}
                        onCheckedChange={() => toggle(c._id || c.id, classIds, setClassIds)}
                      />
                      <span className="text-sm font-medium">Class {c.name || c._id || c.id}</span>
                    </label>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="students" className="mt-3 space-y-2">
                <Input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search students…"
                  className="h-9"
                />
                <ScrollArea className="h-56 rounded-lg border">
                  <div className="divide-y">
                    {filteredStudents.map((s) => (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center justify-between gap-3 p-2.5 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={studentIds.includes(s._id || s.id)}
                            onCheckedChange={() => toggle(s._id || s.id, studentIds, setStudentIds)}
                          />
                          <div>
                            <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-muted-foreground">{s.rollNo || ""} · Class {s.className || ""}</p>
                          </div>
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{s.avgScore || 0}%</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="group" className="mt-3 space-y-2">
                {customGroups.map((g: any) => (
                  <label
                    key={g._id || g.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 ${groupId === (g._id || g.id) ? "border-primary bg-primary-soft/30" : ""}`}
                  >
                    <input
                      type="radio"
                      name="group"
                      checked={groupId === (g._id || g.id)}
                      onChange={() => setGroupId(g._id || g.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{g.name}</p>
                        <Badge variant="secondary" className="shrink-0">{g.studentIds.length} students</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.description}</p>
                    </div>
                  </label>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="font-medium">{targetCount}</span>{" "}
            <span className="text-muted-foreground">student{targetCount === 1 ? "" : "s"} will receive this test.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign}>Assign test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
