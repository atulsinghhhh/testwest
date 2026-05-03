import { OptionCard } from "../components/OptionCard";
import { useChapters } from "@/lib/api/hooks";
import type { Board } from "@/types";
import { Loader2 } from "lucide-react";

interface Props {
  board: Board;
  grade: number;
  subject: string;
  value: string | null;
  onChange: (c: string) => void;
}

const SAMPLE_CHAPTERS = [
  "Fundamentals",
  "Advanced Concepts",
  "Practical Applications",
  "Review & Practice",
];

export function ChapterStep({ board, grade, subject, value, onChange }: Props) {
  const { data: chaptersResult, isLoading } = useChapters(board, grade, subject);
  const chapters = chaptersResult && chaptersResult.length > 0 ? chaptersResult : SAMPLE_CHAPTERS;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {chapters.map((c) => (
        <OptionCard
          key={c}
          title={c}
          subtitle="Comprehensive coverage"
          selected={value === c}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
