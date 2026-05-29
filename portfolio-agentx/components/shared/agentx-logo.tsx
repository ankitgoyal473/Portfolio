import React from "react";

interface AgentXLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeConfig = {
  sm: { svgSize: 20, textClass: "text-lg font-bold" },
  md: { svgSize: 28, textClass: "text-xl font-bold" },
  lg: { svgSize: 40, textClass: "text-3xl font-bold" },
};

export function AgentXLogo({ size = "md", showText = true }: AgentXLogoProps) {
  const { svgSize, textClass } = sizeConfig[size];

  return (
    <span className="inline-flex items-center gap-2 text-accent">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Hexagon outline */}
        <polygon
          points="20,2 36,11 36,29 20,38 4,29 4,11"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Connecting lines forming a triangle inside */}
        <line
          x1="20"
          y1="2"
          x2="36"
          y2="29"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="36"
          y1="29"
          x2="4"
          y2="29"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="4"
          y1="29"
          x2="20"
          y2="2"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        {/* Three node dots at alternating vertices: top, bottom-right, bottom-left */}
        <circle cx="20" cy="2" r="2.5" fill="currentColor" />
        <circle cx="36" cy="29" r="2.5" fill="currentColor" />
        <circle cx="4" cy="29" r="2.5" fill="currentColor" />
      </svg>
      {showText && (
        <span className={textClass}>
          AGent<span className="text-accent">X</span>
        </span>
      )}
    </span>
  );
}
