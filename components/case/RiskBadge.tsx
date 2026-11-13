"use client";

import React from "react";

interface RiskBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ score, size = "md" }: RiskBadgeProps) {
  let badgeStyle = "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
  let dotStyle = "bg-emerald-400";
  let label = "Low";

  if (score >= 75) {
    badgeStyle = "bg-rose-950/50 text-rose-300 border-rose-800/50";
    dotStyle = "bg-rose-400";
    label = "Critical";
  } else if (score >= 40) {
    badgeStyle = "bg-amber-950/40 text-amber-300 border-amber-800/40";
    dotStyle = "bg-amber-400";
    label = "Medium";
  }

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5"
      : size === "lg"
      ? "text-sm px-3.5 py-1.5 font-bold"
      : "text-xs px-2.5 py-1 font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono rounded-full border ${badgeStyle} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      <span>{score}/100</span>
      <span className="opacity-70 font-sans text-[10px] uppercase font-normal tracking-wide">
        {label}
      </span>
    </span>
  );
}
