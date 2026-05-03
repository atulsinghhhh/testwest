import { Check, CloudUpload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved";

interface Props {
  status: SaveStatus;
  className?: string;
}

export function AutosaveIndicator({ status, className }: Props) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}
    >
      {status === "saving" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving…
        </>
      ) : status === "saved" ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" />
          Saved
        </>
      ) : (
        <>
          <CloudUpload className="h-3.5 w-3.5" />
          Autosave on
        </>
      )}
    </span>
  );
}
