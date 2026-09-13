import { PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

const input = {
  name: "Midnight Squad Clash",
  creatorName: "ShadowStrike",
  game: { freeFire: null },
  mode: { loneWolf: null },
  map: "Bermuda",
  roomId: "B002345687",
  roomPassword: "secret",
  maxPlayers: 4n,
  entryFee: 25n,
};

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listTournaments()).resolves.toEqual([]);
});

it("round-trips a tournament through the real canister", async () => {
  const created = await actor.createTournament(input);
  expect(created).toMatchObject({
    name: "Midnight Squad Clash",
    creatorName: "ShadowStrike",
    game: { freeFire: null },
    mode: { loneWolf: null },
    map: "Bermuda",
    roomId: "B002345687",
    roomPassword: "secret",
    maxPlayers: 4n,
    currentPlayers: 0n,
    status: { open: null },
    entryFee: 25n,
  });
  expect(created.players).toEqual([]);

  const list = await actor.listTournaments();
  expect(list).toHaveLength(1);
  expect(list[0]).toMatchObject({ id: created.id, name: "Midnight Squad Clash" });

  const fetched = await actor.getTournament(created.id);
  expect(fetched).toEqual([created]);
});

it("returns null for a missing tournament", async () => {
  await expect(actor.getTournament(999n)).resolves.toEqual([]);
});

it("joins a tournament by in-game name and increments the player count", async () => {
  const created = await actor.createTournament(input);
  const joined = await actor.joinTournament(created.id, "BlazeRider");
  expect(joined.currentPlayers).toBe(1n);
  expect(joined.players).toEqual(["BlazeRider"]);
  expect(joined.status).toEqual({ open: null });
});

it("marks a tournament full when slots fill", async () => {
  const created = await actor.createTournament({ ...input, maxPlayers: 1n });
  const joined = await actor.joinTournament(created.id, "SoloKing");
  expect(joined.currentPlayers).toBe(1n);
  expect(joined.status).toEqual({ full: null });
});

it("rejects joining a full tournament", async () => {
  const created = await actor.createTournament({ ...input, maxPlayers: 1n });
  await actor.joinTournament(created.id, "SoloKing");
  await expect(
    actor.joinTournament(created.id, "Latecomer"),
  ).rejects.toThrow();
});

it("lets the creator update their own tournament", async () => {
  const created = await actor.createTournament(input);
  const updated = await actor.updateTournament(created.id, "ShadowStrike", {
    ...input,
    name: "Renamed Clash",
    map: "Purgatory",
    maxPlayers: 8n,
  });
  expect(updated.name).toBe("Renamed Clash");
  expect(updated.map).toBe("Purgatory");
  expect(updated.maxPlayers).toBe(8n);
});

it("rejects an update from a non-creator", async () => {
  const created = await actor.createTournament(input);
  await expect(
    actor.updateTournament(created.id, "Imposter", input),
  ).rejects.toThrow();
});

it("lets the creator delete their own tournament", async () => {
  const created = await actor.createTournament(input);
  await expect(actor.deleteTournament(created.id, "ShadowStrike")).resolves.toBe(true);
  await expect(actor.getTournament(created.id)).resolves.toEqual([]);
});

it("rejects a delete from a non-creator", async () => {
  const created = await actor.createTournament(input);
  await expect(
    actor.deleteTournament(created.id, "Imposter"),
  ).rejects.toThrow();
});

it("returns false when deleting a missing tournament", async () => {
  await expect(actor.deleteTournament(999n, "ShadowStrike")).resolves.toBe(false);
});
