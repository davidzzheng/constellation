import {
  addEdge,
  Background,
  type ColorMode,
  type Connection,
  Controls,
  type Edge,
  type EdgeTypes,
  MiniMap,
  type Node,
  type NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import React, { useCallback, useContext, useEffect, useState } from "react"
// import { useActiveOrganization } from "better-auth/client"
import { useMutation, useQuery } from "convex/react"
import { nanoid } from "nanoid"
// import { nodes as initialNodes, edges as initialEdges } from "./initial-elements"
import { z } from "zod"
import { api } from "~/api"
import { OrganizationContext } from "../nav/index"

import "@xyflow/react/dist/style.css"

// Minimal MCP config zod schema
const mcpConfigSchema = z.object({
  host: z.string().url(),
  port: z.number().int().min(1).max(65535),
  apiKey: z.string(),
})

// Dummy node components for agent and mcp
const AgentNodeComponent = ({ data }: { data: { prompt: string } }) => <div>Agent: {data.prompt}</div>
const MCPNodeComponent = ({ data }: { data: any }) => <div>MCP: {JSON.stringify(data)}</div>

const nodeTypes: NodeTypes = {
  agent: AgentNodeComponent,
  mcp: MCPNodeComponent,
  // ...other node types
}

const edgeTypes: EdgeTypes = {}
const nodeClassName = (node: Node) => node.type || "default"

const Workflow = () => {
  const { theme } = useTheme()
  // Explicitly type state for React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([])
  const [input, setInput] = useState("")
  const [showInput, setShowInput] = useState(false)

  // Get active organization from context
  const orgCtx = useContext(OrganizationContext)
  const organizationId = orgCtx?.activeOrganization?.id

  // Convex agent mutations
  const createAgent = useMutation(api.agents.createAgent)
  const updateAgent = useMutation(api.agents.updateAgent)
  const deleteAgent = useMutation(api.agents.deleteAgent)

  // Load agents from Convex
  const agents = useQuery(api.agents.getAgentsForCurrentUser, {})

  // Sync local state with Convex agents
  useEffect(() => {
    if (agents) {
      setNodes(
        agents.map((agent: any) => ({
          id: agent._id,
          type: agent.type === "mcp" ? "mcp" : "agent",
          position: agent.canvasPosition,
          data: agent.type === "mcp" ? agent.draft : { prompt: agent.draft },
        })),
      )
    }
  }, [agents])

  // Node creation handler
  const handleAddNode = useCallback(async () => {
    let type = "agent"
    let draft = input
    let data: any = { prompt: input }
    try {
      const parsed = JSON.parse(input)
      if (mcpConfigSchema.safeParse(parsed).success) {
        type = "mcp"
        draft = input // store the JSON as string
        data = parsed
      }
    } catch {
      // Not JSON, treat as agent prompt
    }
    // Create agent in Convex
    const agentId = await createAgent({
      videoId: "video_dummy_id", // TODO: Replace with real videoId if needed
      type,
      draft,
      canvasPosition: { x: 100, y: 100 },
      organizationId,
    })
    setNodes((nds: Node<any>[]) => [
      ...nds,
      {
        id: agentId,
        type,
        position: { x: 100, y: 100 },
        data,
      },
    ])
    setInput("")
    setShowInput(false)
  }, [input, createAgent, setNodes, organizationId])

  // Node delete handler
  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      await deleteAgent({ agentId: nodeId })
      setNodes((nds: Node<any>[]) => nds.filter((n) => n.id !== nodeId))
    },
    [deleteAgent, setNodes],
  )

  // Node move/update handler
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      changes.forEach(async (change: any) => {
        if (change.type === "position" && change.id) {
          const node = nodes.find((n) => n.id === change.id)
          if (node) {
            await updateAgent({
              agentId: node.id,
              canvasPosition: node.position,
            })
          }
        }
      })
    },
    [onNodesChange, nodes, updateAgent],
  )

  const onConnect = useCallback(
    (params: Edge<any> | Connection) => setEdges((eds: Edge<any>[]) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={() => setShowInput(true)}>Add Node</button>
      {showInput && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            background: "white",
            padding: 16,
            border: "1px solid #ccc",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter agent prompt or MCP JSON config"
            rows={5}
            cols={40}
          />
          <br />
          <button onClick={handleAddNode}>Create Node</button>
          <button onClick={() => setShowInput(false)}>Cancel</button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        attributionPosition="top-right"
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={theme as ColorMode}
        fitView
        onNodeDoubleClick={(_, node) => handleDeleteNode(node.id)}
      >
        <MiniMap zoomable pannable nodeClassName={nodeClassName} />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}

export default Workflow
