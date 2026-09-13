import type { Tournament, TournamentInput } from "@/backend";
import { Game, Mode, Status } from "@/backend";
import { vi } from "vitest";

export interface MockActor {
  listTournaments: () => Promise<Tournament[]>;
  getTournament: (id: bigint) => Promise<Tournament | null>;
  createTournament: (input: TournamentInput) => Promise<Tournament>;
  joinTournament: (id: bigint, playerName: string) => Promise<Tournament>;
  updateTournament: (
    id: bigint,
    creatorName: string,
    input: TournamentInput,
  ) => Promise<Tournament>;
  deleteTournament: (id: bigint, creatorName: string) => Promise<boolean>;
}

let nextId = 1n;

function makeTournament(input: TournamentInput, id: bigint): Tournament {
  return {
    id,
    name: input.name,
    game: input.game,
    mode: input.mode,
    roomId: input.roomId,
    roomPassword: input.roomPassword,
    map: input.map,
    maxPlayers: input.maxPlayers,
    entryFee: input.entryFee,
    currentPlayers: 0n,
    status: Status.open,
    creatorName: input.creatorName,
    createdAt: 1_700_000_000_000_000_000n,
    players: [],
  };
}

export function createMockActor(seed: Tournament[] = []): MockActor {
  const store = new Map<bigint, Tournament>();
  for (const t of seed) {
    store.set(t.id, t);
  }

  return {
    listTournaments: vi.fn(async () => [...store.values()]),
    getTournament: vi.fn(async (id) => store.get(id) ?? null),
    createTournament: vi.fn(async (input) => {
      const tournament = makeTournament(input, nextId);
      nextId += 1n;
      store.set(tournament.id, tournament);
      return tournament;
    }),
    joinTournament: vi.fn(async (id, playerName) => {
      const tournament = store.get(id);
      if (!tournament) throw new Error("Tournament not found");
      const currentPlayers = tournament.currentPlayers + 1n;
      const status =
        currentPlayers >= tournament.maxPlayers ? Status.full : Status.open;
      const updated: Tournament = {
        ...tournament,
        currentPlayers,
        status,
        players: [...tournament.players, playerName],
      };
      store.set(id, updated);
      return updated;
    }),
    updateTournament: vi.fn(async (id, creatorName, input) => {
      const tournament = store.get(id);
      if (!tournament) throw new Error("Tournament not found");
      if (tournament.creatorName !== creatorName) {
        throw new Error("Not authorized to update this tournament");
      }
      const updated: Tournament = {
        ...tournament,
        name: input.name,
        game: input.game,
        mode: input.mode,
        roomId: input.roomId,
        roomPassword: input.roomPassword,
        map: input.map,
        maxPlayers: input.maxPlayers,
        entryFee: input.entryFee,
        creatorName: input.creatorName,
      };
      store.set(id, updated);
      return updated;
    }),
    deleteTournament: vi.fn(async (id, creatorName) => {
      const tournament = store.get(id);
      if (!tournament) return false;
      if (tournament.creatorName !== creatorName) {
        throw new Error("Not authorized to delete this tournament");
      }
      store.delete(id);
      return true;
    }),
  };
}

export function sampleTournament(
  overrides: Partial<Tournament> = {},
): Tournament {
  return {
    id: 1n,
    name: "Midnight Squad Clash",
    game: Game.freeFire,
    mode: Mode.loneWolf,
    roomId: "B002345687",
    roomPassword: "secret",
    map: "Bermuda",
    maxPlayers: 48n,
    entryFee: 0n,
    currentPlayers: 2n,
    status: Status.open,
    creatorName: "ShadowStrike",
    createdAt: 1_700_000_000_000_000_000n,
    players: ["ShadowStrike", "BlazeRider"],
    ...overrides,
  };
}
