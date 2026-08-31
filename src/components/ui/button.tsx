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
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95",
          {
            "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500": variant === "default",
            "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-500/20 hover:opacity-95": variant === "sigap",
            "bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-zinc-100 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:bg-slate-200 dark:hover:bg-white/[0.12]": variant === "secondary",
            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20": variant === "danger",
            "border border-slate-200/80 dark:border-white/[0.12] bg-white/90 dark:bg-white/[0.02] text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] shadow-xs": variant === "outline",
            "hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-zinc-200": variant === "ghost",
            "h-11 px-5 py-2.5": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-14 rounded-2xl px-8 text-base font-bold": size === "lg",
            "h-10 w-10 p-0": size === "icon",
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
