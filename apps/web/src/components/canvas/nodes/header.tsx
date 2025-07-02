import { useNodeId, useReactFlow } from "@xyflow/react"
import { Copy, EllipsisVertical, Trash } from "lucide-react"
import { Slot } from "radix-ui"
import { forwardRef, type HTMLAttributes, type ReactNode, useCallback } from "react"
import { Button, type ButtonProps } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

export type NodeHeaderProps = HTMLAttributes<HTMLElement>

export const NodeHeader = forwardRef<HTMLElement, NodeHeaderProps>(({ className, ...props }, ref) => {
  return (
    <header
      ref={ref}
      {...props}
      className={cn("-mx-3 -mt-2 mb-2 flex items-center justify-between gap-2 border-b px-3 pt-1 pb-3", className)}
    />
  )
})

NodeHeader.displayName = "NodeHeader"

export type NodeHeaderTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  asChild?: boolean
}

export const NodeHeaderTitle = forwardRef<HTMLHeadingElement, NodeHeaderTitleProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "h3"

    return <Comp ref={ref} {...props} className={cn(className, "user-select-none flex-1 font-semibold")} />
  },
)

NodeHeaderTitle.displayName = "NodeHeaderTitle"

export type NodeHeaderIconProps = HTMLAttributes<HTMLSpanElement>

export const NodeHeaderIcon = forwardRef<HTMLSpanElement, NodeHeaderIconProps>(({ className, ...props }, ref) => {
  return <span ref={ref} {...props} className={cn(className, "[&>*]:size-5")} />
})

NodeHeaderIcon.displayName = "NodeHeaderIcon"

export type NodeHeaderActionsProps = HTMLAttributes<HTMLDivElement>

export const NodeHeaderActions = forwardRef<HTMLDivElement, NodeHeaderActionsProps>(({ className, ...props }, ref) => {
  return <div ref={ref} {...props} className={cn("ml-auto flex items-center gap-1 justify-self-end", className)} />
})

NodeHeaderActions.displayName = "NodeHeaderActions"

export type NodeHeaderActionProps = ButtonProps & {
  label: string
}

export const NodeHeaderAction = forwardRef<HTMLButtonElement, NodeHeaderActionProps>(
  ({ className, label, title, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        aria-label={label}
        title={title ?? label}
        className={cn(className, "nodrag size-6 p-1")}
        {...props}
      />
    )
  },
)

NodeHeaderAction.displayName = "NodeHeaderAction"

export type NodeHeaderMenuActionProps = Omit<NodeHeaderActionProps, "onClick"> & {
  trigger?: ReactNode
}

export const NodeHeaderMenuAction = forwardRef<HTMLButtonElement, NodeHeaderMenuActionProps>(
  ({ trigger, children, ...props }, ref) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <NodeHeaderAction ref={ref} {...props}>
            {trigger ?? <EllipsisVertical />}
          </NodeHeaderAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>{children}</DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

NodeHeaderMenuAction.displayName = "NodeHeaderMenuAction"

export const NodeHeaderDeleteAction = () => {
  const id = useNodeId()
  const { setNodes } = useReactFlow()

  const handleClick = useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id))
  }, [id, setNodes])

  return (
    <NodeHeaderAction onClick={handleClick} variant="ghost" label="Delete node">
      <Trash />
    </NodeHeaderAction>
  )
}

NodeHeaderDeleteAction.displayName = "NodeHeaderDeleteAction"

export interface NodeHeaderCopyActionProps extends Omit<NodeHeaderActionProps, "onClick"> {
  onClick?: (nodeId: string, event: React.MouseEvent) => void
}

export const NodeHeaderCopyAction = forwardRef<HTMLButtonElement, NodeHeaderCopyActionProps>(
  ({ onClick, ...props }, ref) => {
    const id = useNodeId()

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        if (!onClick || !id) return

        onClick(id, event)
      },
      [onClick, id],
    )

    return (
      <NodeHeaderAction ref={ref} onClick={handleClick} variant="ghost" {...props}>
        <Copy />
      </NodeHeaderAction>
    )
  },
)

NodeHeaderCopyAction.displayName = "NodeHeaderCopyAction"
