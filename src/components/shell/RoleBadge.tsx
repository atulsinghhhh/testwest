import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const styles: Record<Role, string> = {
  STUDENT: "bg-accent text-accent-foreground",
  PARENT: "bg-primary-soft text-accent-foreground",
  SCHOOL: "bg-primary text-primary-foreground",
  ADMIN: "bg-muted text-muted-foreground",
  TEACHER: "bg-success/15 text-success",
  SOLO: "bg-warning/20 text-warning-foreground",
};

const labels: Record<Role, string> = {
  STUDENT: "Student",
  PARENT: "Parent",
  SCHOOL: "School",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  SOLO: "Solo learner",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[role],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {labels[role]}
    </span>
  );
}
