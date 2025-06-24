import type { PropsWithChildren } from "react"
import { cn } from "~/lib/utils"

export const Container = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("mx-auto flex w-full flex-col items-center justify-center md:max-w-3xl", className)}>
      {children}
    </div>
  )
}
