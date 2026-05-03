import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Leaf,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useMemo } from "react";
import { OptionCard } from "../components/OptionCard";
import { ALL_SUBJECTS } from "@/lib/constants";
import { useSubjects } from "@/lib/api/hooks";
import type { Board, Subject } from "@/types";

interface Props {
  board: Board;
  grade: number;
  value: string | null;
  onChange: (s: string) => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mathematics: Calculator,
  Science: Leaf,
  English: BookOpen,
  "Social Studies": Globe2,
  Hindi: Languages,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Sparkles,
};

export function SubjectStep({ board, grade, value, onChange }: Props) {
  const { data: subjectsResult, isLoading } = useSubjects(board, grade);
  
  // Merge API results with our global list for maximum flexibility, especially for AI generation
  const subjects = useMemo(() => {
    const fromApi = subjectsResult || [];
    const all = Array.from(new Set([...fromApi, ...ALL_SUBJECTS]));
    return all;
  }, [subjectsResult]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {(subjects || []).map((s: string) => {
        const Icon = ICONS[s as Subject] ?? BookOpen;
        return (
          <OptionCard
            key={s}
            title={s}
            subtitle="Practice questions available"
            selected={value === s}
            onClick={() => onChange(s)}
            icon={<Icon className="h-4 w-4" />}
          />
        );
      })}
    </div>
  );
}
