import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { type Edge, type EdgeChange, type Node, type NodeChange, useReactFlow, type Viewport } from "@xyflow/react"
import type { Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useCallback, useId } from "react"
import { api } from "~/api"

export const useCanvas = (taskId: string) => {
  const { data } = useSuspenseQuery(convexQuery(api.tasks.getTask, { taskId: taskId as Id<"tasks"> }))
  const { addNodes } = useReactFlow()

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
      let updatedNodes = data.nodes ? [...data.nodes] : []
      let changed = false
      for (const change of changes) {
        switch (change.type) {
          case "position": {
            const idx = updatedNodes.findIndex((n) => n.id === change.id)
            if (idx !== -1) {
              updatedNodes[idx] = {
                ...updatedNodes[idx],
                position: change.position ?? updatedNodes[idx].position,
              }
              changed = true
            }
            break
          }
          case "add": {
            if (change.item) {
              const node = change.item as Node<{
                id: string
                type: string
                position: { x: number; y: number }
                data: any
              }>
              updatedNodes.push({
                id: node.id,
                type: node.type ?? "default",
                position: node.position,
                data: node.data,
              })
              changed = true
            }
            break
          }
          case "remove": {
            updatedNodes = updatedNodes.filter((n) => n.id !== change.id)
            changed = true
            break
          }
        }
      }
      if (changed) {
        await updateNodes({
          taskId: taskId as Id<"tasks">,
          nodes: updatedNodes,
        })
      }
    },
    [data, updateNodes, taskId],
  )

  const handleEdgesChange = useCallback(
    async (changes: EdgeChange[]) => {
      if (!data) return
      let updatedEdges = data.edges ? [...data.edges] : []
      let changed = false
      for (const change of changes) {
        switch (change.type) {
          case "add": {
            if (change.item) {
              const edge = change.item as Edge
              if (!updatedEdges.some((e) => e.id === edge.id)) {
                updatedEdges.push({
                  id: edge.id,
                  source: edge.source,
                  target: edge.target,
                  sourceHandle: (edge as any).sourceHandle,
                  targetHandle: (edge as any).targetHandle,
                })
                changed = true
              }
            }
            break
          }
          case "remove": {
            updatedEdges = updatedEdges.filter((e) => e.id !== change.id)
            changed = true
            break
          }
        }
      }
      if (changed) {
        await updateEdges({
          taskId: taskId as Id<"tasks">,
          edges: updatedEdges,
        })
      }
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

  const id = useId()
  const addNode = (type: string, data: Record<string, unknown>) => {
    addNodes([
      {
        id,
        type,
        position: { x: 0, y: 0 },
        data,
      },
    ])
  }

  return {
    nodes: data?.nodes ?? [],
    edges: data?.edges ?? [],
    viewport: data?.viewport,
    addNode,
    handleNodesChange,
    handleEdgesChange,
    handleViewportChange,
  }
}
