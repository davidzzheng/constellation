import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/app/agents")({
  component: Outlet,
  loader: () => ({
    crumb: "Agents",
  }),
})
