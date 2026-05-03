import { OptionCard } from "../components/OptionCard";
import { useSubtopics } from "@/lib/api/hooks";
import type { Board } from "@/types";
import { Loader2 } from "lucide-react";

interface Props {
  board: Board;
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  value: string | null;
  onChange: (s: string | null) => void;
}

export function SubtopicStep({ chapter, topic, value, onChange }: Props) {
  const { data: subtopics, isLoading } = useSubtopics(chapter, topic);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <OptionCard
        title="All subtopics"
        subtitle="Cover the full topic, no narrowing"
        selected={value === null}
        onClick={() => onChange(null)}
      />
      {subtopics && subtopics.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subtopics.map((st) => (
            <OptionCard
              key={st}
              title={st}
              selected={value === st}
              onClick={() => onChange(st)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
