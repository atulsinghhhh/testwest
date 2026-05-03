import { OptionCard } from "../components/OptionCard";
import { useTopics } from "@/lib/api/hooks";
import type { Board } from "@/types";
import { Loader2 } from "lucide-react";

interface Props {
  board: Board;
  grade: number;
  subject: string;
  chapter: string;
  value: string | null;
  onChange: (t: string) => void;
}

const SAMPLE_TOPICS = ["Core principles", "Standard methodologies", "Intermediate concepts", "Global perspectives"];

export function TopicStep({ subject, chapter, value, onChange }: Props) {
  const { data: topicsResult, isLoading } = useTopics(subject, chapter);
  const topics = (topicsResult && topicsResult.length > 0) ? topicsResult : SAMPLE_TOPICS;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {topics.map((t) => (
        <OptionCard
          key={t}
          title={t}
          subtitle="Specific learning area"
          selected={value === t}
          onClick={() => onChange(t)}
        />
      ))}
    </div>
  );
}
