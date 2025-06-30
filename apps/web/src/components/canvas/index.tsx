import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  addEdge,
  Background,
  type ColorMode,
  type Edge,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  type Viewport,
} from "@xyflow/react"
import type { Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { Suspense, useCallback } from "react"
import { api } from "~/api"
import { useTheme } from "~/components/providers/theme"
import { DataEdge } from "./edges/data"
import { StatusEdge } from "./edges/status"
import { AgentSelectorNode } from "./nodes/agent-selector"
import { AnnotationNode } from "./nodes/annotation"
import { GroupNode } from "./nodes/group"
import { PlaceholderNode } from "./nodes/placeholder"

import "@xyflow/react/dist/base.css"
import { Skeleton } from "../ui/skeleton"

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
  const { data } = useSuspenseQuery(convexQuery(api.tasks.getTask, { taskId: taskId as Id<"tasks"> }))

  const updateNodes = useMutation(api.tasks.updateTask).withOptimisticUpdate((local, args) => {
    const curr = local.getQuery(api.tasks.getTask, {
      taskId: taskId as Id<"tasks">,
    })
    const { nodes } = args

    if (curr !== undefined && nodes !== undefined) {
      local.setQuery(
        api.tasks.getTask,
        { taskId: taskId as Id<"tasks"> },
        {
          ...curr,
          nodes,
        },
      )
    }
  })

  const updateEdges = useMutation(api.tasks.updateTask).withOptimisticUpdate((local, args) => {
    const curr = local.getQuery(api.tasks.getTask, {
      taskId: taskId as Id<"tasks">,
    })
    const { edges } = args

    if (curr !== undefined && edges !== undefined) {
      local.setQuery(
        api.tasks.getTask,
        { taskId: taskId as Id<"tasks"> },
        {
          ...curr,
          edges,
        },
      )
    }
  })

  const updateViewport = useMutation(api.tasks.updateTask).withOptimisticUpdate((local, args) => {
    const curr = local.getQuery(api.tasks.getTask, {
      taskId: taskId as Id<"tasks">,
    })
    const { viewport } = args

    if (curr !== undefined && viewport !== undefined) {
      local.setQuery(
        api.tasks.getTask,
        { taskId: taskId as Id<"tasks"> },
        {
          ...curr,
          viewport,
        },
      )
    }
  })

  const handleNodesChange = useCallback(
    async (changes: NodeChange[]) => {
      if (!data) return
      changes.forEach(async (change) => {
        switch (change.type) {
          case "position":
            if (!change.dragging) {
              const node = data.nodes?.find((n) => n.id === change.id)
              if (node) {
                await updateNodes({
                  taskId: taskId as Id<"tasks">,
                  nodes: data.nodes?.map((n) => ({
                    id: n.id,
                    type: n.type,
                    position: n.position,
                    data: n.data,
                  })),
                })
              }
            }
            break
          case "add": {
            const node = change.item
            if (node) {
              await updateNodes({
                taskId: taskId as Id<"tasks">,
                nodes: data.nodes?.map((n) => ({
                  id: n.id,
                  type: n.type,
                  position: n.position,
                  data: n.data,
                })),
              })
            }
            break
          }
          case "remove":
            await updateNodes({
              taskId: taskId as Id<"tasks">,
              nodes: data.nodes?.filter((n) => n.id !== change.id),
            })
            break
        }
      })
    },
    [data, updateNodes, taskId],
  )

  const handleEdgesChange = useCallback(
    async (edges: EdgeChange[]) => {
      if (!data) return
      edges.forEach(async (e) => {
        let updatedEdges: Edge[] = []

        switch (e.type) {
          case "add": {
            const edge = e.item
            if (edge) {
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
            }
            break
          }
          case "remove": {
            updatedEdges = data.edges?.filter((edge) => edge.id !== e.id)

            break
          }
        }

        await updateEdges({
          taskId: taskId as Id<"tasks">,
          edges: updatedEdges,
        })
      })
    },
    [data, updateEdges, taskId],
  )

  const handleViewportChange = useCallback(
    async (viewport: Viewport) => {
      await updateViewport({
        taskId: taskId as Id<"tasks">,
        viewport,
      })
    },
    [updateViewport, taskId],
  )

  return (
    <div className="absolute top-0 left-0 size-full">
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
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
          <Background />
        </ReactFlow>
      </Suspense>
    </div>
  )
}
