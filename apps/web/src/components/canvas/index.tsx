import { Background, type ColorMode, MiniMap, ReactFlow } from "@xyflow/react"
import { Suspense } from "react"
import { useTheme } from "~/components/providers/theme"
import { useCanvas } from "~/hooks/use-canvas"
import { Skeleton } from "../ui/skeleton"
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
  const { edges, nodes, handleEdgesChange, handleNodesChange, handleViewportChange } = useCanvas(taskId)

  return (
    <div className="absolute top-0 left-0 size-full">
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes?.length > 0 ? nodes : defaultNodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          // onViewportChange={handleViewportChange}
          colorMode={theme as ColorMode}
          fitView
        >
          <MiniMap zoomable pannable />
          <Background />
        </ReactFlow>
      </Suspense>
    </div>
  )
}
