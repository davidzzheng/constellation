import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/agents/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/agents/$agentId"!</div>
}
