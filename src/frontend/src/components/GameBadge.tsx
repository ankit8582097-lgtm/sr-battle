import type { Game } from "@/backend";
import { cn } from "@/lib/utils";
import { GAME_LABELS } from "@/types";

const GAME_STYLES: Record<Game, string> = {
  freeFire: "bg-primary/15 text-primary border-primary/30",
  brCs: "bg-accent/15 text-accent border-accent/30",
};

export function GameBadge({
  game,
  className,
}: { game: Game; className?: string }) {
  return (
    <span
      data-ocid="game_badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        GAME_STYLES[game],
        className,
      )}
    >
      {GAME_LABELS[game]}
    </span>
  );
}
