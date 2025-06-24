"use client"

import { motion, type Transition } from "motion/react"
import type * as React from "react"
import { cn } from "~/lib/utils"

type GradientTextProps = React.ComponentProps<"span"> & {
  text: string
  gradient?: string
  neon?: boolean
  transition?: Transition
}

function GradientText({
  text,
  className,
  gradient = "linear-gradient(90deg, oklch(0.5417 0.1790 288.0332) 0%, oklch(0.5426 0.0465 284.7435) 20%, oklch(0.4143 0.1039 288.1742) 50%, oklch(0.5426 0.0465 284.7435) 80%, oklch(0.5417 0.1790 288.0332) 100%)",
  neon = false,
  transition = { duration: 50, repeat: Infinity, ease: "linear" },
  ...props
}: GradientTextProps) {
  const baseStyle: React.CSSProperties = {
    backgroundImage: gradient,
  }

  return (
    <span data-slot="gradient-text" className={cn("relative inline-block", className)} {...props}>
      <motion.span
        className="m-0 bg-[length:700%_100%] bg-[position:0%_0%] bg-clip-text text-transparent"
        style={baseStyle}
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "500% 100%" }}
        transition={transition}
      >
        {text}
      </motion.span>

      {neon && (
        <motion.span
          className="absolute top-0 left-0 m-0 bg-[length:700%_100%] bg-[position:0%_0%] bg-clip-text text-transparent mix-blend-plus-lighter blur-[8px]"
          style={baseStyle}
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "500% 100%" }}
          transition={transition}
        >
          {text}
        </motion.span>
      )}
    </span>
  )
}

export { GradientText, type GradientTextProps }
