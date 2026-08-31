import React from "react";
import { IconProps } from "../types";

export function SoloMarketIcon({
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
      {/* Duotone Awning & Store Body */}
      {variant === "duotone" && (
        <>
          <path
            d="M3 8.5L4.5 4H19.5L21 8.5C21 9.8 20 11 18.8 11C17.5 11 16.5 9.8 16.5 8.5C16.5 9.8 15.5 11 14.2 11C13 11 12 9.8 12 8.5C12 9.8 11 11 9.8 11C8.5 11 7.5 9.8 7.5 8.5C7.5 9.8 6.5 11 5.2 11C4 11 3 9.8 3 8.5Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path
            d="M4.5 11V20C4.5 20.5523 4.94772 21 5.5 21H18.5C19.0523 21 19.5 20.5523 19.5 20V11H4.5Z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path
            d="M9 21V15H15V21H9Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
        </>
      )}

      {/* Awning Scallops & Outline */}
      <path
        d="M3 8.5L4.5 4H19.5L21 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 8.5C3 9.9 4.1 11 5.25 11C6.4 11 7.5 9.9 7.5 8.5C7.5 9.9 8.6 11 9.75 11C10.9 11 12 9.9 12 8.5C12 9.9 13.1 11 14.25 11C15.4 11 16.5 9.9 16.5 8.5C16.5 9.9 17.6 11 18.75 11C19.9 11 21 9.9 21 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Store Walls & Base */}
      <path
        d="M4.5 11V20C4.5 20.6 4.9 21 5.5 21H18.5C19.1 21 19.5 20.6 19.5 20V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Store Doorway */}
      <path
        d="M9 21V15H15V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
