import React from "react";
import { IconProps } from "../types";

export function SoloIndustryCargoIcon({
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
      {/* Duotone Factory & Warehouse Body */}
      {variant === "duotone" && (
        <path
          d="M3 21V9L8 12V9L13 12V4H21V21H3Z"
          fill="currentColor"
          fillOpacity="0.20"
        />
      )}

      {/* Industrial Sawtooth Roof & Silhouette */}
      <path
        d="M3 21V9L8 12V9L13 12V4H21V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 21H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Cargo Shipping Container Windows / Doors */}
      <rect x="15.5" y="7" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="15.5" y="12" width="3" height="3" rx="0.5" fill="currentColor" />
      <path d="M6 16.5H10V21H6V16.5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
