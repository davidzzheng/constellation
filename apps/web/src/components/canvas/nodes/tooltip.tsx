import { type NodeProps, NodeToolbar, type NodeToolbarProps } from "@xyflow/react"
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"
import { BaseNode } from "./base"

const TooltipContext = createContext(false)

export type TooltipNodeProps = Partial<NodeProps> & {
  children?: ReactNode
}

export const TooltipNode = forwardRef<HTMLDivElement, TooltipNodeProps>(({ selected, children }, ref) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false)

  const showTooltip = useCallback(() => setTooltipVisible(true), [])
  const hideTooltip = useCallback(() => setTooltipVisible(false), [])

  return (
    <TooltipContext.Provider value={isTooltipVisible}>
      <BaseNode
        ref={ref}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        selected={selected}
      >
        {children}
      </BaseNode>
    </TooltipContext.Provider>
  )
})

TooltipNode.displayName = "TooltipNode"

export type TooltipContentProps = NodeToolbarProps

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(({ position, children }, ref) => {
  const isTooltipVisible = useContext(TooltipContext)

  return (
    <div ref={ref}>
      <NodeToolbar
        isVisible={isTooltipVisible}
        className="rounded-sm bg-primary p-2 text-primary-foreground"
        tabIndex={1}
        position={position}
      >
        {children}
      </NodeToolbar>
    </div>
  )
})

TooltipContent.displayName = "TooltipContent"

export type TooltipTriggerProps = HTMLAttributes<HTMLParagraphElement>

export const TooltipTrigger = forwardRef<HTMLParagraphElement, TooltipTriggerProps>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
})

TooltipTrigger.displayName = "TooltipTrigger"
