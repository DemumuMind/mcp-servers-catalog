import * as React from "react"

import { cn } from "@/lib/utils"
import { SlotDiv } from "@/components/ui/slot-div"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card/82 py-5 text-sm text-card-foreground shadow-[var(--shadow-soft)] backdrop-blur-xl transition-all duration-300 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-header"
      baseClass="group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 px-5 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3"
      className={className}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-title"
      baseClass="font-heading text-base leading-snug font-semibold tracking-[-0.04em] group-data-[size=sm]/card:text-sm"
      className={className}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-description"
      baseClass="text-sm leading-6 text-muted-foreground"
      className={className}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-action"
      baseClass="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
      className={className}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-content"
      baseClass="px-5 group-data-[size=sm]/card:px-4"
      className={className}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <SlotDiv
      dataSlot="card-footer"
      baseClass="flex items-center border-t border-border/60 bg-muted/45 p-5 group-data-[size=sm]/card:p-4"
      className={className}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
