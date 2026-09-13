import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface TournamentInput {
    map: string;
    game: Game;
    mode: Mode;
    name: string;
    creatorName: string;
    roomPassword: string;
    entryFee: bigint;
    roomId: string;
    maxPlayers: bigint;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Tournament {
    id: bigint;
    map: string;
    status: Status;
    game: Game;
    mode: Mode;
    name: string;
    createdAt: Timestamp;
    creatorName: string;
    roomPassword: string;
    players: Array<string>;
    currentPlayers: bigint;
    entryFee: bigint;
    roomId: string;
    maxPlayers: bigint;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export enum Game {
    freeFire = "freeFire",
    brCs = "brCs"
}
export enum Mode {
    loneWolf = "loneWolf"
}
export enum Status {
    closed = "closed",
    full = "full",
    open = "open"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTournament(input: TournamentInput): Promise<Tournament>;
    deleteTournament(id: bigint, creatorName: string): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getTournament(id: bigint): Promise<Tournament | null>;
    isCallerAdmin(): Promise<boolean>;
    joinTournament(id: bigint, playerName: string): Promise<Tournament>;
    listTournaments(): Promise<Array<Tournament>>;
    schema(): Promise<string>;
    updateTournament(id: bigint, creatorName: string, input: TournamentInput): Promise<Tournament>;
}
