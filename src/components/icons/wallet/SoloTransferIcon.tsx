import React from "react";
import { IconProps } from "../types";

export function SoloTransferIcon({
  size = 24,
  className = "",
  variant = "duotone",
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Duotone Swoosh Aura */}
      {variant === "duotone" && (
        <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.18" />
      )}

      {/* Dynamic Diagonal Transfer Arrow & Orbit */}
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 7H17V15.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Orbit Curved Trajectory Path */}
      <path
        d="M4 12C4 16.4183 7.58172 20 12 20C14.5 20 16.7 18.8 18.2 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
