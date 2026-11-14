"use client";

import React from "react";
import { Box, Layers } from "lucide-react";

export type GraphMode = "2D" | "3D";

interface GraphModeToggleProps {
  mode: GraphMode;
  onChange: (mode: GraphMode) => void;
}

export function GraphModeToggle({ mode, onChange }: GraphModeToggleProps) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-white/[0.04] border border-white/10 select-none">
      <button
        type="button"
        onClick={() => onChange("2D")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
          mode === "2D"
            ? "bg-white text-black font-semibold shadow-sm"
            : "text-white/40 hover:text-white/80"
        }`}
        title="Switch to 2D Graph View"
        aria-label="2D Graph Mode"
      >
        <Layers className="w-3 h-3" />
        <span>2D</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("3D")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
          mode === "3D"
            ? "bg-white text-black font-semibold shadow-sm"
            : "text-white/40 hover:text-white/80"
        }`}
        title="Switch to 3D Force Graph View"
        aria-label="3D Graph Mode"
      >
        <Box className="w-3 h-3" />
        <span>3D</span>
      </button>
    </div>
  );
}
