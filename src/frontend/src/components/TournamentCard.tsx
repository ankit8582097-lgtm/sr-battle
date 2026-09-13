import type { Tournament } from "@/backend";
import { GameBadge } from "@/components/GameBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { MODE_LABELS } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Hash, MapPin, Users } from "lucide-react";

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Link
      to="/tournaments/$id"
      params={{ id: String(tournament.id) }}
      data-ocid="tournament_card"
      className="group flex flex-col rounded-lg border border-border bg-card p-6 shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-elevated"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <GameBadge game={tournament.game} />
        <StatusBadge status={tournament.status} />
      </div>

      <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
        {tournament.name}
      </h3>
      <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {MODE_LABELS[tournament.mode]}
      </p>

      <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="truncate">{tournament.map}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-accent" />
          <span className="font-mono">{tournament.roomId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">
            {tournament.currentPlayers.toString()}/
            {tournament.maxPlayers.toString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">
            {tournament.entryFee.toString()} coins
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">
        View details
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
