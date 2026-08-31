import React from "react";
import { IconProps } from "../types";

export function SoloQrisIcon({
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
      {/* Duotone Scanner Frame Center */}
      {variant === "duotone" && (
        <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" fillOpacity="0.15" />
      )}

      {/* 4 Corner Targeting Brackets */}
      <path
        d="M7 3H4.5C3.7 3 3 3.7 3 4.5V7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 3H19.5C20.3 3 21 3.7 21 4.5V7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 17V19.5C3 20.3 3.7 21 4.5 21H7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 17V19.5C21 20.3 20.3 21 19.5 21H17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* QR Code Pixel Matrix Blocks */}
      <rect x="7" y="7" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="14" y="7" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" />

      {/* Central Laser Beam Line */}
      <path
        d="M4 12H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
    </svg>
  );
}
