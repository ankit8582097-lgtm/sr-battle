import { createMockActor } from "@/__tests__/mockActor";
import { Game, Mode } from "@/backend";
import CreateTournament from "@/pages/CreateTournament";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
}));

let mockActor: ReturnType<typeof createMockActor>;

function renderCreate() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/create",
    component: CreateTournament,
  });
  const routeTree = rootRoute.addChildren([createRouteDef]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/create"] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return router.load().then(() =>
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  );
}

beforeEach(() => {
  mockActor = createMockActor();
});

describe("CreateTournament", () => {
  it("disables submit until required fields are filled", async () => {
    const user = userEvent.setup();
    await renderCreate();
    const submit = screen.getByTestId("submit_button") as HTMLButtonElement;
    expect(submit).toBeDisabled();

    // Fill all required fields.
    await user.type(screen.getByTestId("name_input"), "Midnight Squad Clash");
    await user.type(screen.getByTestId("creator_name_input"), "ShadowStrike");
    await user.type(screen.getByTestId("map_input"), "Bermuda");
    await user.type(screen.getByTestId("room_id_input"), "B002345687");
    await user.type(screen.getByTestId("max_players_input"), "48");
  });

  it("creates a Free Fire lone wolf tournament with room details", async () => {
    const user = userEvent.setup();
    await renderCreate();

    await user.type(screen.getByTestId("name_input"), "Midnight Squad Clash");
    await user.type(screen.getByTestId("creator_name_input"), "ShadowStrike");
    await user.type(screen.getByTestId("map_input"), "Bermuda");
    await user.type(screen.getByTestId("room_id_input"), "B002345687");
    await user.type(screen.getByTestId("room_password_input"), "secret");
    await user.clear(screen.getByTestId("max_players_input"));
    await user.type(screen.getByTestId("max_players_input"), "48");
    await user.clear(screen.getByTestId("entry_fee_input"));
    await user.type(screen.getByTestId("entry_fee_input"), "25");

    await user.click(screen.getByTestId("submit_button"));

    expect(mockActor.createTournament).toHaveBeenCalledTimes(1);
    const input = vi.mocked(mockActor.createTournament).mock.calls[0][0];
    expect(input).toMatchObject({
      name: "Midnight Squad Clash",
      creatorName: "ShadowStrike",
      game: Game.freeFire,
      mode: Mode.loneWolf,
      map: "Bermuda",
      roomId: "B002345687",
      roomPassword: "secret",
      maxPlayers: 48n,
      entryFee: 25n,
    });
  });

  it("creates a BR CS tournament when the BR CS game is selected", async () => {
    const user = userEvent.setup();
    await renderCreate();

    await user.click(screen.getByTestId("game_option_brCs"));
    await user.type(screen.getByTestId("name_input"), "Erangel Rush");
    await user.type(screen.getByTestId("creator_name_input"), "BlazeRider");
    await user.type(screen.getByTestId("map_input"), "Erangel");
    await user.type(screen.getByTestId("room_id_input"), "C998877665");
    await user.clear(screen.getByTestId("max_players_input"));
    await user.type(screen.getByTestId("max_players_input"), "24");

    await user.click(screen.getByTestId("submit_button"));

    const input = vi.mocked(mockActor.createTournament).mock.calls[0][0];
    expect(input.game).toBe(Game.brCs);
    expect(input.maxPlayers).toBe(24n);
  });
});
