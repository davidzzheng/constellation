import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "~/lib/utils"

export const BaseNode = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { selected?: boolean }>(
  ({ className, selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-md border bg-card p-4 text-card-foreground shadow-xs outline-ring/50 ring-ring/10 transition-[color,width,height,box-shadow,scale,transform] dark:outline-ring/40 dark:ring-ring/20",
        "hover:outline-1 hover:ring-4",
        "focus-within:outline-1 focus-within:ring-4",
        selected ? "shadow-lg outline-1 ring-4" : "",
        className,
      )}
      tabIndex={0}
      {...props}
    />
  ),
)

BaseNode.displayName = "BaseNode"
