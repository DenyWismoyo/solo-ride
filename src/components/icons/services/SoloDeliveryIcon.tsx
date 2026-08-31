import React from "react";
import { IconProps } from "../types";

export function SoloDeliveryIcon({
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
      {/* 3D Isometric Box Duotone Top & Left Face */}
      {variant === "duotone" && (
        <>
          <path
            d="M12 2.5L20.5 7.5L12 12.5L3.5 7.5L12 2.5Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path
            d="M3.5 7.5L12 12.5V21.5L3.5 16.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path
            d="M12 12.5L20.5 7.5V16.5L12 21.5V12.5Z"
            fill="currentColor"
            fillOpacity="0.20"
          />
        </>
      )}

      {/* Primary Cube Lines */}
      <path
        d="M12 2.5L20.5 7.5V16.5L12 21.5L3.5 16.5V7.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5V21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5L20.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5L3.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Package Tape & Fast Delivery Wings Accent */}
      <path
        d="M7.7 5L16.2 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M2 11.5H4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M1 14.5H3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
