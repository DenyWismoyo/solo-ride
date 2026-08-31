import React from "react";
import { IconProps } from "../types";

export function SoloCoinStampIcon({
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
      {/* Front & Shadow Coin Duotone */}
      {variant === "duotone" && (
        <>
          <circle cx="10.5" cy="12" r="7.5" fill="currentColor" fillOpacity="0.25" />
          <circle cx="15.5" cy="12" r="5.5" fill="currentColor" fillOpacity="0.15" />
        </>
      )}

      {/* Primary Gold Coin */}
      <circle cx="10.5" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="10.5" cy="12" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />

      {/* Embossed "S" or Rupiah Stamp Symbol */}
      <path
        d="M9 10C9 9.2 9.7 8.5 10.5 8.5C11.3 8.5 12 9.2 12 10C12 11.2 9 11.2 9 12.5C9 13.3 9.7 14 10.5 14C11.3 14 12 13.3 12 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Overlapping Secondary Coin Accent */}
      <path
        d="M17.5 7C18.8 8.2 19.5 10 19.5 12C19.5 15.3 17.3 18 14.2 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
