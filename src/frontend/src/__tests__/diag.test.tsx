import { createMockActor, sampleTournament } from "@/__tests__/mockActor";
import { Status } from "@/backend";
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
import { render, screen } from "@testing-library/react";
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

describe("TournamentDetail join guard", () => {
  it("hides the join form for a closed tournament", async () => {
    mockActor = createMockActor([
      sampleTournament({
        id: 1n,
        name: "Closed Clash",
        status: Status.closed,
      }),
    ]);
    renderDetail("1");

    await screen.findByText("Closed Clash");
    expect(screen.getByText("This tournament is closed")).toBeInTheDocument();
    expect(screen.queryByTestId("player_name_input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("join_button")).not.toBeInTheDocument();
  });
});
