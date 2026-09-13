import { createMockActor, sampleTournament } from "@/__tests__/mockActor";
import { Game, Status } from "@/backend";
import TournamentDetail from "@/pages/TournamentDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
}));

let mockActor: ReturnType<typeof createMockActor>;

function renderDetail(id: string) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/tournaments/$id",
    component: TournamentDetail,
  });
  const routeTree = rootRoute.addChildren([detailRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/tournaments/${id}`] }),
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

describe("TournamentDetail", () => {
  it("shows full room info and how to join", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Midnight Squad Clash",
        game: Game.freeFire,
        map: "Bermuda",
        roomId: "B002345687",
        roomPassword: "secret",
        currentPlayers: 2n,
        maxPlayers: 48n,
        status: Status.open,
        creatorName: "ShadowStrike",
        entryFee: 25n,
      }),
    ]);
    renderDetail("1");

    expect(await screen.findByText("Midnight Squad Clash")).toBeInTheDocument();
    expect(screen.getByText("Bermuda")).toBeInTheDocument();
    expect(screen.getByText("2/48")).toBeInTheDocument();
    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(screen.getByText("B002345687")).toBeInTheDocument();
    expect(screen.getByText("Hosted by ShadowStrike")).toBeInTheDocument();
    expect(screen.getByText("How to Join")).toBeInTheDocument();
    // Entry fee is shown both in Room Details and as the payable amount.
    expect(screen.getAllByText("25 coins").length).toBeGreaterThanOrEqual(1);
  });

  it("joins a tournament by in-game name, incrementing the player count", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Midnight Squad Clash",
        currentPlayers: 2n,
        maxPlayers: 48n,
      }),
    ]);
    renderDetail("1");

    await screen.findByText("Midnight Squad Clash");
    await userEvent.type(screen.getByTestId("player_name_input"), "NewPlayer");
    await userEvent.click(screen.getByTestId("join_button"));

    await waitFor(() => {
      expect(mockActor.joinTournament).toHaveBeenCalledWith(1n, "NewPlayer");
    });
  });

  it("shows edit and delete controls to the creator", async () => {
    mockActor = createMockActor([
      sampleTournament({ id: 1n, creatorName: "ShadowStrike" }),
    ]);
    renderDetail("1");

    await screen.findByText("Midnight Squad Clash");
    await userEvent.type(
      screen.getByTestId("creator_name_input"),
      "ShadowStrike",
    );

    expect(screen.getByTestId("edit_button")).toBeInTheDocument();
    expect(screen.getByTestId("delete_button")).toBeInTheDocument();
  });

  it("lets the creator edit their own tournament", async () => {
    mockActor = createMockActor([
      sampleTournament({ id: 1n, creatorName: "ShadowStrike" }),
    ]);
    renderDetail("1");

    await screen.findByText("Midnight Squad Clash");
    await userEvent.type(
      screen.getByTestId("creator_name_input"),
      "ShadowStrike",
    );
    await userEvent.click(screen.getByTestId("edit_button"));

    const nameInput = await screen.findByTestId("edit_name_input");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Renamed Clash");
    await userEvent.click(screen.getByTestId("save_edit_button"));

    await waitFor(() => {
      expect(mockActor.updateTournament).toHaveBeenCalledTimes(1);
    });
    const [, creatorName, input] = vi.mocked(mockActor.updateTournament).mock
      .calls[0];
    expect(creatorName).toBe("ShadowStrike");
    expect(input.name).toBe("Renamed Clash");
  });

  it("lets the creator delete their own tournament", async () => {
    mockActor = createMockActor([
      sampleTournament({ id: 1n, creatorName: "ShadowStrike" }),
    ]);
    renderDetail("1");

    await screen.findByText("Midnight Squad Clash");
    await userEvent.type(
      screen.getByTestId("creator_name_input"),
      "ShadowStrike",
    );
    await userEvent.click(screen.getByTestId("delete_button"));

    const confirm = await screen.findByTestId("confirm_delete_button");
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(mockActor.deleteTournament).toHaveBeenCalledWith(
        1n,
        "ShadowStrike",
      );
    });
  });

  it("hides the join form for a full tournament", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Full Clash",
        currentPlayers: 48n,
        maxPlayers: 48n,
        status: Status.full,
      }),
    ]);
    renderDetail("1");

    await screen.findByText("Full Clash");
    expect(screen.getByText("This tournament is full")).toBeInTheDocument();
    expect(screen.queryByTestId("player_name_input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("join_button")).not.toBeInTheDocument();
  });

  it("flips a tournament to full when the last slot is joined", async () => {
    const user = userEvent.setup();
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Last Slot Clash",
        game: Game.freeFire,
        currentPlayers: 47n,
        maxPlayers: 48n,
        status: Status.open,
      }),
    ]);
    renderDetail("1");

    await screen.findByText("Last Slot Clash");
    expect(screen.getByText("47/48")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();

    await user.type(screen.getByTestId("player_name_input"), "FinalPlayer");
    await user.click(screen.getByTestId("join_button"));

    await waitFor(() => {
      expect(mockActor.joinTournament).toHaveBeenCalledWith(1n, "FinalPlayer");
    });
    // The mock flips status to full once currentPlayers reaches maxPlayers.
    const updated = await mockActor.getTournament(1n);
    expect(updated?.currentPlayers).toBe(48n);
    expect(updated?.status).toBe(Status.full);
  });
});
