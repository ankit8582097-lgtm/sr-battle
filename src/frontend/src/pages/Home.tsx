import { Game, Status } from "@/backend";
import { TournamentCard } from "@/components/TournamentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTournaments } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/types";
import { Link } from "@tanstack/react-router";
import { Plus, Search, Swords } from "lucide-react";
import { useMemo, useState } from "react";

const GAME_FILTERS: Array<{ value: Game | "all"; label: string }> = [
  { value: "all", label: "All Games" },
  { value: Game.freeFire, label: "Free Fire" },
  { value: Game.brCs, label: "BR CS" },
];

const STATUS_FILTERS: Array<{ value: Status | "all"; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: Status.open, label: STATUS_LABELS[Status.open] },
  { value: Status.full, label: STATUS_LABELS[Status.full] },
  { value: Status.closed, label: STATUS_LABELS[Status.closed] },
];

export default function Home() {
  const { data: tournaments, isLoading } = useListTournaments();
  const [gameFilter, setGameFilter] = useState<Game | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = tournaments ?? [];
    return list.filter((t) => {
      const matchesGame = gameFilter === "all" || t.game === gameFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesSearch =
        search.trim() === "" ||
        t.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesGame && matchesStatus && matchesSearch;
    });
  }, [tournaments, gameFilter, statusFilter, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
          Lone Wolf Custom Rooms
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Tournament <span className="text-gradient-ember">Arena</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Discover and join Free Fire and BR CS lone-wolf custom-room
          tournaments. Pick your game, grab a room ID, and drop in.
        </p>
      </section>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {GAME_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              data-ocid={`game_filter_${filter.value}`}
              onClick={() => setGameFilter(filter.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-smooth",
                gameFilter === filter.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Status | "all")}
          >
            <SelectTrigger
              data-ocid="status_filter"
              className="w-full sm:w-44"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-ocid="search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="empty_state"
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-20 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Swords className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            No tournaments found
          </h2>
          <p className="mt-2 max-w-md text-base text-muted-foreground">
            {tournaments && tournaments.length === 0
              ? "There are no tournaments yet. Create the first one and start the battle."
              : "No tournaments match your current filters. Try a different game or search term."}
          </p>
          <Button asChild className="mt-6" data-ocid="empty_create_button">
            <Link to="/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Tournament
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tournament) => (
            <TournamentCard
              key={tournament.id.toString()}
              tournament={tournament}
            />
          ))}
        </div>
      )}
    </div>
  );
}
