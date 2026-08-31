import React from "react";
import { IconProps } from "./types";

export function SoloAppLogoIcon({
  size = 36,
  className = "",
  variant = "duotone",
  primaryColor,
  secondaryColor
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Emerald to Teal Outer Background */}
        <linearGradient id="solo_logo_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor || "#10B981"} />
          <stop offset="1" stopColor={secondaryColor || "#0F766E"} />
        </linearGradient>

        {/* Luminous Royal Gold Center Gradient */}
        <linearGradient id="solo_logo_gold" x1="210" y1="178" x2="302" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF08A" />
          <stop offset="0.3" stopColor="#FBBF24" />
          <stop offset="0.75" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>

        {/* Soft Ambient Shadow */}
        <filter id="solo_logo_shadow" x="90" y="70" width="332" height="390" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodOpacity="0.22" floodColor="#000000" />
        </filter>

        {/* Gold Inner Glow */}
        <filter id="gold_glow" x="180" y="148" width="152" height="152" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.35" floodColor="#B45309" />
        </filter>
      </defs>

      {/* Squircle App Container */}
      <rect width="512" height="512" rx="130" fill="url(#solo_logo_bg)" />

      {/* Subtle Inner Specular Highlight */}
      <rect
        x="8"
        y="8"
        width="496"
        height="496"
        rx="122"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="12"
      />

      {/* Location Pin Base (Putih Bersih) */}
      <g filter="url(#solo_logo_shadow)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M256 96C185.3 96 128 153.3 128 224C128 316.5 256 432 256 432C256 432 384 316.5 384 224C384 153.3 326.7 96 256 96ZM256 288C220.7 288 192 259.3 192 224C192 188.7 220.7 160 256 160C291.3 160 320 188.7 320 224C320 259.3 291.3 288 256 288Z"
          fill="white"
        />

        {/* Royal Gold Center Core (Dot Tengah Emas Murni) */}
        <g filter="url(#gold_glow)">
          <circle cx="256" cy="224" r="50" fill="url(#solo_logo_gold)" />
          
          {/* Specular Highlight on Gold Dot */}
          <ellipse cx="244" cy="208" rx="18" ry="10" transform="rotate(-30 244 208)" fill="white" fillOpacity="0.45" />
          <circle cx="256" cy="224" r="49" stroke="#FEF08A" strokeWidth="2.5" strokeOpacity="0.75" />
        </g>
      </g>
    </svg>
  );
}
