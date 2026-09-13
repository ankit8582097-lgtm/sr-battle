import type { Game, Mode, Status, Tournament } from "@/backend";

export type { Game, Mode, Status, Tournament };

export const GAME_LABELS: Record<Game, string> = {
  freeFire: "Free Fire",
  brCs: "BR CS",
};

export const MODE_LABELS: Record<Mode, string> = {
  loneWolf: "Lone Wolf",
};

export const STATUS_LABELS: Record<Status, string> = {
  open: "Open",
  full: "Full",
  closed: "Closed",
};

export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}
