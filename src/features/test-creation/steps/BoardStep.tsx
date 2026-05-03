import { useMemo } from "react";
import { OptionCard } from "../components/OptionCard";
import { useBoards } from "@/lib/api/hooks";
import type { Board } from "@/types";
import { Loader2 } from "lucide-react";

import { ALL_BOARDS } from "@/lib/constants";

interface Props {
  value: Board | null;
  onChange: (b: Board) => void;
}

const descriptions: Record<string, string> = {
  CBSE: "Central Board of Secondary Education",
  ICSE: "Indian Certificate of Secondary Education",
  State: "State board curriculum",
  IB: "International Baccalaureate",
};

export function BoardStep({ value, onChange }: Props) {
  const { data: boardsResult, isLoading } = useBoards();

  // Merge static ALL_BOARDS with dynamic results from DB, keeping them unique
  const boards = useMemo(() => {
    const dbBoards = boardsResult || [];
    const combined = [...new Set([...ALL_BOARDS, ...dbBoards])];
    return combined;
  }, [boardsResult]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(boards || []).map((b) => (
        <OptionCard
          key={b}
          title={b}
          subtitle={descriptions[b] || "Standard curriculum"}
          selected={value === b}
          onClick={() => onChange(b as Board)}
        />
      ))}
    </div>
  );
}
