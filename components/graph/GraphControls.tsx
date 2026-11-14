"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { GraphModeToggle, GraphMode } from "./GraphModeToggle";

interface GraphControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onRelayout?: () => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  graphMode?: GraphMode;
  onGraphModeChange?: (mode: GraphMode) => void;
}

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onFit,
  onRelayout,
  showLabels = true,
  onToggleLabels,
  graphMode = "2D",
  onGraphModeChange,
}: GraphControlsProps) {
  const { hopFilter, setHopFilter } = useAppStore();

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-white/80 select-none backdrop-blur-md">
      {/* Zoom & View Controls */}
      <div className="flex items-center gap-1.5">
        {onGraphModeChange && (
          <div className="mr-2 pr-2 border-r border-white/10">
            <GraphModeToggle mode={graphMode} onChange={onGraphModeChange} />
          </div>
        )}

        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onFit}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          title="Fit Graph to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onRelayout}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer flex items-center gap-1"
          title="Reset Graph Layout"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={onToggleLabels}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer flex items-center gap-1.5 border-l border-white/10 ml-1.5 pl-2.5"
          title="Toggle Graph Node Labels"
        >
          {showLabels ? (
            <Eye className="w-3.5 h-3.5 text-white/90" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-white/40" />
          )}
          <span className="text-[10px]">{showLabels ? "Hide Labels" : "Show Labels"}</span>
        </button>
      </div>

      {/* Hop Depth Filter Slider */}
      <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
        <Filter className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <span className="text-[11px] text-white/50">Hop Depth:</span>
        <input
          type="range"
          min={1}
          max={10}
          value={hopFilter}
          onChange={(e) => setHopFilter(Number(e.target.value))}
          className="w-20 accent-white bg-white/10 cursor-pointer h-1.5 rounded-lg"
        />
        <span className="w-4 text-center font-bold text-white font-mono">{hopFilter}</span>
      </div>
    </div>
  );
}
