import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-border/85 bg-background/60 px-3 py-2 text-sm font-semibold tracking-tight transition-all duration-200 outline-none placeholder:text-muted-foreground/75 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 dark:bg-card/40 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
