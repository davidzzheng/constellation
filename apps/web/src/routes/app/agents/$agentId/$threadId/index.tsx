import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/agents/$agentId/$threadId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/agents/$agentId/$threadId/"!</div>
}
