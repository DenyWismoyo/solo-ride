import React from "react";
import { IconProps } from "../types";

export function SoloMartIcon({
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
      {/* Duotone Bag & Medical Cross */}
      {variant === "duotone" && (
        <>
          <path
            d="M4.5 8.5C4.5 7.4 5.4 6.5 6.5 6.5H17.5C18.6 6.5 19.5 7.4 19.5 8.5L20.5 20C20.5 20.6 20.1 21 19.5 21H4.5C3.9 21 3.5 20.6 3.5 20L4.5 8.5Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path
            d="M10.5 12H13.5V10.5C13.5 9.7 12.8 9 12 9C11.2 9 10.5 9.7 10.5 10.5V12Z"
            fill="currentColor"
            fillOpacity="0.30"
          />
        </>
      )}

      {/* Bag Outline */}
      <path
        d="M4.5 8.5C4.5 7.4 5.4 6.5 6.5 6.5H17.5C18.6 6.5 19.5 7.4 19.5 8.5L20.5 20C20.5 20.6 20.1 21 19.5 21H4.5C3.9 21 3.5 20.6 3.5 20L4.5 8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bag Handle */}
      <path
        d="M9 6.5V5C9 3.3 10.3 2 12 2C13.7 2 15 3.3 15 5V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Health / Pharmacy Cross Emblem in Center */}
      <path
        d="M12 11V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 14H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
