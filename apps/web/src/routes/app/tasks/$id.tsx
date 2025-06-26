import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import type { Id } from "convex/_generated/dataModel"
import { api } from "~/api"

export const Route = createFileRoute("/app/tasks/$id")({
  component: RouteComponent,

  loader: async ({ params, context }) => {
    const { title } = await context.queryClient.ensureQueryData(
      convexQuery(api.tasks.getTask, { taskId: params.id as Id<"tasks"> }),
    )

    return {
      crumb: title,
    }
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(convexQuery(api.tasks.getTask, { taskId: id as Id<"tasks"> }))

  return <div>Hello "/app/tasks/$id"!</div>
}
