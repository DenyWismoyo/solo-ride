import React from "react";
import { IconProps } from "../types";

export function SoloGovPillarIcon({
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
      {/* Duotone Pediment & Base */}
      {variant === "duotone" && (
        <>
          <path
            d="M12 3L3 8H21L12 3Z"
            fill="currentColor"
            fillOpacity="0.28"
          />
          <rect x="3" y="19" width="18" height="2.5" rx="1" fill="currentColor" fillOpacity="0.22" />
        </>
      )}

      {/* Triangular Roof Pediment */}
      <path
        d="M12 3L3 8H21L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4 Majestic Municipal Pillars */}
      <path d="M6 8.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 8.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Foundation Base */}
      <path d="M2 19H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3.5 21.5H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
