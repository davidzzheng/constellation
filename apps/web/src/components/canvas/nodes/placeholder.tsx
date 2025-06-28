import { Handle, type NodeProps, Position, useNodeId, useReactFlow } from "@xyflow/react"
import { forwardRef, type ReactNode, useCallback } from "react"
import { BaseNode } from "./base"
import { Plus } from "lucide-react"

export type PlaceholderNodeProps = Partial<NodeProps> & {
  children?: ReactNode
}

export const PlaceholderNode = forwardRef<HTMLDivElement, PlaceholderNodeProps>(({ selected, children }, ref) => {
  const id = useNodeId()
  const { setNodes, setEdges } = useReactFlow()

  const handleClick = useCallback(() => {
    if (!id) return

    setEdges((edges) => edges.map((edge) => (edge.target === id ? { ...edge, animated: false } : edge)))

    setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === id) {
          // Customize this function to update the node's data as needed.
          // For example, you can change the label or other properties of the node.
          return {
            ...node,
            data: { ...node.data, label: "Node" },
            type: "default",
          }
        }
        return node
      })
      return updatedNodes
    })
  }, [id, setEdges, setNodes])

  return (
    <BaseNode
      ref={ref}
      selected={selected}
      className="w-[150px] border-gray-400 border-dashed bg-card p-2 text-center text-gray-400 shadow-none"
      onClick={handleClick}
    >
      <Plus />
      <Handle type="target" style={{ visibility: "hidden" }} position={Position.Top} isConnectable={false} />
      <Handle type="source" style={{ visibility: "hidden" }} position={Position.Bottom} isConnectable={false} />
    </BaseNode>
  )
})

PlaceholderNode.displayName = "PlaceholderNode"
