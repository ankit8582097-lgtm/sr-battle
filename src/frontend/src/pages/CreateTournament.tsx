import { Game, Mode } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTournament } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

const GAME_OPTIONS: Array<{ value: Game; label: string }> = [
  { value: Game.freeFire, label: "Free Fire" },
  { value: Game.brCs, label: "BR CS" },
];

export default function CreateTournament() {
  const navigate = useNavigate();
  const createTournament = useCreateTournament();

  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [game, setGame] = useState<Game>(Game.freeFire);
  const [map, setMap] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("48");
  const [entryFee, setEntryFee] = useState("0");

  const entryFeeValue = Number.parseInt(entryFee, 10);
  const entryFeeValid = entryFee.trim() !== "" && entryFeeValue >= 0;

  const canSubmit =
    name.trim() !== "" &&
    creatorName.trim() !== "" &&
    map.trim() !== "" &&
    roomId.trim() !== "" &&
    maxPlayers.trim() !== "" &&
    entryFeeValid &&
    !createTournament.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const players = Number.parseInt(maxPlayers, 10);
    const captured = {
      name: name.trim(),
      creatorName: creatorName.trim(),
      game,
      mode: Mode.loneWolf,
      map: map.trim(),
      roomId: roomId.trim(),
      roomPassword: roomPassword.trim(),
      maxPlayers: BigInt(Number.isNaN(players) ? 0 : players),
      entryFee: BigInt(Number.isNaN(entryFeeValue) ? 0 : entryFeeValue),
    };
    createTournament.mutate(captured, {
      onSuccess: (tournament) => {
        navigate({
          to: "/tournaments/$id",
          params: { id: String(tournament.id) },
        });
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Button
        asChild
        variant="ghost"
        className="mb-6 -ml-2"
        data-ocid="back_button"
      >
        <a href="/">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to tournaments
        </a>
      </Button>

      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
        New Custom Room
      </p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight text-foreground">
        Create Tournament
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-subtle sm:p-8"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Tournament name</Label>
          <Input
            id="name"
            data-ocid="name_input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Midnight Squad Clash"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creatorName">Your in-game name</Label>
          <Input
            id="creatorName"
            data-ocid="creator_name_input"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="e.g. ShadowStrike"
          />
        </div>

        <div className="space-y-2">
          <Label>Game</Label>
          <div className="grid grid-cols-2 gap-3">
            {GAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                data-ocid={`game_option_${option.value}`}
                onClick={() => setGame(option.value)}
                className={cn(
                  "rounded-md border px-4 py-3 text-sm font-semibold transition-smooth",
                  game === option.value
                    ? option.value === "freeFire"
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-accent bg-accent/15 text-accent"
                    : "border-border bg-background text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="map">Map</Label>
          <Input
            id="map"
            data-ocid="map_input"
            value={map}
            onChange={(e) => setMap(e.target.value)}
            placeholder="e.g. Bermuda, Purgatory, Erangel"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              data-ocid="room_id_input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. B002345687"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomPassword">Room password</Label>
            <Input
              id="roomPassword"
              data-ocid="room_password_input"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max players</Label>
            <Input
              id="maxPlayers"
              data-ocid="max_players_input"
              type="number"
              min={1}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryFee">Entry fee</Label>
            <Input
              id="entryFee"
              data-ocid="entry_fee_input"
              type="number"
              min={0}
              step={1}
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="font-mono"
              placeholder="0 = free"
            />
            <p className="text-xs text-muted-foreground">
              Set 0 for a free tournament.
            </p>
          </div>
        </div>

        {createTournament.isError && (
          <p
            data-ocid="error_state"
            className="text-sm font-medium text-destructive"
          >
            Failed to create the tournament. Please try again.
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit}
          data-ocid="submit_button"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {createTournament.isPending ? "Creating..." : "Create Tournament"}
        </Button>
      </form>
    </div>
  );
}
