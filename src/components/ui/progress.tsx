import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { value?: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-secondary/70 ring-1 ring-border/60",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 rounded-full bg-primary transition-all duration-500"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
