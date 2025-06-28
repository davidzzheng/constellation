import { Handle, type NodeProps, Position } from "@xyflow/react"
import type { Doc, Id } from "convex/_generated/dataModel"
import { useAction, useMutation, useQuery } from "convex/react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useRef, useState } from "react"
import { api } from "~/api"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { BaseNode } from "./base"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Textarea } from "~/components/ui/textarea"

export type AgentCreatorNodeData = {
  taskId?: Id<"tasks">
  canvasPosition?: { x: number; y: number }
}

export function AgentSelectorNode({ data = {}, selected }: NodeProps) {
  const nodeData = data as AgentCreatorNodeData
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | "">("")
  const createAgent = useMutation(api.agents.createAgent)
  const createThreadAndPrompt = useAction(api.agents.createThreadAndPrompt)
  const agentsData = useQuery(api.agents.getAgentsForCurrentUser, {
    paginationOpts: { numItems: 100, cursor: null },
  })
  const containerRef = useRef<HTMLDivElement>(null)

  let agentOptions: Doc<"agents">[] = []
  if (agentsData && !Array.isArray(agentsData) && agentsData.page) {
    agentOptions = agentsData.page
  }
  const selectedAgent = agentOptions.find((a) => a._id === selectedAgentId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // 1. Create the agent
      const agentId = await createAgent({
        name,
        taskId: nodeData?.taskId,
        canvasPosition: nodeData?.canvasPosition || { x: 0, y: 0 },
      })
      // 2. Create the thread and initial prompt (if provided)
      if (prompt.trim()) {
        await createThreadAndPrompt({ prompt })
      }
      setName("")
      setPrompt("")
      // Optionally, show a success message or update the node state here
    } catch (err: any) {
      setError(err?.message || "Failed to create agent.")
    } finally {
      setLoading(false)
    }
  }

  if (!expanded) {
    return (
      <BaseNode
        selected={selected}
        className="w-[150px] border-gray-400 border-dashed bg-card p-2 text-center text-gray-400 shadow-none mx-auto"
        onClick={() => setExpanded(true)}
      >
        <Plus />
        <Handle type="target" style={{ visibility: "hidden" }} position={Position.Top} isConnectable={false} />
        <Handle type="source" style={{ visibility: "hidden" }} position={Position.Bottom} isConnectable={false} />
      </BaseNode>
    )
  }

  return (
    <BaseNode selected={selected} className="w-[320px] p-4">
      <div className="mb-3">
        <Label className="mb-1 block font-medium text-xs">Select Existing Agent</Label>
        <div className="w-full" ref={containerRef}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                {selectedAgentId
                  ? agentOptions.find((agent) => agent._id === selectedAgentId)?.name
                  : "Select agent..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[288px] p-0" container={containerRef.current}>
              <Command>
                <CommandInput placeholder="Search agents..." disabled={agentsData === undefined} />
                <CommandList>
                  <CommandEmpty>No agents found.</CommandEmpty>
                  {agentOptions.map((agent) => (
                    <CommandItem
                      key={agent._id}
                      value={agent._id}
                      onSelect={() => setSelectedAgentId(agent._id)}
                      className={selectedAgentId === agent._id ? "bg-accent" : ""}
                    >
                      {agent.name}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selectedAgentId && selectedAgent && (
          <div className="mt-2 text-gray-600 text-xs">
            Selected: {selectedAgent.name} <br />
            ID: {selectedAgentId}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <Label className="mb-1 block font-medium text-xs">Agent Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter agent name"
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label className="mb-1 block font-medium text-xs">Prompt (optional)</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Initial prompt for thread"
            rows={4}
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || !name} className="mt-2 w-full">
          {loading ? "Creating..." : "Create Agent"}
        </Button>
        {error && <div className="mt-1 text-red-500 text-xs">{error}</div>}
      </form>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} isConnectable={false} />
    </BaseNode>
  )
}

AgentSelectorNode.displayName = "AgentSelectorNode"
