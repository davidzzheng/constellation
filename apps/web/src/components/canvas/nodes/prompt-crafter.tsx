"use client"

import { StreamLanguage } from "@codemirror/language"
import type { EditorView } from "@codemirror/view"
import { tags as t } from "@lezer/highlight"
import { createTheme } from "@uiw/codemirror-themes"
import CodeMirror from "@uiw/react-codemirror"
import type { Node } from "@xyflow/react"
import { type NodeProps, Position, useUpdateNodeInternals } from "@xyflow/react"
import { BetweenVerticalEnd, PencilRuler, Plus, Trash } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Separator } from "~/components/ui/separator"
import { cn } from "~/lib/utils"
import { EditableHandle, EditableHandleDialog } from "../handles/editable"
import { LabeledHandle } from "../handles/label"
import { BaseNode } from "./base"
import { NodeHeader, NodeHeaderAction, NodeHeaderActions, NodeHeaderIcon, NodeHeaderTitle } from "./header"
import { NodeStatusIndicator } from "./status-indicator"

type PromptCrafterData = {
  status: "processing" | "error" | "success" | "idle" | undefined
  config: {
    template: string
  }
  dynamicHandles: {
    "template-tags": {
      id: string
      name: string
    }[]
  }
}

export type PromptCrafterNode = Node<PromptCrafterData, "prompt-crafter">

interface PromptCrafterProps extends NodeProps<PromptCrafterNode> {
  onPromptTextChange: (value: string) => void
  onCreateInput: (name: string) => boolean
  onRemoveInput: (handleId: string) => void
  onUpdateInputName: (handleId: string, newLabel: string) => boolean
  onDeleteNode: () => void
}

const promptTheme = createTheme({
  theme: "dark",
  settings: {
    background: "transparent",
    foreground: "hsl(var(--foreground))",
    caret: "black",
    selection: "#3B82F6",
    lineHighlight: "transparent",
  },
  styles: [
    { tag: t.variableName, color: "#10c43d" },
    { tag: t.string, color: "hsl(var(--foreground))" },
    { tag: t.invalid, color: "#DC2626" },
  ],
})

// Create a function to generate the language with the current inputs
const createPromptLanguage = (validInputs: string[] = []) =>
  StreamLanguage.define({
    token(stream) {
      if (stream.match(/{{[^}]*}}/)) {
        const match = stream.current()
        const inputName = match.slice(2, -2)
        // Check if the input name is valid
        if (validInputs.includes(inputName)) {
          return "variableName"
        }
        return "invalid"
      }
      stream.next()
      return null
    },
  })

export function PromptCrafterNode({
  id,
  selected,
  deletable,
  data,
  onPromptTextChange,
  onCreateInput,
  onRemoveInput,
  onUpdateInputName,
  onDeleteNode,
}: PromptCrafterProps) {
  const updateNodeInternals = useUpdateNodeInternals()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const editorViewRef = useRef<EditorView>()

  const handleCreateInput = useCallback(
    (name: string) => {
      const result = onCreateInput(name)
      if (result) {
        updateNodeInternals(id)
      }
      return result
    },
    [onCreateInput, id, updateNodeInternals],
  )

  const handleRemoveInput = useCallback(
    (handleId: string) => {
      onRemoveInput(handleId)
      updateNodeInternals(id)
    },
    [onRemoveInput, id, updateNodeInternals],
  )

  const handleUpdateInputName = useCallback(
    (handleId: string, newLabel: string) => {
      const result = onUpdateInputName(handleId, newLabel)
      if (result) {
        updateNodeInternals(id)
      }
      return result
    },
    [onUpdateInputName, id, updateNodeInternals],
  )

  const insertInputAtCursor = useCallback((inputName: string) => {
    const view = editorViewRef.current
    if (!view) {
      return
    }

    const inputTag = `{{${inputName}}}`
    const from = view.state.selection.main.from
    view.dispatch({
      changes: { from, insert: inputTag },
      selection: { anchor: from + inputTag.length },
    })
    setIsPopoverOpen(false)
  }, [])

  const extensions = useMemo(() => {
    const validLabels = (data.dynamicHandles["template-tags"] || []).map((input) => input.name)
    return [createPromptLanguage(validLabels)]
  }, [data.dynamicHandles["template-tags"]])

  return (
    <NodeStatusIndicator status={data.status}>
      <BaseNode
        selected={selected}
        className={cn("w-[350px] p-0 hover:ring-orange-500", {
          "border-orange-500": data.status === "processing",
          "border-red-500": data.status === "error",
        })}
      >
        <NodeHeader className="m-0">
          <NodeHeaderIcon>
            <PencilRuler />
          </NodeHeaderIcon>
          <NodeHeaderTitle>Prompt Crafter</NodeHeaderTitle>
          {deletable ? (
            <NodeHeaderActions>
              <NodeHeaderAction onClick={onDeleteNode} variant="ghost" label="Delete node">
                <Trash />
              </NodeHeaderAction>
            </NodeHeaderActions>
          ) : null}
        </NodeHeader>
        <Separator />
        <div className="p-2">
          <div className="mb-1 flex items-center gap-2">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <BetweenVerticalEnd className="mr-1 h-4 w-4" />
                  Insert Input into Prompt
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search inputs..." />
                  <CommandList>
                    <CommandEmpty>No inputs found.</CommandEmpty>
                    <CommandGroup>
                      {data.dynamicHandles["template-tags"]?.map(
                        (input) =>
                          input.name && (
                            <CommandItem
                              key={input.id}
                              onSelect={() => insertInputAtCursor(input.name)}
                              className="text-base"
                            >
                              {input.name}
                            </CommandItem>
                          ),
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <CodeMirror
            value={data.config.template || ""}
            height="150px"
            theme={promptTheme}
            extensions={extensions}
            onChange={onPromptTextChange}
            onCreateEditor={(view) => {
              editorViewRef.current = view
            }}
            className="nodrag [&_.cm-content]:!cursor-text [&_.cm-line]:!cursor-text nodrag nopan nowheel overflow-hidden rounded-md border"
            placeholder="Craft your prompt here... Use {{input-name}} to reference inputs"
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
            }}
          />
        </div>
        <div className="grid grid-cols-[2fr,1fr] gap-4 pb-2 text-sm">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between rounded-r-xl bg-muted px-4 py-2">
              <span className="font-medium text-sm">Inputs</span>
              <EditableHandleDialog
                variant="create"
                label=""
                onSave={handleCreateInput}
                onCancel={() => {}}
                align="end"
              >
                <Button variant="outline" size="sm" className="mx-1 h-7 w-fit px-2">
                  <Plus className="mr-1 h-4 w-4" />
                  New Input
                </Button>
              </EditableHandleDialog>
            </div>
            {data.dynamicHandles["template-tags"]?.map((input) => (
              <EditableHandle
                key={input.id}
                nodeId={id}
                handleId={input.id}
                name={input.name}
                type="target"
                position={Position.Left}
                wrapperClassName="w-full"
                onUpdateTool={handleUpdateInputName}
                onDelete={handleRemoveInput}
              />
            ))}
          </div>
          <div className="flex items-center justify-end self-stretch border-border border-l">
            <LabeledHandle id="result" title="Result" type="source" position={Position.Right} />
          </div>
        </div>
      </BaseNode>
    </NodeStatusIndicator>
  )
}
