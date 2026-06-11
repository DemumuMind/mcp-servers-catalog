import * as React from "react"
import { cn } from "@/lib/utils"

interface SlotDivProps extends React.ComponentProps<"div"> {
  dataSlot: string
  baseClass?: string
}

export function SlotDiv({ dataSlot, baseClass, className, ...props }: SlotDivProps) {
  return (
    <div
      data-slot={dataSlot}
      className={cn(baseClass, className)}
      {...props}
    />
  )
}
