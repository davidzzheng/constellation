import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { addEdge, Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react"
import type { Id } from "convex/_generated/dataModel"
import { useCallback } from "react"
import { api } from "~/api"
import "@xyflow/react/dist/style.css"

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

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(convexQuery(api.tasks.getTask, { taskId: id as Id<"tasks"> }))

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [])

  return (
    <div className="absolute top-0 left-0 size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="top-right"
        nodeTypes={{}}
        edgeTypes={{}}
      >
        <MiniMap zoomable pannable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}
