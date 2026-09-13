import type { Status } from "@/backend";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/types";

const STATUS_STYLES: Record<Status, string> = {
  open: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  full: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  closed: "bg-destructive/15 text-destructive border-destructive/30",
};

const STATUS_DOT: Record<Status, string> = {
  open: "bg-emerald-400",
  full: "bg-amber-400",
  closed: "bg-destructive",
};

export function StatusBadge({
  status,
  className,
}: { status: Status; className?: string }) {
  return (
    <span
      data-ocid="status_badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          STATUS_DOT[status],
          status === "open" && "animate-pulse-glow",
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
