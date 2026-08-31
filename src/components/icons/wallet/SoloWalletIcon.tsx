import React from "react";
import { IconProps } from "../types";

export function SoloWalletIcon({
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
      {/* Wallet Body Duotone */}
      {variant === "duotone" && (
        <>
          <path
            d="M3 7.5C3 6.1 4.1 5 5.5 5H18.5C19.9 5 21 6.1 21 7.5V17.5C21 18.9 19.9 20 18.5 20H5.5C4.1 20 3 18.9 3 17.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          <path
            d="M16 10H21V15H16C14.6 15 13.5 13.9 13.5 12.5C13.5 11.1 14.6 10 16 10Z"
            fill="currentColor"
            fillOpacity="0.35"
          />
        </>
      )}

      {/* Outer Wallet Contour */}
      <path
        d="M19 5H5.5C4.1 5 3 6.1 3 7.5V17.5C3 18.9 4.1 20 5.5 20H18.5C19.9 20 21 18.9 21 17.5V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 8.5C3 7.1 4.1 6 5.5 6H18.5C19.9 6 21 7.1 21 8.5V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Card Flap & Cash Coin Lock */}
      <path
        d="M16 10H21V15H16C14.6 15 13.5 13.9 13.5 12.5C13.5 11.1 14.6 10 16 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
