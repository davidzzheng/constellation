import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "~/lib/utils"

export type AnnotationNodeProps = HTMLAttributes<HTMLDivElement>

export const AnnotationNode = forwardRef<HTMLDivElement, AnnotationNodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn("relative flex max-w-[180px] items-start p-2 text-secondary-foreground text-sm", className)}
      >
        {children}
      </div>
    )
  },
)

AnnotationNode.displayName = "AnnotationNode"

export type AnnotationNodeNumberProps = HTMLAttributes<HTMLDivElement>

export const AnnotationNodeNumber = forwardRef<HTMLDivElement, AnnotationNodeNumberProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className={cn("mr-1 leading-snug", className)}>
        {children}
      </div>
    )
  },
)

AnnotationNodeNumber.displayName = "AnnotationNodeNumber"

export type AnnotationNodeContentProps = HTMLAttributes<HTMLDivElement>

export const AnnotationNodeContent = forwardRef<HTMLDivElement, AnnotationNodeContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className={cn("leading-snug", className)}>
        {children}
      </div>
    )
  },
)

AnnotationNodeContent.displayName = "AnnotationNodeContent"

export type AnnotationNodeIconProps = HTMLAttributes<HTMLDivElement>

export const AnnotationNodeIcon = forwardRef<HTMLDivElement, AnnotationNodeIconProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className={cn("absolute right-2 bottom-0 text-2xl", className)}>
        {children}
      </div>
    )
  },
)

AnnotationNodeIcon.displayName = "AnnotationNodeIcon"
