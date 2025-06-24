import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/app/tasks")({
  component: RouteComponent,
  loader: () => ({
    crumb: "Tasks",
  }),
})

function RouteComponent() {
  return <div>Hello "/app/tasks"!</div>
}
