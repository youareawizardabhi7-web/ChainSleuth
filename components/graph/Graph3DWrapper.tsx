"use client";

import React, { forwardRef } from "react";
import dynamic from "next/dynamic";
import { WalletNode, TransferEdge } from "@/lib/types";
import { GraphViewRef } from "./GraphViewRef";
import { Loader2 } from "lucide-react";

interface Graph3DWrapperProps {
  nodes?: WalletNode[];
  edges?: TransferEdge[];
  suspectAddress?: string;
  selectedNode?: WalletNode | null;
  selectedEdge?: TransferEdge | null;
  onSelectNode?: (node: WalletNode | null) => void;
  onSelectEdge?: (edge: TransferEdge | null) => void;
  showLabels?: boolean;
  selectedClusterAddresses?: string[];
  timelineCutoffTs?: number | null;
  onFallbackTo2D?: () => void;
}

const DynamicGraph3D = dynamic(
  () => import("./Graph3D").then((mod) => mod.Graph3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] bg-[#030303] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3 font-mono text-xs select-none">
        <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
        <div className="text-white/40">Initializing 3D topological space...</div>
      </div>
    ),
  }
);

export const Graph3DWrapper = forwardRef<GraphViewRef, Graph3DWrapperProps>(
  function Graph3DWrapper(props, ref) {
    return <DynamicGraph3D ref={ref} {...props} />;
  }
);
