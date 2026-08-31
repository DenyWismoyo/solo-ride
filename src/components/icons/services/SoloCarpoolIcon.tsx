import React from "react";
import { IconProps } from "../types";

export function SoloCarpoolIcon({
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
      {/* Duotone Passenger & Driver Aura */}
      {variant === "duotone" && (
        <>
          <circle cx="8" cy="7" r="3" fill="currentColor" fillOpacity="0.22" />
          <circle cx="16" cy="9" r="2.5" fill="currentColor" fillOpacity="0.22" />
          <path
            d="M3 18C3 15 5.5 13 8 13C10.5 13 13 15 13 18V19H3V18Z"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <path
            d="M13 18C13 15.8 14.5 14.5 16.5 14.5C18.5 14.5 20.5 15.8 20.5 18V19H13V18Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
        </>
      )}

      {/* Main Neighbour (Driver) */}
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M3 19C3 15.5 5.2 13 8 13C10.8 13 13 15.5 13 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Secondary Neighbour (Passenger / Titip) */}
      <circle cx="16.5" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M13.5 18.5C13.8 16 15 14.5 16.5 14.5C18.5 14.5 20.5 16 20.5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Shared Route Bridge / Connection */}
      <path
        d="M6 21H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
    </svg>
  );
}
