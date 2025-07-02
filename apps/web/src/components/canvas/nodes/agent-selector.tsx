import type { NodeProps } from "@xyflow/react"
import type { Doc, Id } from "convex/_generated/dataModel"
import { useAction, useMutation } from "convex/react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import useMeasure from "react-use-measure"
import { api } from "~/api"
import { AsyncSelect } from "~/components/ui/async-select"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { BaseNode } from "./base"
import { NodeStatusIndicator } from "./status-indicator"
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

export type AgentCreatorNodeData = {
  taskId?: Id<"tasks">
}

export function AgentSelectorNode({ data = {}, selected }: NodeProps) {
  const nodeData = data as AgentCreatorNodeData
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<Id<"agents"> | string | undefined>()
  const createAgent = useMutation(api.agents.createAgent)
  const createThreadAndPrompt = useAction(api.agents.createThreadAndPrompt)
  const [contentRef, { height: heightContent }] = useMeasure()
  const [menuRef, { width: widthContainer }] = useMeasure()
  const [maxWidth, setMaxWidth] = useState(0)

  const [frameworks, setFrameworks] = useState([])
  const [value, setValue] = useState("")
  const handleCreateNew = (newValue: string) => {
    console.log("Creating new framework:", newValue)

    const newFramework = {
      value: newValue.toLowerCase().replace(/\s+/g, "-"),
      label: newValue,
    }

    setFrameworks((prev) => [...prev, newFramework])
    setValue(newFramework.value)
  }

  const queryAgents = useMutation(api.agents.queryAgents)

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return

    setMaxWidth(widthContainer)
  }, [widthContainer, maxWidth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // 1. Create the agent
      const agentId = await createAgent({
        name,
        taskId: nodeData?.taskId,
        prompt,
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

  return (
    <MotionConfig
      transition={{
        bounce: 0.1,
        duration: 0.25,
      }}
    >
      <NodeStatusIndicator>
        <BaseNode selected={selected} style={{ "--node-width": "360px" }} className={cn("w-(--node-width) origin-top")}>
          <div className="flex flex-col gap-y-2" ref={menuRef}>
            <p>Agent Selector</p>
            <Combobox data={frameworks} onValueChange={setValue} type="agents" value={value}>
              <ComboboxTrigger className="w-full" />
              <ComboboxContent>
                <ComboboxInput />
                <ComboboxEmpty>
                  <ComboboxCreateNew onCreateNew={handleCreateNew} />
                </ComboboxEmpty>
                <ComboboxList>
                  <ComboboxGroup>
                    {frameworks.map((framework) => (
                      <ComboboxItem key={framework.value} value={framework.value}>
                        {framework.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <AnimatePresence initial={false} mode="sync">
            {selectedAgentId ? (
              <motion.div
                key="content"
                initial={{ height: 0 }}
                animate={{ height: heightContent || 0 }}
                exit={{ height: 0 }}
                style={{
                  width: "var(--node-width)",
                }}
              >
                <div ref={contentRef}>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <Label className="mb-1 inline font-medium text-xs">Agent Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter agent name"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 inline font-medium text-xs">Prompt (optional)</Label>
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
