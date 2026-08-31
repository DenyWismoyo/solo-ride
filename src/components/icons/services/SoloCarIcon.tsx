import React from "react";
import { IconProps } from "../types";

export function SoloCarIcon({
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
      {/* Duotone Fill */}
      {variant === "duotone" && (
        <>
          <path
            d="M3 13.5C3 12.3954 3.89543 11.5 5 11.5L6.8 6.5C7.2 5.3 8.3 4.5 9.6 4.5H14.4C15.7 4.5 16.8 5.3 17.2 6.5L19 11.5C20.1046 11.5 21 12.3954 21 13.5V17C21 17.5523 20.5523 18 20 18H18.5C18.5 16.9 17.6 16 16.5 16C15.4 16 14.5 16.9 14.5 18H9.5C9.5 16.9 8.6 16 7.5 16C6.4 16 5.5 16.9 5.5 18H4C3.44772 18 3 17.5523 3 17V13.5Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path
            d="M7 11.5L8.4 6.8C8.6 6.3 9 6 9.6 6H14.4C15 6 15.4 6.3 15.6 6.8L17 11.5H7Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </>
      )}

      {/* Car Body Outer Shell */}
      <path
        d="M3.5 13C3.5 12.2 4 11.5 4.8 11.5L6.6 6.5C7.1 5.3 8.2 4.5 9.5 4.5H14.5C15.8 4.5 16.9 5.3 17.4 6.5L19.2 11.5C20 11.5 20.5 12.2 20.5 13V17C20.5 17.6 20.1 18 19.5 18H18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 18H4.5C3.9 18 3.5 17.6 3.5 17V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Windshield */}
      <path
        d="M6.8 11.5L8.3 6.8C8.5 6.3 9 6 9.5 6H14.5C15 6 15.5 6.3 15.7 6.8L17.2 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front Wheels */}
      <circle cx="7.5" cy="18" r="2.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="18" r="2.2" stroke="currentColor" strokeWidth="2" />

      {/* Headlights */}
      <circle cx="6" cy="14" r="1" fill="currentColor" />
      <circle cx="18" cy="14" r="1" fill="currentColor" />

      {/* Bumper Grille */}
      <path d="M10 14.5H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
