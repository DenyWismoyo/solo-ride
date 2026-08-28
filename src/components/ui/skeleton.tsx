"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sg-shimmer-effect rounded-xl bg-zinc-200/80 dark:bg-zinc-800/60 animate-pulse",
        className
      )}
      {...props}
    />
  );
}
