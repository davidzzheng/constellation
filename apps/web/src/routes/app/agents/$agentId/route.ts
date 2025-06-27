import { convexQuery } from "@convex-dev/react-query"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import type { Id } from "convex/_generated/dataModel"
import { api } from "~/api"

export const Route = createFileRoute("/app/agents/$agentId")({
  component: Outlet,
  loader: async ({ params, context }) => {
    const { name } = await context.queryClient.ensureQueryData(
      convexQuery(api.agents.getAgent, {
        agentId: params.agentId as Id<"agents">,
      }),
    )

    return {
      crumb: name,
    }
  },
})
