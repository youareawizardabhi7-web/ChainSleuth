"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Graph3DWrapper } from "@/components/graph/Graph3DWrapper";
import { GraphViewRef } from "@/components/graph/GraphViewRef";
import { GraphControls } from "@/components/graph/GraphControls";
import { GraphMode } from "@/components/graph/GraphModeToggle";
import { WalletDetailPanel } from "@/components/panels/WalletDetailPanel";
import { ForensicClustersPanel } from "@/components/panels/ForensicClustersPanel";
import { InvestigativeAdvisoryPanel } from "@/components/panels/InvestigativeAdvisoryPanel";
import { ForensicDeepDivePanel } from "@/components/case/ForensicDeepDivePanel";
import { RiskBadge } from "@/components/case/RiskBadge";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { getCase, downloadCourtEvidenceBundle } from "@/lib/api";
import { TraceResult, WalletNode, TransferEdge, WalletCluster } from "@/lib/types";
import { EvidenceCertModal } from "@/components/case/EvidenceCertModal";
import { AIInvestigationDocketModal } from "@/components/case/AIInvestigationDocketModal";
import {
  ShieldAlert,
  ArrowRightLeft,
  X,
  Boxes,
  XCircle,
  FileCheck,
  Archive,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react";

export default function CaseWorkbenchPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const graphRef = useRef<GraphViewRef>(null);

  const [traceData, setTraceData] = useState<TraceResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<TransferEdge | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<WalletCluster | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"node_inspector" | "clusters">("node_inspector");
  const [showLabels, setShowLabels] = useState(true);
  const [graphMode, setGraphMode] = useState<GraphMode>("2D");
  const [loading, setLoading] = useState(true);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDownloadingBundle, setIsDownloadingBundle] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);

  const handleDownloadBundle = async () => {
    if (isDownloadingBundle) return;
    setIsDownloadingBundle(true);
    setBundleError(null);
    try {
      await downloadCourtEvidenceBundle(caseId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to download evidence bundle.";
      setBundleError(msg);
    } finally {
      setIsDownloadingBundle(false);
    }
  };

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

  const selectedClusterAddresses = selectedCluster?.member_addresses || [];

  const handleSelectNodeFromDeepDive = (addr: string) => {
    if (!traceData?.nodes) return;
    const matchingNode = traceData.nodes.find(
      (n) => n.address.toLowerCase() === addr.toLowerCase()
    );
    if (matchingNode) {
      setSelectedNode(matchingNode);
      setSelectedEdge(null);
      setRightPanelTab("node_inspector");
    }
  };

  const formattedCaseId = `#CS-${caseId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;

  return (
    <AppShell>
      <div className="flex flex-col space-y-4 select-none pb-8">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3.5 border-b border-white/5 gap-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="font-instrument text-2xl sm:text-3xl font-normal text-white tracking-tight">
                Case Dossier
              </h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/70 border border-white/10 font-medium">
                {formattedCaseId}
              </span>
            </div>

            {traceData && (
              <>
                <span className="text-white/20 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                  <span>Target:</span>
                  <AddressBadge address={traceData.suspect_address} truncateLength={6} />
                </div>
                <span className="uppercase text-white/80 font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 font-medium">
                  {traceData.chain || "TRON"}
                </span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBundle}
              disabled={isDownloadingBundle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
              title="Download Evidence Bundle (.ZIP)"
            >
              {isDownloadingBundle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5 text-white/60" />
              )}
              <span>Evidence Bundle</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
              title="View Cryptographic Certificate"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
              <span>Certificate</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
              title="Generate AI Forensic Report"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>AI Report</span>
            </button>

            <Link
              href={`/case/${caseId}/notice`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-white/90 font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              title="Issue Compliance Notice"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Compliance Notice</span>
            </Link>

            <Link
              href={`/case/${caseId}/fir`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
            >
              <FileCheck className="w-3.5 h-3.5 text-white/60" />
              <span>Case Docket</span>
            </Link>

            {traceData && <RiskBadge score={traceData.overall_risk_score} size="md" />}
          </div>
        </div>

        {bundleError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{bundleError}</span>
            </div>
            <button
              type="button"
              onClick={() => setBundleError(null)}
              className="text-rose-400 hover:text-white font-bold px-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Three-Column Investigation Workspace */}
        <div className="grid grid-cols-12 gap-4 h-[600px] min-h-[600px]">
          {/* CENTER: Graph Canvas Area (8 cols) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col space-y-2 h-full min-h-0 relative">
            <GraphControls
              graphMode={graphMode}
              onGraphModeChange={setGraphMode}
              onZoomIn={() => graphRef.current?.zoomIn()}
              onZoomOut={() => graphRef.current?.zoomOut()}
              onFit={() => graphRef.current?.fit()}
              onRelayout={() => graphRef.current?.resetView()}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
            />

            {/* Floating Active Cluster Banner */}
            {selectedCluster && (
              <div className="absolute top-14 left-4 z-20 bg-[#080808]/90 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-3 text-white shadow-xl">
                <span className="flex items-center gap-1.5 font-sans font-medium">
                  <Boxes className="w-3.5 h-3.5 text-white/80" />
                  Cluster: {selectedCluster.label || "Active"}
                </span>
                <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-md font-mono border border-white/10">
                  {(selectedCluster.member_addresses || []).length} Wallets
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCluster(null)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 hover:text-rose-200 rounded-md border border-white/10 text-[10px] transition-colors cursor-pointer"
                >
                  <XCircle className="w-3 h-3 text-rose-400" />
                  <span>Deselect</span>
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 relative border border-white/5 rounded-2xl bg-[#030303] overflow-hidden">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                  <div className="text-white/40 font-mono text-xs">
                    Synthesizing multi-hop graph topology...
                  </div>
                </div>
              ) : !traceData || traceData.nodes.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-white/40 font-mono text-xs">
                  <ShieldAlert className="w-6 h-6 text-white/20" />
                  <div>No investigation transaction path found for this case.</div>
                </div>
              ) : graphMode === "2D" ? (
                <GraphCanvas
                  ref={graphRef}
                  nodes={traceData.nodes}
                  edges={traceData.edges}
                  showLabels={showLabels}
                  selectedClusterAddresses={selectedClusterAddresses}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                  }}
                  onSelectEdge={(edge) => {
                    setSelectedEdge(edge);
                  }}
                />
              ) : (
                <Graph3DWrapper
                  ref={graphRef}
                  nodes={traceData.nodes}
                  edges={traceData.edges}
                  suspectAddress={traceData.suspect_address}
                  selectedNode={selectedNode}
                  selectedEdge={selectedEdge}
                  showLabels={showLabels}
                  selectedClusterAddresses={selectedClusterAddresses}
                  onSelectNode={(node) => {
                    setSelectedNode(node);
                    setSelectedEdge(null);
                  }}
                  onSelectEdge={(edge) => {
                    setSelectedEdge(edge);
                  }}
                  onFallbackTo2D={() => setGraphMode("2D")}
                />
              )}

              {/* Transaction Edge Click Popover */}
              {selectedEdge && (
                <div className="absolute top-4 left-4 z-30 w-80 bg-[#0a0a0a]/95 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-xs shadow-2xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-semibold text-white flex items-center gap-1.5 font-sans">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-white/70" />
                      Transaction Hop Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEdge(null)}
                      className="text-white/40 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-white/40 text-[10px] block font-mono uppercase tracking-wider mb-0.5">
                      Transaction Hash
                    </span>
                    {selectedEdge.txHash ? (
                      <AddressBadge address={selectedEdge.txHash} truncateLength={8} />
                    ) : (
                      <span className="text-white/40 font-mono">N/A</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-white/40 block text-[10px] font-mono uppercase tracking-wider mb-0.5">
                        From
                      </span>
                      {selectedEdge.from ? (
                        <AddressBadge address={selectedEdge.from} truncateLength={4} />
                      ) : (
                        <span className="text-white/40 font-mono">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="text-white/40 block text-[10px] font-mono uppercase tracking-wider mb-0.5">
                        To
                      </span>
                      {selectedEdge.to ? (
                        <AddressBadge address={selectedEdge.to} truncateLength={4} />
                      ) : (
                        <span className="text-white/40 font-mono">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
                    <span className="text-white/40">Transferred:</span>
                    <span className="font-bold text-white">
                      {selectedEdge.value !== undefined && selectedEdge.value !== null
                        ? `${selectedEdge.value.toLocaleString()} ${
                            selectedEdge.token || (traceData?.chain === "bitcoin" ? "BTC" : "N/A")
                          }`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="text-[10px] text-white/30 text-right font-mono">
                    {selectedEdge.timestamp ? new Date(selectedEdge.timestamp).toLocaleString() : "N/A"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Investigative Advisory + Tabbed Panel (4 cols) */}
          <div className="col-span-12 lg:col-span-4 h-full min-h-0 overflow-y-auto space-y-3 pr-0.5 flex flex-col">
            {traceData && (traceData.recommendations?.length || traceData.sla_cashout_alert) && (
              <InvestigativeAdvisoryPanel
                recommendations={traceData.recommendations}
                slaAlert={traceData.sla_cashout_alert}
                caseId={caseId}
              />
            )}

            {/* Tab Selector Header */}
            <div className="inline-flex w-full p-1 rounded-xl bg-white/[0.03] border border-white/10 shrink-0 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setRightPanelTab("node_inspector")}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                  rightPanelTab === "node_inspector"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Node Inspector</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab("clusters")}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                  rightPanelTab === "clusters"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                <Boxes className="w-3.5 h-3.5 shrink-0" />
                <span>Forensic Clusters</span>
                {selectedCluster && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            {/* Tab Panel Content */}
            <div className="flex-1 min-h-0">
              {rightPanelTab === "node_inspector" ? (
                <WalletDetailPanel
                  node={selectedNode}
                  edges={traceData?.edges}
                  attribution={traceData?.attribution}
                  caseId={caseId}
                />
              ) : (
                <ForensicClustersPanel
                  caseId={caseId}
                  selectedCluster={selectedCluster}
                  onSelectCluster={setSelectedCluster}
                  visibleGraphNodeAddresses={traceData?.nodes?.map((n) => n.address) || []}
                />
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Full-Width Section for Forensic Deep Dive Analysis below Workbench Grid */}
        <div className="pt-2">
          <ForensicDeepDivePanel
            caseId={caseId}
            graphNodes={traceData?.nodes}
            onSelectNode={handleSelectNodeFromDeepDive}
          />
        </div>
      </div>

      <EvidenceCertModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        caseId={caseId}
      />

      <AIInvestigationDocketModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        caseId={caseId}
        traceData={traceData}
      />
    </AppShell>
  );
}
