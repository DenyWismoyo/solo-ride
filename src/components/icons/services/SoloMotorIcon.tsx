import React from "react";
import { IconProps } from "../types";

export function SoloMotorIcon({
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
      {/* Soft Duotone Background Shapes */}
      {variant === "duotone" && (
        <>
          <circle cx="5.5" cy="17.5" r="3.5" fill="currentColor" fillOpacity="0.22" />
          <circle cx="18.5" cy="17.5" r="3.5" fill="currentColor" fillOpacity="0.22" />
          <path
            d="M8.5 17.5H15.5L14 11H9.5L8.5 17.5Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M15 6C15 4.61929 13.8807 3.5 12.5 3.5C11.1193 3.5 10 4.61929 10 6C10 7.38071 11.1193 8.5 12.5 8.5C13.8807 8.5 15 7.38071 15 6Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
        </>
      )}

      {/* Primary Linework & Structural Details */}
      {/* Front & Back Wheels */}
      <circle cx="5.5" cy="17.5" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18.5" cy="17.5" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="5.5" cy="17.5" r="1" fill="currentColor" />
      <circle cx="18.5" cy="17.5" r="1" fill="currentColor" />

      {/* Motor Chassis & Handlebars */}
      <path
        d="M5.5 17.5L9 11H14L18.5 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 11L15.5 6.5H17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rider Helmet / Visor */}
      <path
        d="M11 6C11 4.89543 11.8954 4 13 4C14.1046 4 15 4.89543 15 6C15 7.10457 14.1046 8 13 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Exhaust Speed Flame Accent */}
      <path
        d="M2 17.5H3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
