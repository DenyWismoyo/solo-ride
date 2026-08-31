import React from "react";
import { IconProps } from "../types";

export function SoloFoodIcon({
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
      {/* Duotone Bowl Fill & Food Aroma */}
      {variant === "duotone" && (
        <>
          <path
            d="M3 11C3 15.9706 7.02944 20 12 20C16.9706 20 21 15.9706 21 11H3Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          <path
            d="M9 20H15V21.5C15 22.0523 14.5523 22.5 14 22.5H10C9.44772 22.5 9 22.0523 9 21.5V20Z"
            fill="currentColor"
            fillOpacity="0.30"
          />
        </>
      )}

      {/* Traditional Food Bowl Base */}
      <path
        d="M3 11C3 15.9706 7.02944 20 12 20C16.9706 20 21 15.9706 21 11H3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bowl Rim */}
      <path
        d="M2.5 11H21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bowl Foot */}
      <path
        d="M8.5 20H15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Chopsticks crossing into the bowl */}
      <path
        d="M17.5 2.5L10 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20.5 3.5L12 11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Fresh Steaming Aroma Steam Trails */}
      <path
        d="M6 7.5C6 6.5 7 5.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7C9 6 10 5 10 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
