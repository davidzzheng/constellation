import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/app/tasks")({
  component: Outlet,
  loader: () => ({
    crumb: "Tasks",
  }),
})
