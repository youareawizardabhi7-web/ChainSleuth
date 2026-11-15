"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, SkipForward, SkipBack, Zap } from "lucide-react";
import { TransferEdge } from "@/lib/types";

interface TimelineScrubberProps {
  edges: TransferEdge[];
  activeCutoffTs: number | null;
  onCutoffChange: (ts: number | null) => void;
}

export function TimelineScrubber({
  edges,
  activeCutoffTs,
  onCutoffChange,
}: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract unique sorted timestamps from edges
  const sortedTimestamps = useMemo(() => {
    const tsSet = new Set<number>();
    edges.forEach((e) => {
      if (e.timestamp) {
        const t = new Date(e.timestamp).getTime();
        if (!isNaN(t) && t > 0) {
          tsSet.add(t);
        }
      }
    });
    return Array.from(tsSet).sort((a, b) => a - b);
  }, [edges]);

  // Current step index in sortedTimestamps (defaults to end/full view)
  const currentIndex = useMemo(() => {
    if (activeCutoffTs === null || sortedTimestamps.length === 0) {
      return sortedTimestamps.length - 1;
    }
    const idx = sortedTimestamps.findIndex((t) => t >= activeCutoffTs);
    return idx === -1 ? sortedTimestamps.length - 1 : idx;
  }, [activeCutoffTs, sortedTimestamps]);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const isAtEnd = activeCutoffTs === null || currentIndex >= sortedTimestamps.length - 1;

  // Toggle Play / Pause with instant restart from index 0 if at the end
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (isAtEnd) {
      // Clean restart from the very first event
      onCutoffChange(sortedTimestamps[0]);
    }
    setIsPlaying(true);
  };

  // Playback timer loop
  useEffect(() => {
    if (isPlaying && sortedTimestamps.length > 1) {
      const intervalMs = Math.round(320 / speed);
      playTimerRef.current = setInterval(() => {
        const curr = currentIndexRef.current;
        const next = curr + 1;
        if (next >= sortedTimestamps.length) {
          setIsPlaying(false);
          onCutoffChange(null); // Return to full view cleanly at the end
        } else {
          onCutoffChange(sortedTimestamps[next]);
        }
      }, intervalMs);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, sortedTimestamps, speed, onCutoffChange]);

  if (sortedTimestamps.length <= 1) {
    return null;
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    const idx = parseInt(e.target.value, 10);
    if (idx >= sortedTimestamps.length - 1) {
      onCutoffChange(null); // Full view
    } else {
      onCutoffChange(sortedTimestamps[idx]);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    const targetIdx = activeCutoffTs === null ? sortedTimestamps.length - 2 : Math.max(0, currentIndex - 1);
    onCutoffChange(sortedTimestamps[targetIdx]);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    const nextIdx = currentIndex + 1;
    if (nextIdx >= sortedTimestamps.length - 1) {
      onCutoffChange(null);
    } else {
      onCutoffChange(sortedTimestamps[nextIdx]);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onCutoffChange(null);
  };

  const handleCycleSpeed = () => {
    setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
  };

  const formattedTime = useMemo(() => {
    if (activeCutoffTs === null) {
      return "All Hops (Full Trail)";
    }
    const d = new Date(activeCutoffTs);
    return `${d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  }, [activeCutoffTs]);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl text-xs font-mono text-white/80 shadow-2xl select-none">
      {/* Play / Step Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            isPlaying
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
              : "bg-white/[0.04] hover:bg-white/[0.08] text-white/90 border-white/10"
          }`}
          title={
            isPlaying
              ? "Pause Timeline Replay"
              : isAtEnd
              ? "Replay Fund Flow from Start"
              : "Resume Fund Flow Replay"
          }
          aria-label={isPlaying ? "Pause Replay" : "Play Replay"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : isAtEnd ? (
            <RotateCcw className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={handleStepBack}
          disabled={currentIndex <= 0}
          className="p-1 rounded-md text-white/50 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          title="Previous Transaction Step"
          aria-label="Step Back"
        >
          <SkipBack className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={handleStepForward}
          disabled={activeCutoffTs === null}
          className="p-1 rounded-md text-white/50 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
          title="Next Transaction Step"
          aria-label="Step Forward"
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Scrub Slider */}
      <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[170px]">
        <input
          type="range"
          min={0}
          max={sortedTimestamps.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full accent-white bg-white/10 cursor-pointer h-1 rounded-lg"
          aria-label="Timeline Scrubber"
        />
      </div>

      {/* Timestamp Status Pill */}
      <div className="flex items-center gap-1.5 text-[11px] text-white/70 min-w-[135px]">
        <Clock className="w-3 h-3 text-white/40 shrink-0" />
        <span className="truncate">{formattedTime}</span>
      </div>

      {/* Step Counter */}
      <span className="text-[10px] text-white/40 hidden sm:inline">
        {currentIndex + 1}/{sortedTimestamps.length}
      </span>

      {/* Speed Multiplier Pill */}
      <button
        type="button"
        onClick={handleCycleSpeed}
        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-[10px] font-mono border border-white/5 transition-colors cursor-pointer"
        title="Cycle Playback Speed (1x, 2x, 4x)"
      >
        <Zap className="w-2.5 h-2.5 text-amber-400" />
        <span>{speed}x</span>
      </button>

      {/* Reset / Live Button */}
      {activeCutoffTs !== null && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] border border-white/10 transition-colors cursor-pointer shrink-0"
          title="Reset to Full Graph View"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Show Full</span>
        </button>
      )}
    </div>
  );
}
