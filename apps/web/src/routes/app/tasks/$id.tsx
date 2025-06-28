import { convexQuery } from "@convex-dev/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { Id } from "convex/_generated/dataModel"
import { api } from "~/api"
import { TaskCanvas } from "~/components/canvas"

const RouteComponent = () => {
  const { id } = Route.useParams()

  return <TaskCanvas taskId={id} />
}

export const Route = createFileRoute("/app/tasks/$id")({
  component: RouteComponent,

  loader: async ({ params, context }) => {
    const { title } = await context.queryClient.ensureQueryData(
      convexQuery(api.tasks.getTask, { taskId: params.id as Id<"tasks"> }),
    )

    return {
      crumb: title,
      canvasView: true,
    }
  },
})
