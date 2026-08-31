import React from "react";
import { IconProps } from "../types";

export function SoloTopupIcon({
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
      {/* Duotone Circle Fill */}
      {variant === "duotone" && (
        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.20" />
      )}

      {/* Main Circle Outline */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />

      {/* Plus Icon Center */}
      <path
        d="M12 7.5V16.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 12H16.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
