import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger" | "sigap";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[1.2rem] text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-93",
          {
            "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-[0_8px_25px_-4px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_30px_-4px_rgba(16,185,129,0.45)] hover:opacity-95": variant === "default",
            "bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white shadow-[0_8px_25px_-4px_rgba(16,185,129,0.35)] hover:opacity-95": variant === "sigap",
            "bg-slate-100/90 dark:bg-white/[0.06] text-slate-800 dark:text-zinc-100 shadow-xs hover:bg-slate-200/90 dark:hover:bg-white/[0.1]": variant === "secondary",
            "bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25": variant === "danger",
            "bg-white/90 dark:bg-white/[0.04] text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] shadow-xs": variant === "outline",
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
