import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Archive,
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  Building2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Fingerprint,
  FileCode,
  Flame,
} from "lucide-react";
import { getCase, getCaseClusters, downloadCourtEvidenceBundle, getEvidenceCertificate, generateAIReport } from "@/lib/api";
import { TraceResult, WalletNode, TransferEdge, WalletCluster, EvidenceCertResponse, AIReportResponse } from "@/lib/types";
import { RiskBadge } from "@/components/common/RiskBadge";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CaseWorkbenchSectionProps {
  initialCaseId?: string;
  onNavigateNotice?: (caseId: string) => void;
}

export function CaseWorkbenchSection({
  initialCaseId = "CASE-2026-TRON-8891",
  onNavigateNotice,
}: CaseWorkbenchSectionProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [traceData, setTraceData] = useState<TraceResult | null>(null);
  const [clusters, setClusters] = useState<WalletCluster[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNode, setSelectedNode] = useState<WalletNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<TransferEdge | null>(null);
  const [activeTab, setActiveTab] = useState<"inspector" | "clusters" | "advisory" | "deepdive">("inspector");

  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [graphMode, setGraphMode] = useState<"2D" | "3D">("2D");

  // Modals
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certData, setCertData] = useState<EvidenceCertResponse | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<AIReportResponse | null>(null);
  const [isDownloadingBundle, setIsDownloadingBundle] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCase(caseId), getCaseClusters(caseId)])
      .then(([caseRes, clusterRes]) => {
        setTraceData(caseRes);
        setClusters(clusterRes);
        if (caseRes.nodes?.length > 0) {
          setSelectedNode(caseRes.nodes[0]);
        }
      })
      .catch((err) => console.error("Error loading case:", err))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleDownloadBundle = async () => {
    setIsDownloadingBundle(true);
    try {
      await downloadCourtEvidenceBundle(caseId);
    } finally {
      setIsDownloadingBundle(false);
    }
  };

  const handleOpenCert = async () => {
    setIsCertModalOpen(true);
    const data = await getEvidenceCertificate(caseId);
    setCertData(data);
  };

  const handleOpenReport = async () => {
    setIsReportModalOpen(true);
    const data = await generateAIReport(caseId);
    setReportData(data);
  };

  // Node coordinates for responsive SVG canvas
  const nodePositions: Record<string, { x: number; y: number }> = {
    TFUNDER_TRX_992100412850192841: { x: 90, y: 130 },
    TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9: { x: 260, y: 220 },
    TBURNER_HOP1_921008273619203810: { x: 440, y: 160 },
    TPEEL_LAYER2_108273645192837461: { x: 610, y: 240 },
    TMULE_CELL_449102837461928374: { x: 770, y: 170 },
    TDEPOSIT_BINANCE_Seychelles_88: { x: 950, y: 260 },
    TBINANCE_HOT_WALLET_MAIN_01: { x: 1110, y: 200 },
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="glass-panel workspace-in p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold uppercase tracking-wider text-foreground">
                  Case Workbench: {caseId}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                  {traceData?.chain || "TRON"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Suspect Root:</span>
                {traceData && (
                  <AddressBadge address={traceData.suspect_address} truncateLength={6} />
                )}
                {traceData?.attribution && (
                  <>
                    <span>&bull;</span>
                    <span className="font-semibold text-primary">
                      {traceData.attribution.vasp_name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBundle}
              disabled={isDownloadingBundle}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/40 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-white hover:text-primary active:scale-[0.98] disabled:opacity-50"
            >
              {isDownloadingBundle ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : (
                <Archive className="size-3.5 text-primary" />
              )}
              <span>Evidence Bundle</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCert}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
            >
              <ShieldCheck className="size-3.5" />
              <span>Section 63 BSA Cert</span>
            </button>

            <button
              type="button"
              onClick={handleOpenReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-600 hover:text-white active:scale-[0.98]"
            >
              <Sparkles className="size-3.5 text-purple-600" />
              <span>AI Docket</span>
            </button>

            {onNavigateNotice && (
              <Button
                onClick={() => onNavigateNotice(caseId)}
                className="rounded-full shadow-sm text-xs h-8 px-4"
              >
                <FileText className="size-3.5" />
                Section 94 Notice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Graph + Inspector Panels */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Forensic Graph Canvas */}
        <div className="glass-panel workspace-in relative flex min-h-[580px] flex-col overflow-hidden lg:col-span-8 [animation-delay:100ms]">
          {/* Canvas Controls Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/30 bg-white/30 px-4 py-2.5 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Multi-Hop Traversal Graph
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                {traceData?.nodes?.length || 0} Wallets &bull; {traceData?.edges?.length || 0} Flows
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                className="grid size-7 place-items-center rounded-lg border border-white/40 bg-white/40 text-foreground hover:bg-white hover:text-primary transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                className="grid size-7 place-items-center rounded-lg border border-white/40 bg-white/40 text-foreground hover:bg-white hover:text-primary transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="grid size-7 place-items-center rounded-lg border border-white/40 bg-white/40 text-foreground hover:bg-white hover:text-primary transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowLabels((l) => !l)}
                className={cn(
                  "ml-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all",
                  showLabels
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-white/40 bg-white/40 text-muted-foreground"
                )}
              >
                Labels {showLabels ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => setGraphMode((m) => (m === "2D" ? "3D" : "2D"))}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all",
                  graphMode === "3D"
                    ? "border-purple-400 bg-purple-600 text-white"
                    : "border-white/40 bg-white/40 text-muted-foreground"
                )}
              >
                {graphMode} View
              </button>
            </div>
          </div>

          {/* Canvas SVG Area */}
          <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center select-none bg-radial from-white/20 via-transparent to-transparent">
            {loading ? (
              <div className="py-24 text-center font-mono text-xs text-muted-foreground">
                <Loader2 className="mx-auto mb-2 size-6 animate-spin text-primary" />
                Synthesizing multi-hop traversal graph…
              </div>
            ) : (
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 200ms ease-out",
                }}
                className="relative w-[1200px] h-[450px]"
              >
                <svg className="absolute inset-0 size-full pointer-events-none">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2E6C3B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1E4726" stopOpacity="0.8" />
                    </linearGradient>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2E6C3B" />
                    </marker>
                  </defs>

                  {/* Render Transfer Edges */}
                  {traceData?.edges?.map((edge) => {
                    const fromPos = nodePositions[edge.from] || { x: 100, y: 150 };
                    const toPos = nodePositions[edge.to] || { x: 300, y: 150 };
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2 - 18;
                    const isSelected = selectedEdge?.txHash === edge.txHash;

                    return (
                      <g key={edge.txHash} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedEdge(edge)}>
                        <path
                          d={`M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY - 12} ${toPos.x} ${toPos.y}`}
                          fill="none"
                          stroke={isSelected ? "#1E4726" : "url(#edgeGrad)"}
                          strokeWidth={isSelected ? 3.5 : 2}
                          strokeDasharray={isSelected ? "none" : "4 2"}
                          markerEnd="url(#arrow)"
                          className="transition-all"
                        />
                        {showLabels && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x="-36"
                              y="-10"
                              width="72"
                              height="18"
                              rx="9"
                              fill="rgba(255, 255, 255, 0.85)"
                              stroke="#D4DFD0"
                              strokeWidth="1"
                            />
                            <text
                              textAnchor="middle"
                              y="3"
                              className="font-mono text-[9px] font-bold fill-foreground"
                            >
                              {edge.value.toLocaleString()} {edge.token}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Render Interactive Nodes */}
                {traceData?.nodes?.map((node) => {
                  const pos = nodePositions[node.address] || { x: 200, y: 200 };
                  const isSelected = selectedNode?.address === node.address;
                  const isCritical = node.riskScore >= 75;
                  const isVasp = Boolean(node.isVasp);

                  return (
                    <div
                      key={node.address}
                      onClick={() => {
                        setSelectedNode(node);
                        setSelectedEdge(null);
                      }}
                      style={{ left: pos.x - 30, top: pos.y - 30 }}
                      className={cn(
                        "absolute size-15 rounded-full cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-1 group",
                        isSelected
                          ? "ring-4 ring-primary scale-110 shadow-lg z-20"
                          : "hover:scale-105 z-10"
                      )}
                    >
                      {/* Node Halo Ring */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full border-2 transition-transform duration-300",
                          isVasp
                            ? "border-blue-400 bg-blue-50/70 shadow-sm"
                            : isCritical
                            ? "border-rose-400 bg-rose-50/70 shadow-sm"
                            : "border-primary/50 bg-primary/10 shadow-sm"
                        )}
                      />

                      {/* Icon */}
                      <div className="relative z-10 flex flex-col items-center">
                        {isVasp ? (
                          <Building2 className="size-5 text-blue-700" />
                        ) : isCritical ? (
                          <Flame className="size-5 text-rose-600 animate-pulse" />
                        ) : (
                          <ShieldCheck className="size-5 text-primary" />
                        )}
                        <span className="font-mono text-[10px] font-bold text-foreground">
                          {node.riskScore}
                        </span>
                      </div>

                      {/* Floating Monospace Tag */}
                      {showLabels && (
                        <div className="absolute -bottom-6 w-36 text-center pointer-events-none">
                          <span className="rounded-md border border-white/60 bg-white/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-foreground shadow-xs truncate block">
                            {node.isVasp
                              ? "VASP Deposit"
                              : node.typologyFlags[0]
                              ? node.typologyFlags[0].replace(/_/g, " ")
                              : `${node.address.slice(0, 4)}…${node.address.slice(-4)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Graph Legend Footer */}
          <div className="border-t border-white/30 bg-white/20 px-4 py-2.5 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <span className="size-2.5 rounded-full bg-rose-500" /> Critical Risk (&ge;75)
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <span className="size-2.5 rounded-full bg-amber-500" /> Medium Risk
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-600">
                <span className="size-2.5 rounded-full bg-blue-500" /> Exchange VASP
              </span>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Click node or flow arrow to inspect forensic properties
            </div>
          </div>
        </div>

        {/* Right: Forensic Side Panel */}
        <div className="glass-panel workspace-in flex min-h-[580px] flex-col overflow-hidden lg:col-span-4 [animation-delay:200ms]">
          {/* Panel Tab Navigation */}
          <div className="grid grid-cols-4 border-b border-white/30 bg-white/20 text-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("inspector")}
              className={cn(
                "py-3 transition-colors",
                activeTab === "inspector"
                  ? "border-b-2 border-primary bg-primary/5 font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Inspector
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clusters")}
              className={cn(
                "py-3 transition-colors",
                activeTab === "clusters"
                  ? "border-b-2 border-primary bg-primary/5 font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Clusters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("advisory")}
              className={cn(
                "py-3 transition-colors",
                activeTab === "advisory"
                  ? "border-b-2 border-primary bg-primary/5 font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Advisory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deepdive")}
              className={cn(
                "py-3 transition-colors",
                activeTab === "deepdive"
                  ? "border-b-2 border-primary bg-primary/5 font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Deep Dive
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
            {activeTab === "inspector" && selectedNode && (
              <div className="space-y-4">
                {/* Node Summary Card */}
                <div className="rounded-2xl border border-white/50 bg-white/40 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Inspected Node
                    </span>
                    <RiskBadge score={selectedNode.riskScore} size="sm" />
                  </div>
                  <div className="font-mono text-xs break-all font-semibold text-foreground bg-white/60 p-2 rounded-xl border border-white/60 flex items-center justify-between">
                    <span>{selectedNode.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="rounded-xl bg-white/40 p-2 border border-white/40">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Balance</span>
                      <span className="font-mono font-bold text-foreground">{selectedNode.balance.toLocaleString()} USDT</span>
                    </div>
                    <div className="rounded-xl bg-white/40 p-2 border border-white/40">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">PMLA Flag</span>
                      <span className="font-mono font-bold text-rose-600">
                        {selectedNode.pmla_flag ? "FLAGGED" : "CLEAR"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Typology Flags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Forensic Typology Indicators
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.typologyFlags.map((flag) => (
                      <span
                        key={flag}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
                      >
                        <Tag className="size-3" />
                        {flag.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI / GNN Calibrated Explanation */}
                {selectedNode.explanation && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] uppercase tracking-wider">
                      <Sparkles className="size-3.5" />
                      Algorithmic Assessment
                    </div>
                    <p className="text-foreground/90">{selectedNode.explanation}</p>
                  </div>
                )}

                {/* Direct Flow Connections */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Observed Fund Flows
                  </span>
                  <div className="space-y-1.5">
                    {traceData?.edges
                      ?.filter((e) => e.from === selectedNode.address || e.to === selectedNode.address)
                      .map((flow) => {
                        const isInbound = flow.to === selectedNode.address;
                        return (
                          <div
                            key={flow.txHash}
                            className="flex items-center justify-between rounded-xl border border-white/40 bg-white/30 p-2 text-xs"
                          >
                            <span className={cn("font-bold text-[11px]", isInbound ? "text-emerald-700" : "text-rose-700")}>
                              {isInbound ? "+ INFLOW" : "- OUTFLOW"}
                            </span>
                            <span className="font-mono font-bold">{flow.value.toLocaleString()} {flow.token}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{new Date(flow.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "clusters" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Algorithmic graph clustering partitions entities into related criminal syndicate operations:
                </p>
                {clusters.map((cluster) => (
                  <div
                    key={cluster.cluster_id}
                    className="rounded-2xl border border-white/50 bg-white/40 p-3.5 space-y-2 transition-all hover:bg-white/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-foreground text-xs">
                        {cluster.dominant_entity || cluster.cluster_id}
                      </span>
                      <RiskBadge score={cluster.risk_score} size="sm" />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Type: <span className="font-bold text-foreground uppercase">{cluster.cluster_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/30">
                      <span className="text-muted-foreground">{cluster.member_addresses.length} Wallets identified</span>
                      <span className="font-mono font-bold text-primary">{cluster.total_volume.toLocaleString()} USDT</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "advisory" && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="size-4" />
                  Statutory Action Recommendations
                </div>
                {traceData?.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-primary/20 bg-white/40 p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span className="font-bold text-foreground text-xs">Statutory Step #{i + 1}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7">{rec}</p>
                  </div>
                ))}
                {traceData?.sla_cashout_alert && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{traceData.sla_cashout_alert}</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "deepdive" && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Chronological Hop Sequencing
                </span>
                <div className="space-y-2 font-mono text-xs">
                  {traceData?.edges?.map((edge, idx) => (
                    <div
                      key={edge.txHash}
                      className="rounded-xl border border-white/40 bg-white/30 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-bold uppercase text-primary">Hop #{idx + 1}</span>
                        <span>{new Date(edge.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="font-bold text-foreground">
                        {edge.value.toLocaleString()} {edge.token}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        Tx: {edge.txHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Section 63 BSA Evidence Certificate */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl p-6 space-y-4 bg-white/95 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  Section 63 BSA Digital Evidence Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-foreground">
              <div className="rounded-2xl border border-white/80 bg-white/60 p-4 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-bold">{certData?.certificate_id || "CERT-BSA-63-2026-8891"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Case Reference:</span>
                  <span className="font-bold">{caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investigating Officer:</span>
                  <span className="font-bold">{certData?.officer_name || "Inspector Rajesh Sharma"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cryptographic Algorithm:</span>
                  <span className="font-bold">SHA-256 (FIPS 180-4)</span>
                </div>
                <div className="pt-2 border-t border-border/30">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">SHA-256 Evidence Hash Stamp:</span>
                  <span className="text-[11px] text-primary break-all select-all font-bold">
                    {certData?.hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-muted-foreground text-[11px]">
                <p>
                  <strong>Statutory Declaration:</strong> {certData?.certification_statement}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCertModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                Print Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Forensic Investigation Docket */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4 bg-white/95 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-purple-600" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  AI Forensic Investigation Docket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-1.5">
                <div className="font-bold text-purple-900 text-xs uppercase tracking-wider">
                  Executive Intelligence Summary
                </div>
                <p className="text-foreground/90 leading-relaxed">
                  {reportData?.executive_summary}
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/60 p-4 space-y-1.5">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Money Trail Decomposition
                </div>
                <pre className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {reportData?.money_trail_analysis}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Statutory Grounds for Action
                </div>
                {reportData?.recommended_statutory_actions?.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-white/50 p-2.5 border border-white/60">
                    <Check className="size-4 text-primary shrink-0" />
                    <span className="text-foreground">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                Dismiss
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))}>
                <Copy className="size-3.5" />
                Copy JSON Docket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
