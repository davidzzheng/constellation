import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Background,
  type ColorMode,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  type Viewport,
} from "@xyflow/react"
import type { Id } from "convex/_generated/dataModel"
import { useCallback } from "react"
import { api } from "~/api"
import { useTheme } from "~/components/providers/theme"
import { DataEdge } from "./edges/data"
import { StatusEdge } from "./edges/status"
import { AgentSelectorNode } from "./nodes/agent-selector"
import { AnnotationNode } from "./nodes/annotation"
import { GroupNode } from "./nodes/group"
import { PlaceholderNode } from "./nodes/placeholder"

import "@xyflow/react/dist/base.css"

const nodeTypes = {
  placeholderNode: PlaceholderNode,
  agentSelectorNode: AgentSelectorNode,
  annotationNode: AnnotationNode,
  groupNode: GroupNode,
}

const edgeTypes = {
  // buttonEdge: ButtonEdge,
  dataEdge: DataEdge,
  statusEdge: StatusEdge,
}

const defaultNodes = [
  {
    id: "1",
    type: "agentSelectorNode",
    data: {},
    position: { x: 0, y: 0 },
  },
]

type TaskCanvasProps = {
  taskId: string
}

export function TaskCanvas({ taskId }: TaskCanvasProps) {
  const { theme } = useTheme()
  const { data } = useQuery(convexQuery(api.tasks.getTask, { taskId: taskId as Id<"tasks"> }))

  const nodesMutation = useMutation({
    mutationKey: ["tasks", taskId, "nodes"],
    mutationFn: useConvexMutation(api.tasks.updateTask),
  })

  const edgesMutation = useMutation({
    mutationKey: ["tasks", taskId, "edges"],
    mutationFn: useConvexMutation(api.tasks.updateTask),
  })

  const viewportMutation = useMutation({
    mutationKey: ["tasks", taskId, "viewport"],
    mutationFn: useConvexMutation(api.tasks.updateTask),
  })

  const handleAddNode = useCallback(async () => {}, [])

  const handleNodesChange = useCallback(
    async (changes: NodeChange[]) => {
      if (!data) return
      changes.forEach(async (change) => {
        if (change.type === "position" && !change.dragging) {
          const node = data.nodes?.find((n) => n.id === change.id)
          console.log(node, change)
          if (node) {
            await nodesMutation.mutateAsync({
              taskId: taskId as Id<"tasks">,
              nodes: data.nodes?.map((n) => ({
                id: n.id,
                type: n.type,
                position: n.position,
              })),
            })
          }
        }
      })
    },
    [data, nodesMutation, taskId],
  )

  const handleEdgesChange = useCallback(
    async (edges: EdgeChange[]) => {
      if (!data) return
      edges.forEach(async (e) => {
        let updatedEdges: Edge[] = []
        if (e.type === "add") {
          updatedEdges = data.edges?.map((edge) => {
            if (edge.id === e.item.id) {
              return {
                id: e.item.id,
                source: e.item.source,
                target: e.item.target,
              }
            }
            return edge
          })
        } else if (e.type === "remove") {
          updatedEdges = data.edges?.filter((edge) => edge.id !== e.id)
        }

        await edgesMutation.mutateAsync({
          taskId: taskId as Id<"tasks">,
          edges: updatedEdges,
        })
      })
    },
    [data, edgesMutation, taskId],
  )

  const handleViewportChange = useCallback(
    async (viewport: Viewport) => {
      await viewportMutation.mutateAsync({
        taskId: taskId as Id<"tasks">,
        viewport,
      })
    },
    [viewportMutation, taskId],
  )

  return (
    <div className="absolute top-0 left-0 size-full">
      {data ? (
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={data.nodes?.length > 0 ? data.nodes : defaultNodes}
          edges={data.edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          // onViewportChange={handleViewportChange}
          colorMode={theme as ColorMode}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap zoomable pannable />
          <Controls />
          <Background />
        </ReactFlow>
      ) : (
        "loading..."
      )}
    </div>
  )
}
