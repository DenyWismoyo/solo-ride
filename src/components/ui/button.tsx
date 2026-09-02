import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "sigap" | "secondary" | "danger" | "outline" | "ghost" | "glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "sg-btn sg-tactile-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50",
          {
            "sg-btn-primary": variant === "default",
            "sg-btn-sigap": variant === "sigap",
            "sg-btn-secondary": variant === "secondary",
            "sg-btn-danger": variant === "danger",
            "sg-btn-glass": variant === "glass",
            "bg-white/90 dark:bg-white/[0.04] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] shadow-xs": variant === "outline",
            "hover:bg-slate-100/80 dark:hover:bg-white/[0.06] text-slate-700 dark:text-zinc-200": variant === "ghost",
            "h-11 px-5 py-2.5": size === "default",
            "h-8.5 rounded-xl px-3.5 text-xs": size === "sm",
            "h-14 rounded-[1.4rem] px-8 text-base font-black": size === "lg",
            "h-10 w-10 p-0 rounded-2xl": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
