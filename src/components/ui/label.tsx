import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  React.ElementRef<"label">,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-none text-foreground/88 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
