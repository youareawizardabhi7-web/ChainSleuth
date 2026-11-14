"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function BrandLogo({
  size = "md",
  className = "",
  showIcon = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-[15px]",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {showIcon && (
        <div
          className={`${iconSizes[size]} rounded-lg bg-white text-black flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}
        >
          {/* Interconnected Ledger Graph Nodes Mark */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <circle cx="6" cy="12" r="2.2" />
            <circle cx="18" cy="6" r="2.2" />
            <circle cx="18" cy="18" r="2.2" />
            <path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8" />
          </svg>
        </div>
      )}

      <span
        className={`font-sans font-bold tracking-[-0.035em] text-white ${textSizes[size]}`}
      >
        ChainSleuth
      </span>
    </div>
  );
}
