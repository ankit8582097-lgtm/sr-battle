import { Game } from "@/backend";
import { GameBadge } from "@/components/GameBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteTournament,
  useGetTournament,
  useJoinTournament,
  useUpdateTournament,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { MODE_LABELS, timestampToDate } from "@/types";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Coins,
  Copy,
  Hash,
  Lock,
  MapPin,
  Pencil,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

const GAME_OPTIONS: Array<{ value: Game; label: string }> = [
  { value: Game.freeFire, label: "Free Fire" },
  { value: Game.brCs, label: "BR CS" },
];

export default function TournamentDetail() {
  const { id } = useParams({ from: "/tournaments/$id" });
  const navigate = useNavigate();
  const tournamentId = BigInt(id);
  const { data: tournament, isLoading } = useGetTournament(tournamentId);
  const joinTournament = useJoinTournament();
  const updateTournament = useUpdateTournament();
  const deleteTournament = useDeleteTournament();
  const [playerName, setPlayerName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Edit form state
  const [name, setName] = useState("");
  const [game, setGame] = useState<Game>(Game.freeFire);
  const [map, setMap] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");

  function openEdit() {
    if (!tournament) return;
    setName(tournament.name);
    setGame(tournament.game);
    setMap(tournament.map);
    setRoomId(tournament.roomId);
    setRoomPassword(tournament.roomPassword);
    setMaxPlayers(tournament.maxPlayers.toString());
    setEditOpen(true);
  }

  function handleCopy() {
    if (!tournament) return;
    void navigator.clipboard.writeText(tournament.roomId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!tournament || playerName.trim() === "") return;
    joinTournament.mutate(
      { id: tournament.id, playerName: playerName.trim() },
      {
        onSuccess: () => setPlayerName(""),
      },
    );
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!tournament) return;
    const players = Number.parseInt(maxPlayers, 10);
    updateTournament.mutate(
      {
        id: tournament.id,
        creatorName: creatorName.trim(),
        input: {
          name: name.trim(),
          creatorName: tournament.creatorName,
          game,
          mode: tournament.mode,
          map: map.trim(),
          roomId: roomId.trim(),
          roomPassword: roomPassword.trim(),
          entryFee: tournament.entryFee,
          maxPlayers: BigInt(Number.isNaN(players) ? 0 : players),
        },
      },
      {
        onSuccess: () => setEditOpen(false),
      },
    );
  }

  function handleDelete() {
    if (!tournament) return;
    deleteTournament.mutate(
      { id: tournament.id, creatorName: creatorName.trim() },
      {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="mt-6 h-72 rounded-lg" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div
        data-ocid="error_state"
        className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Tournament not found
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          This tournament may have been removed.
        </p>
        <Button asChild className="mt-6" data-ocid="back_home_button">
          <Link to="/">Back to tournaments</Link>
        </Button>
      </div>
    );
  }

  const createdDate = timestampToDate(tournament.createdAt);
  const isCreator = creatorName.trim() === tournament.creatorName;
  const canUpdate =
    name.trim() !== "" &&
    map.trim() !== "" &&
    roomId.trim() !== "" &&
    maxPlayers.trim() !== "" &&
    !updateTournament.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          className="-ml-2"
          data-ocid="back_button"
        >
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to tournaments
          </Link>
        </Button>
        {isCreator ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openEdit}
              data-ocid="edit_button"
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  data-ocid="delete_button"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this tournament?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{tournament.name}" and its
                    room details. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteTournament.isPending}
                    data-ocid="confirm_delete_button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteTournament.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter creator name to manage"
              data-ocid="creator_name_input"
              className="w-56"
              aria-label="Creator name"
            />
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <GameBadge game={tournament.game} />
        <StatusBadge status={tournament.status} />
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {MODE_LABELS[tournament.mode]}
        </span>
      </div>

      <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground">
        {tournament.name}
      </h1>
      <p className="mb-8 flex items-center gap-2 text-base text-muted-foreground">
        <User className="h-4 w-4" />
        Hosted by {tournament.creatorName}
        {createdDate && (
          <span className="text-muted-foreground/70">
            · {createdDate.toLocaleDateString()}
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Room Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Map
              </span>
              <span className="font-semibold text-foreground">
                {tournament.map}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-accent" /> Players
              </span>
              <span className="font-mono font-semibold text-foreground">
                {tournament.currentPlayers.toString()}/
                {tournament.maxPlayers.toString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Coins className="h-4 w-4 text-primary" /> Entry fee
              </span>
              <span className="font-semibold text-primary">
                {tournament.entryFee.toString()} coins
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4 text-muted-foreground" /> Password
              </span>
              <span className="font-mono font-semibold text-foreground">
                {tournament.roomPassword ? tournament.roomPassword : "None"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-subtle">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            How to Join
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              1. Open {tournament.game === "freeFire" ? "Free Fire" : "BR CS"}{" "}
              and go to the custom room lobby.
            </p>
            <p>2. Enter the room ID below to find the room.</p>
            <p>
              3. Use the room password if one is set, then drop in and fight.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-background p-3">
            <Hash className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1 truncate font-mono text-base font-semibold text-foreground">
              {tournament.roomId}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              data-ocid="copy_room_button"
              aria-label="Copy room ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {tournament.status === "open" ? (
        <form
          onSubmit={handleJoin}
          className="mt-6 rounded-lg border border-border bg-card p-6 shadow-subtle"
        >
          <h2 className="mb-4 font-display text-lg font-bold tracking-tight text-foreground">
            Join this tournament
          </h2>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins className="h-4 w-4 text-primary" /> Payable amount
            </span>
            <span className="font-mono text-lg font-bold text-primary">
              {tournament.entryFee.toString()} coins
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="playerName">Your in-game name</Label>
              <Input
                id="playerName"
                data-ocid="player_name_input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. ShadowStrike"
              />
            </div>
            <Button
              type="submit"
              className="sm:self-end"
              disabled={playerName.trim() === "" || joinTournament.isPending}
              data-ocid="join_button"
            >
              {joinTournament.isPending ? "Joining..." : "Join Room"}
            </Button>
          </div>
          {joinTournament.isError && (
            <p
              data-ocid="error_state"
              className="mt-3 text-sm font-medium text-destructive"
            >
              Could not join. The room may be full or closed.
            </p>
          )}
        </form>
      ) : (
        <div
          data-ocid="join_unavailable_state"
          className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-card p-6 shadow-subtle"
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              {tournament.status === "full"
                ? "This tournament is full"
                : "This tournament is closed"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tournament.status === "full"
                ? `All ${tournament.maxPlayers.toString()} slots are taken. Check back for the next battle.`
                : "Joining is no longer available for this tournament."}
            </p>
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit tournament</DialogTitle>
            <DialogDescription>
              Update the room details for this tournament.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="editName">Tournament name</Label>
              <Input
                id="editName"
                data-ocid="edit_name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Squad Clash"
              />
            </div>

            <div className="space-y-2">
              <Label>Game</Label>
              <Select
                value={game}
                onValueChange={(value) => setGame(value as Game)}
              >
                <SelectTrigger data-ocid="edit_game_select">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {GAME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editMap">Map</Label>
              <Input
                id="editMap"
                data-ocid="edit_map_input"
                value={map}
                onChange={(e) => setMap(e.target.value)}
                placeholder="e.g. Bermuda, Purgatory, Erangel"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editRoomId">Room ID</Label>
                <Input
                  id="editRoomId"
                  data-ocid="edit_room_id_input"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. B002345687"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoomPassword">Room password</Label>
                <Input
                  id="editRoomPassword"
                  data-ocid="edit_room_password_input"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editMaxPlayers">Max players</Label>
              <Input
                id="editMaxPlayers"
                data-ocid="edit_max_players_input"
                type="number"
                min={1}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="font-mono"
              />
            </div>

            {updateTournament.isError && (
              <p
                data-ocid="error_state"
                className="text-sm font-medium text-destructive"
              >
                Failed to update the tournament. Please try again.
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canUpdate}
                data-ocid="save_edit_button"
                className={cn(
                  game === "freeFire"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-accent text-accent-foreground hover:bg-accent/90",
                )}
              >
                {updateTournament.isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
