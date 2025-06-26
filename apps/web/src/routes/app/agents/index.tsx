import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "~/api"

export const Route = createFileRoute("/app/agents/")({
  component: AgentsDashboard,
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(convexQuery(api.agent.getAgentsForCurrentUser, {})),
})

function AgentsDashboard() {
  const { data: agents } = useSuspenseQuery(convexQuery(api.agent.getAgentsForCurrentUser, {}))

  if (!agents) return <div>Loading...</div>

  return (
    <div style={{ padding: 32 }}>
      <h1>My Agents</h1>
      <ul>
        {agents.map((agent) => (
          <li key={agent._id}>{agent.name}</li>
        ))}
      </ul>
    </div>
  )
}
