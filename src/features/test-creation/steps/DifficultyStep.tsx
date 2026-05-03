import { OptionCard } from "../components/OptionCard";
import { ALL_DIFFICULTIES } from "@/lib/constants";
import type { Difficulty } from "@/types";

interface Props {
  value: Difficulty | null;
  onChange: (d: Difficulty) => void;
}

const descriptions: Record<Difficulty, string> = {
  Easy: "Build confidence with foundational questions.",
  Medium: "Mixed difficulty — recommended for regular practice.",
  Hard: "Challenge yourself with deeper, applied problems.",
};

export function DifficultyStep({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ALL_DIFFICULTIES.map((d) => (
        <OptionCard
          key={d}
          title={d}
          subtitle={descriptions[d]}
          selected={value === d}
          onClick={() => onChange(d)}
        />
      ))}
    </div>
  );
}
