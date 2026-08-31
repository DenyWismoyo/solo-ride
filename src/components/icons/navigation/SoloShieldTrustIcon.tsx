import React from "react";
import { IconProps } from "../types";

export function SoloShieldTrustIcon({
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
      {/* Duotone Shield Fill */}
      {variant === "duotone" && (
        <path
          d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
      )}

      {/* Primary Protective Shield Outline */}
      <path
        d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Verified Checkmark */}
      <path
        d="M8.5 11.5L11 14L15.5 9.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
