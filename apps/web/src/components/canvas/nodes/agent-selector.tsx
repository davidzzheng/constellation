import type { NodeProps } from "@xyflow/react"
import type { Id } from "convex/_generated/dataModel"
import { useAction, useMutation, useQuery } from "convex/react"
import { Bot } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useEffect, useState } from "react"
import useMeasure from "react-use-measure"
import { api } from "~/api"
import { Button } from "~/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxCreateNew,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "~/components/ui/combobox"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { BaseNode } from "./base"
import { NodeHeader, NodeHeaderActions, NodeHeaderDeleteAction, NodeHeaderIcon, NodeHeaderTitle } from "./header"
import { NodeStatusIndicator } from "./status-indicator"

export type AgentCreatorNodeData = {
  taskId?: Id<"tasks">
}

// Define Agent type for combobox
interface AgentOption {
  value: string // agent id or slug
  label: string // agent name
  isNew?: boolean
}

export function AgentSelectorNode({ data = {}, selected }: NodeProps) {
  const nodeData = data as AgentCreatorNodeData

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createAgent = useMutation(api.agents.createAgent)
  const createThreadAndPrompt = useAction(api.agents.createThreadAndPrompt)
  const [contentRef, { height: heightContent }] = useMeasure()
  const [menuRef, { width: widthContainer }] = useMeasure()
  const [maxWidth, setMaxWidth] = useState(0)

  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([])
  const [value, setValue] = useState<string>("")
  const [prompt, setPrompt] = useState("")
  const [isNewAgent, setIsNewAgent] = useState(false)

  const agents = useQuery(api.agents.getMostRecentAgents, { limit: 10 })

  useEffect(() => {
    if (agents) {
      setAgentOptions(
        agents.map((agent) => ({
          value: agent._id,
          label: agent.name,
        })),
      )
    }
  }, [agents])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    setError(null)
    const found = agentOptions.find((a) => a.value === newValue)
    if (found) {
      setIsNewAgent(false)
      setPrompt("") // No prompt stored for existing agent
    } else {
      setIsNewAgent(true)
      setPrompt("")
    }
  }

  const handleCreateNew = (newValue: string) => {
    const slug = newValue.toLowerCase().replace(/\s+/g, "-")
    const newAgent: AgentOption = {
      value: slug,
      label: newValue,
      isNew: true,
    }
    setAgentOptions((prev) => [...prev, newAgent])
    setValue(slug)
    setIsNewAgent(true)
  }

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return
    setMaxWidth(widthContainer)
  }, [widthContainer, maxWidth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isNewAgent) {
        if (!prompt.trim()) {
          setError("Prompt is required for new agents.")
          setLoading(false)
          return
        }
        const agentId = await createAgent({
          name: value,
          taskId: nodeData?.taskId,
          prompt,
        })
        setAgentOptions((prev) => prev.filter((a) => !a.isNew))
        setValue(agentId)
        setIsNewAgent(false)
        setPrompt("")
        // Optionally, show a success message or update the node state here
      } else {
        // Existing agent selected, do nothing or trigger callback
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create agent.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MotionConfig transition={{ bounce: 0.1, duration: 0.25 }}>
      <NodeStatusIndicator>
        <BaseNode selected={selected} style={{ "--node-width": "360px" }} className={cn("w-(--node-width) origin-top")}>
          <div className="flex flex-col gap-y-1" ref={menuRef}>
            <NodeHeader>
              <NodeHeaderIcon>
                <Bot />
              </NodeHeaderIcon>
              <NodeHeaderTitle>Agent Selector</NodeHeaderTitle>
              <NodeHeaderActions>
                <NodeHeaderDeleteAction />
              </NodeHeaderActions>
            </NodeHeader>
            <div>
              <Label className="mb-1 inline font-medium text-xs">Agent Name</Label>
              <Combobox data={agentOptions} onValueChange={handleValueChange} type="agents" value={value}>
                <ComboboxTrigger className="w-full" />
                <ComboboxContent>
                  <ComboboxInput />
                  <ComboboxEmpty>
                    <ComboboxCreateNew onCreateNew={handleCreateNew} />
                  </ComboboxEmpty>
                  <ComboboxList>
                    <ComboboxGroup>
                      {agentOptions.map((agent) => (
                        <ComboboxItem key={agent.value} value={agent.value}>
                          {agent.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          <AnimatePresence initial={false} mode="sync">
            {value ? (
              <motion.div
                className="my-4"
                key="content"
                initial={{ height: 0 }}
                animate={{ height: heightContent ?? 0 }}
                exit={{ height: 0 }}
              >
                <div ref={contentRef} className="h-fit">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <Label className="mb-1 inline font-medium text-xs">Prompt</Label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={isNewAgent ? "Initial prompt for agent" : "No prompt stored for this agent"}
                        rows={4}
                        disabled={loading || !isNewAgent}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !value || (isNewAgent && !prompt.trim())}
                      className="mt-2 w-full"
                    >
                      {loading
                        ? isNewAgent
                          ? "Creating..."
                          : "Selecting..."
                        : isNewAgent
                          ? "Create Agent"
                          : "Select Agent"}
                    </Button>
                    {error && <div className="mt-1 text-red-500 text-xs">{error}</div>}
                  </form>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </BaseNode>
      </NodeStatusIndicator>
    </MotionConfig>
  )
}

AgentSelectorNode.displayName = "AgentSelectorNode"
