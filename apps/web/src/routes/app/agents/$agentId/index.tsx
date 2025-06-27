import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/agents/$agentId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/agents/$id/"!</div>
}
