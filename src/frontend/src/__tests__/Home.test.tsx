import { createMockActor, sampleTournament } from "@/__tests__/mockActor";
import { Game, Status } from "@/backend";
import Home from "@/pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
}));

let mockActor: ReturnType<typeof createMockActor>;

function renderHome() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
  });
  const routeTree = rootRoute.addChildren([homeRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockActor = createMockActor();
});

describe("Home tournament list", () => {
  it("shows an empty state guiding users to create the first tournament", async () => {
    renderHome();
    expect(await screen.findByText("No tournaments found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "There are no tournaments yet. Create the first one and start the battle.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("empty_create_button")).toBeInTheDocument();
  });

  it("lists active tournaments with game, mode, map, room id, player count and status", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Midnight Squad Clash",
        game: Game.freeFire,
        map: "Bermuda",
        roomId: "B002345687",
        currentPlayers: 2n,
        maxPlayers: 48n,
        status: Status.open,
        entryFee: 25n,
      }),
      sampleTournament({
        id: 2n,
        name: "Erangel Rush",
        game: Game.brCs,
        map: "Erangel",
        roomId: "C998877665",
        currentPlayers: 48n,
        maxPlayers: 48n,
        status: Status.full,
      }),
    ]);
    renderHome();

    const card1 = (await screen.findByText("Midnight Squad Clash")).closest(
      "[data-ocid='tournament_card']",
    ) as HTMLElement;
    expect(within(card1).getByText("Free Fire")).toBeInTheDocument();
    expect(within(card1).getByText("Lone Wolf")).toBeInTheDocument();
    expect(within(card1).getByText("Bermuda")).toBeInTheDocument();
    expect(within(card1).getByText("B002345687")).toBeInTheDocument();
    expect(within(card1).getByText("2/48")).toBeInTheDocument();
    expect(within(card1).getByText("Open")).toBeInTheDocument();
    expect(within(card1).getByText("25 coins")).toBeInTheDocument();

    const card2 = screen
      .getByText("Erangel Rush")
      .closest("[data-ocid='tournament_card']") as HTMLElement;
    expect(within(card2).getByText("BR CS")).toBeInTheDocument();
    expect(within(card2).getByText("Full")).toBeInTheDocument();
  });

  it("filters tournaments by game", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Free Fire Clash",
        game: Game.freeFire,
      }),
      sampleTournament({ id: 2n, name: "BR CS Rush", game: Game.brCs }),
    ]);
    renderHome();

    await screen.findByText("Free Fire Clash");
    await userEvent.click(screen.getByTestId("game_filter_brCs"));

    expect(screen.queryByText("Free Fire Clash")).not.toBeInTheDocument();
    expect(screen.getByText("BR CS Rush")).toBeInTheDocument();
  });

  it("searches tournaments by name", async () => {
    mockActor = createMockActor([
      sampleTournament({ id: 1n, name: "Midnight Squad Clash" }),
      sampleTournament({ id: 2n, name: "Sunrise Squad Rush" }),
    ]);
    renderHome();

    await screen.findByText("Midnight Squad Clash");
    await userEvent.type(screen.getByTestId("search_input"), "sunrise");

    expect(screen.queryByText("Midnight Squad Clash")).not.toBeInTheDocument();
    expect(screen.getByText("Sunrise Squad Rush")).toBeInTheDocument();
  });

  it("shows a filtered empty state when no tournaments match", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Midnight Squad Clash",
        game: Game.freeFire,
      }),
    ]);
    renderHome();

    await screen.findByText("Midnight Squad Clash");
    await userEvent.click(screen.getByTestId("game_filter_brCs"));

    expect(screen.getByText("No tournaments found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No tournaments match your current filters. Try a different game or search term.",
      ),
    ).toBeInTheDocument();
  });
});
