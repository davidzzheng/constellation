import { type NodeProps, Panel, type PanelPosition } from "@xyflow/react"
import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "~/lib/utils"
import { BaseNode } from "./base"

export type GroupNodeLabelProps = HTMLAttributes<HTMLDivElement>

export const GroupNodeLabel = forwardRef<HTMLDivElement, GroupNodeLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className="h-full w-full" {...props}>
        <div className={cn("w-fit bg-secondary p-2 text-card-foreground text-xs", className)}>{children}</div>
      </div>
    )
  },
)

GroupNodeLabel.displayName = "GroupNodeLabel"

export type GroupNodeProps = Partial<NodeProps> & {
  label?: ReactNode
  position?: PanelPosition
}

export const GroupNode = forwardRef<HTMLDivElement, GroupNodeProps>(({ selected, label, position, ...props }, ref) => {
  const getLabelClassName = (position?: PanelPosition) => {
    switch (position) {
      case "top-left":
        return "rounded-br-sm"
      case "top-center":
        return "rounded-b-sm"
      case "top-right":
        return "rounded-bl-sm"
      case "bottom-left":
        return "rounded-tr-sm"
      case "bottom-right":
        return "rounded-tl-sm"
      case "bottom-center":
        return "rounded-t-sm"
      default:
        return "rounded-br-sm"
    }
  }

  return (
    <BaseNode
      ref={ref}
      selected={selected}
      className="h-full overflow-hidden rounded-sm bg-white bg-opacity-50 p-0"
      {...props}
    >
      <Panel className={cn("m-0 p-0")} position={position}>
        {label && <GroupNodeLabel className={getLabelClassName(position)}>{label}</GroupNodeLabel>}
      </Panel>
    </BaseNode>
  )
})

GroupNode.displayName = "GroupNode"
