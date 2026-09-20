"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GraphCanvas, GraphCanvasRef } from "@/components/graph/GraphCanvas";
import { GraphControls } from "@/components/graph/GraphControls";
import { WalletDetailPanel } from "@/components/panels/WalletDetailPanel";
import { RiskBadge } from "@/components/case/RiskBadge";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { getCase } from "@/lib/api";
import { TraceResult, WalletNode, TransferEdge } from "@/lib/types";
import { ShieldAlert, ArrowRightLeft, X } from "lucide-react";

export default function CaseWorkbenchPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const graphCanvasRef = useRef<GraphCanvasRef>(null);

  const [traceData, setTraceData] = useState<TraceResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<TransferEdge | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCase(caseId)
      .then((data) => {
        setTraceData(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [caseId]);

  return (
    <AppShell>
      <div className="flex flex-col h-full space-y-3 font-mono text-xs select-none">
        {/* Top Graph Header Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <h1 className="text-sm font-bold font-sans text-slate-100 uppercase tracking-wider">
                Case Workbench: {caseId}
              </h1>
            </div>

            {traceData && (
              <>
                <span className="text-slate-700">|</span>
                <span className="text-slate-500 font-sans text-[11px]">Suspect Wallet:</span>
                <AddressBadge address={traceData.suspect_address} truncateLength={6} />
                <span className="text-slate-700">|</span>
                <span className="uppercase text-slate-300 font-bold bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-[10px]">
                  {traceData.chain || "TRON"}
                </span>
              </>
            )}
          </div>

          {traceData && <RiskBadge score={traceData.overall_risk_score} size="md" />}
        </div>

        {/* Three-Column Investigation Workspace */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
          {/* CENTER: Cytoscape Graph Canvas Area (8 cols) */}
          <div className="col-span-8 flex flex-col space-y-2 h-full min-h-0 relative">
            <GraphControls
              onZoomIn={() => graphCanvasRef.current?.zoomIn()}
              onZoomOut={() => graphCanvasRef.current?.zoomOut()}
              onFit={() => graphCanvasRef.current?.fit()}
              onRelayout={() => graphCanvasRef.current?.relayout()}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
            />

            <div className="flex-1 min-h-0 relative">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded space-y-3">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-slate-400 font-mono text-xs">
                    Building Cypher path graph topology...
                  </div>
                </div>
              ) : !traceData || traceData.nodes.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded space-y-2 text-slate-500 font-mono text-xs">
                  <ShieldAlert className="w-6 h-6 text-slate-700" />
                  <div>No investigation transaction path found for this case.</div>
                </div>
              ) : (
                <GraphCanvas
                  ref={graphCanvasRef}
                  nodes={traceData.nodes}
                  edges={traceData.edges}
                  showLabels={showLabels}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                  }}
                  onSelectEdge={(edge) => {
                    setSelectedEdge(edge);
                  }}
                />
              )}

              {/* Transaction Edge Click Popover */}
              {selectedEdge && (
                <div className="absolute top-4 left-4 z-30 w-80 bg-slate-900/95 backdrop-blur border border-teal-800/80 rounded p-3 text-xs shadow-2xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-teal-300 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Transaction Hop Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEdge(null)}
                      className="text-slate-500 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Transaction Hash</span>
                    <AddressBadge address={selectedEdge.txHash} truncateLength={8} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block text-[10px]">From Address</span>
                      <AddressBadge address={selectedEdge.from} truncateLength={4} />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">To Address</span>
                      <AddressBadge address={selectedEdge.to} truncateLength={4} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">Transferred Value:</span>
                    <span className="font-bold text-teal-300">
                      {selectedEdge.value.toLocaleString()} {selectedEdge.token}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    {new Date(selectedEdge.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: WalletDetailPanel / VaspAttributionCard (4 cols) */}
          <div className="col-span-4 h-full min-h-0 overflow-y-auto">
            <WalletDetailPanel
              node={selectedNode}
              edges={traceData?.edges}
              attribution={traceData?.attribution}
              caseId={caseId}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
