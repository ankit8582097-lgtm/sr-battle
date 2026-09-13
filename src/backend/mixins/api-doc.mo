mixin () {
  public query func getApiDoc() : async Text {
    "# Tournament Backend API

## Purpose

This backend powers a tournament app for two games — **Free Fire** and **BR CS** — in
**lone wolf** (custom room) mode. Users create tournaments by selecting a game and
mode and entering room details (room ID, password, map, max players). Created
tournaments appear in a public list, players can join by entering their in-game
name, and creators can edit or delete their own tournaments. The persisted
tournament data is also queryable through the OQL Data Intelligence endpoints
(`schema` / `execute`).

## Public Methods

### Tournament management

- `createTournament(input : TournamentInput) : async Tournament`
  Creates a new tournament and returns it. The backend assigns a fresh `id` and
  sets `currentPlayers = 0`, `status = #open`, `createdAt = now`, and
  `players = []`. The `entryFee` from the input is stored on the tournament and
  represents the payable amount for joining. No authentication is required.

- `listTournaments() : async [Tournament]`
  Returns every tournament in creation order. No authentication is required.

- `getTournament(id : Nat) : async ?Tournament`
  Returns the tournament with the given `id`, or `null` when it does not exist.
  No authentication is required.

- `joinTournament(id : Nat, playerName : Text) : async Tournament`
  Adds `playerName` to the tournament's `players` list and increments
  `currentPlayers`. If the new count reaches `maxPlayers`, `status` becomes
  `#full`; otherwise it stays `#open`. When the tournament is paid
  (`entryFee > 0`), the entry fee is the payable amount the joining player owes;
  it is recorded on the tournament's `entryFee` field and returned. Traps with
  `\"Tournament not found\"` when `id` does not exist. No authentication is
  required.

- `updateTournament(id : Nat, input : TournamentInput) : async Tournament`
  Overwrites the editable fields (`name`, `game`, `mode`, `roomId`,
  `roomPassword`, `map`, `maxPlayers`, `entryFee`, `creatorName`) of the
  tournament with `id`. `id`, `currentPlayers`, `status`, `createdAt`, and
  `players` are left unchanged. Traps with `\"Tournament not found\"` when `id`
  does not exist. No authentication is required.

- `deleteTournament(id : Nat) : async Bool`
  Removes the tournament with `id`. Returns `true` if it existed and was
  removed, `false` if no such tournament existed. No authentication is required.

### Authentication (from the authorization mixin)

The backend includes the standard Caffeine authorization mixin, which exposes
the Internet Identity sign-in and role-management endpoints. The first
authenticated user to sign in automatically becomes **admin**; no token or
secret is required. Anonymous callers are treated as guests.

### Data Intelligence (OQL)

- `schema() : async Text`
  Returns the OQL schema describing the queryable `tournament` table.

- `execute(query : Text) : async Text`
  Runs an OQL query against the tournament data and returns JSON rows.

The `tournament` entity is exposed with **public** authorization
(`.public_()`): anyone, including anonymous callers, can read all rows. It is
seeded with a `.sample(...)` so the schema is discoverable even when the table
is empty.

## Authentication and Authorization

- **Anonymous callers** (guests) may call every tournament method
  (`createTournament`, `listTournaments`, `getTournament`, `joinTournament`,
  `updateTournament`, `deleteTournament`) and the OQL `schema` / `execute`
  endpoints. None of these methods perform a role check.
- **Signed-in callers** additionally gain access to the authorization mixin's
  endpoints. The first sign-in promotes the caller to `admin`.
- **Admin** is the only role that can assign roles to other users (via the
  authorization mixin's `assignRole`-style endpoint, which is admin-guarded
  internally).

There is currently **no ownership enforcement** on tournament mutation: any
caller can update or delete any tournament. The `creatorName` field is a
free-text display name, not a principal, so it is not used for authorization.

### Identity derivation

The app's frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent already holding the
user's Internet Identity authorization derives the correct per-app principal
against that origin (for example `icp identity link web <name> --app <host>`).
Such a delegation acts with the user's full authority in this app until it
expires.

## Units and Encodings

- **`id`** : `Nat` — the tournament's unique identifier, assigned sequentially
  by the backend.
- **`createdAt`** : `Int` — nanoseconds since the Unix epoch (`Time.now()`).
- **`game`** : variant — `#freeFire` or `#brCs`.
- **`mode`** : variant — `#loneWolf` (the only supported mode).
- **`status`** : variant — `#open`, `#full`, or `#closed`. `#open` and `#full`
  are produced by `joinTournament`; `#closed` is a declared status that no
  current endpoint sets.
- **`players`** : `[Text]` — the in-game names of joined players, in join order.
- **`roomId`**, **`roomPassword`**, **`map`**, **`name`**, **`creatorName`** :
  `Text` — free-text room details. `roomPassword` is the in-game room password
  and is stored and returned in plain text.
- **`maxPlayers`**, **`currentPlayers`** : `Nat` — player capacity and current
  count.
- **`entryFee`** : `Nat` — the non-negative entry fee (payable amount) for
  joining the tournament, set at creation. `0` means the tournament is free to
  join. It is displayed on cards and detail pages and returned by every
  tournament method.

## Payment Method

The `entryFee` is a non-negative integer amount set when a tournament is
created (and editable via `updateTournament`). It is displayed on tournament
cards and detail pages. When a player joins a paid tournament (`entryFee > 0`),
the entry fee is recorded as the payable amount that player owes. There is no
real payment processing: the backend only records and exposes the payable
amount; collecting payment is out of scope.

## Lifecycle and Polling

A tournament is created with `status = #open`. Each successful `joinTournament`
increments `currentPlayers`; when `currentPlayers` reaches `maxPlayers`, the
status becomes `#full`. There is no endpoint that reopens a full tournament or
sets `#closed`, so `#full` is terminal under the current API. `listTournaments`
and `getTournament` are cheap query calls and are safe to poll.

## Mutation Retry Safety

- **`createTournament`** is **not** idempotent: every call allocates a new `id`
  and inserts a new row, so retrying after a timeout creates duplicate
  tournaments. There is no client-supplied idempotency key.
- **`joinTournament`** is **not** idempotent: each call appends `playerName`
  and increments `currentPlayers`, so a retry double-counts the player. Callers
  should treat a single join as one-shot and not retry blindly.
- **`updateTournament`** is idempotent: re-applying the same input overwrites
  the same fields with the same values.
- **`deleteTournament`** is idempotent: deleting an already-deleted id returns
  `false` without error.

## Errors, Traps, and Limits

- `joinTournament` and `updateTournament` trap with `\"Tournament not found\"`
  when the `id` does not exist. A trap rolls back the whole message and reaches
  the caller as an opaque reject.
- `deleteTournament` returns `false` (not a trap) for a missing id.
- `getTournament` returns `null` (not a trap) for a missing id.
- There is no enforced cap on `maxPlayers` or on the number of tournaments;
  `joinTournament` will happily grow `currentPlayers` past `maxPlayers` if
  called repeatedly, since it only flips to `#full` when the count reaches the
  cap and does not reject further joins.
- `roomPassword` is returned in plain text to any caller; treat it as
  non-sensitive or accept that it is publicly readable.
"
  };
};
