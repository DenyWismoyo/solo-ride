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
            "bg-zinc-800/80 text-zinc-100 border border-zinc-700/80 shadow-sm hover:bg-zinc-800": variant === "secondary",
            "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20": variant === "danger",
            "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800": variant === "outline",
            "hover:bg-zinc-800/60 text-zinc-200": variant === "ghost",
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
