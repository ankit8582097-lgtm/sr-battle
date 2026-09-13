import { Layout } from "@/components/Layout";
import CreateTournament from "@/pages/CreateTournament";
import Home from "@/pages/Home";
import TournamentDetail from "@/pages/TournamentDetail";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const createRouteDef = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateTournament,
});

const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tournaments/$id",
  component: TournamentDetail,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  createRouteDef,
  detailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
