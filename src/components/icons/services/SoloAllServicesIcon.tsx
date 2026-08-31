import React from "react";
import { IconProps } from "../types";

export function SoloAllServicesIcon({
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
      {/* 4 Soft Squircles */}
      {variant === "duotone" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="2.5" fill="currentColor" fillOpacity="0.3" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="2.5" fill="currentColor" fillOpacity="0.15" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="2.5" fill="currentColor" fillOpacity="0.15" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="2.5" fill="currentColor" fillOpacity="0.3" />
        </>
      )}

      {/* 4 Squircles Outlines */}
      <rect x="3.5" y="3.5" width="7" height="7" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
