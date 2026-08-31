import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  variant?: "duotone" | "solid" | "outline";
  primaryColor?: string;
  secondaryColor?: string;
}
