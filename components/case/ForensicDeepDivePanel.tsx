"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CaseBridgesResponse,
  CasePrivacyResponse,
  LayeringAnalysisResponse,
  WalletNode,
} from "@/lib/types";
import {
  getCaseBridges,
  getCasePrivacy,
  getCaseLayering,
} from "@/lib/api";
import {
  ArrowRightLeft,
  ShieldAlert,
  Layers,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface ForensicDeepDivePanelProps {
  caseId: string;
  graphNodes?: WalletNode[];
  onSelectNode?: (address: string) => void;
}

type TabType = "bridges" | "privacy" | "layering";

function truncateHash(hash: string, length = 8): string {
  if (!hash) return "N/A";
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

function getExplorerUrl(txHash?: string | null, chain?: string | null): string | null {
  if (!txHash || typeof txHash !== "string" || !txHash.trim()) return null;
  if (!chain || typeof chain !== "string" || !chain.trim()) return null;
  const c = chain.toLowerCase().trim();
  const hash = txHash.trim();
  if (c.includes("base")) return `https://basescan.org/tx/${hash}`;
  if (c.includes("tron") || c.includes("trx")) return `https://tronscan.org/#/transaction/${hash}`;
  if (c.includes("eth") || c.includes("ethereum")) return `https://etherscan.io/tx/${hash}`;
  if (c.includes("sol") || c.includes("solana")) return `https://solscan.io/tx/${hash}`;
  if (c.includes("btc") || c.includes("bitcoin")) return `https://mempool.space/tx/${hash}`;
  return null;
}

export function ForensicDeepDivePanel({
  caseId,
  graphNodes = [],
  onSelectNode,
}: ForensicDeepDivePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bridges");

  // Bridges State
  const [bridgesData, setBridgesData] = useState<CaseBridgesResponse | null>(null);
  const [loadingBridges, setLoadingBridges] = useState(false);
  const [errorBridges, setErrorBridges] = useState<string | null>(null);

  // Privacy State
  const [privacyData, setPrivacyData] = useState<CasePrivacyResponse | null>(null);
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [errorPrivacy, setErrorPrivacy] = useState<string | null>(null);

  // Layering State
  const [layeringData, setLayeringData] = useState<LayeringAnalysisResponse | null>(null);
  const [loadingLayering, setLoadingLayering] = useState(false);
  const [errorLayering, setErrorLayering] = useState<string | null>(null);

  // Copy state helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchBridges = useCallback(() => {
    if (!caseId) return;
    setLoadingBridges(true);
    setErrorBridges(null);
    getCaseBridges(caseId)
      .then((data) => setBridgesData(data))
      .catch((err) => setErrorBridges(err instanceof Error ? err.message : "Unable to load bridge analysis."))
      .finally(() => setLoadingBridges(false));
  }, [caseId]);

  const fetchPrivacy = useCallback(() => {
    if (!caseId) return;
    setLoadingPrivacy(true);
    setErrorPrivacy(null);
    getCasePrivacy(caseId)
      .then((data) => setPrivacyData(data))
      .catch((err) => setErrorPrivacy(err instanceof Error ? err.message : "Unable to load privacy analysis."))
      .finally(() => setLoadingPrivacy(false));
  }, [caseId]);

  const fetchLayering = useCallback(() => {
    if (!caseId) return;
    setLoadingLayering(true);
    setErrorLayering(null);
    getCaseLayering(caseId)
      .then((data) => setLayeringData(data))
      .catch((err) => setErrorLayering(err instanceof Error ? err.message : "Unable to load layering analysis."))
      .finally(() => setLoadingLayering(false));
  }, [caseId]);

  useEffect(() => {
    if (activeTab === "bridges" && !bridgesData && !loadingBridges) {
      fetchBridges();
    } else if (activeTab === "privacy" && !privacyData && !loadingPrivacy) {
      fetchPrivacy();
    } else if (activeTab === "layering" && !layeringData && !loadingLayering) {
      fetchLayering();
    }
  }, [activeTab, bridgesData, privacyData, layeringData, loadingBridges, loadingPrivacy, loadingLayering, fetchBridges, fetchPrivacy, fetchLayering]);

  const isWalletInGraph = (addr?: string | null): boolean => {
    if (!addr) return false;
    return graphNodes.some((n) => n.address.toLowerCase() === addr.toLowerCase());
  };

  const renderAddressWithAction = (address: string, label: string) => {
    const exists = isWalletInGraph(address);
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <span className="text-white font-medium" title={address}>
          {truncateHash(address, 6)}
        </span>
        <button
          type="button"
          onClick={() => handleCopy(address)}
          aria-label={`Copy ${label}`}
          className="p-1 hover:bg-white/[0.06] rounded text-white/40 hover:text-white transition-colors"
          title={`Copy ${label}`}
        >
          {copiedText === address ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
        {exists && onSelectNode && (
          <button
            type="button"
            onClick={() => onSelectNode(address)}
            className="px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 rounded-md text-[10px] font-sans font-medium transition-all cursor-pointer"
            title="Highlight in Graph"
          >
            Inspect
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-white/[0.02] border border-white/5 p-5 font-sans select-none space-y-4">
      {/* Header & Section Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-3">
        <div>
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-white/60" />
            <span>Forensic Deep Dive Analysis</span>
          </h3>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Cross-chain bridge hops, privacy protocols, and multi-hop layering dispersion.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs shrink-0 flex-wrap sm:flex-nowrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("bridges")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "bridges"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Cross-Chain Bridges</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "privacy"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Privacy / Swappers</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("layering")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === "layering"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layering Analysis</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CROSS-CHAIN BRIDGES */}
      {activeTab === "bridges" && (
        <div className="space-y-4">
          {loadingBridges && (
            <div className="p-8 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
              <span>Loading bridge analysis...</span>
            </div>
          )}

          {errorBridges && !loadingBridges && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl font-mono text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unable to load bridge analysis ({errorBridges})</span>
              </div>
              <button
                type="button"
                onClick={fetchBridges}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg font-sans text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loadingBridges && !errorBridges && bridgesData && (
            <>
              {/* Summary Header */}
              <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                  Total Bridges Detected
                </span>
                <span className="text-sm font-bold font-mono text-white px-2.5 py-0.5 bg-white/10 rounded-md border border-white/10">
                  {bridgesData.total_bridges_detected}
                </span>
              </div>

              {bridgesData.bridge_hops.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40">
                  No bridge hops detected for this case.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bridgesData.bridge_hops.map((hop, idx) => {
                    const sourceExplorerUrl = getExplorerUrl(hop.source_tx_hash, hop.source_chain);
                    const destTxHash = hop.destination_tx_hash || hop.dest_tx_hash;
                    const destExplorerUrl = getExplorerUrl(destTxHash, hop.destination_chain);

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs space-y-3"
                      >
                        {/* Source Chain -> Bridge Protocol -> Destination Chain Flow */}
                        <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          <div className="text-center">
                            <div className="text-[10px] text-white/40 uppercase">Source</div>
                            <div className="font-semibold text-white uppercase">{hop.source_chain}</div>
                          </div>
                          <div className="flex flex-col items-center px-2">
                            <ArrowRight className="w-4 h-4 text-white/60" />
                            <span className="text-[10px] font-medium text-white/80 uppercase mt-0.5">
                              {hop.bridge_protocol}
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-white/40 uppercase">Destination</div>
                            <div className="font-semibold text-white uppercase">{hop.destination_chain}</div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 text-[11px] pt-1 border-t border-white/5">
                          {hop.token && (
                            <div className="flex justify-between">
                              <span className="text-white/40">Token:</span>
                              <span className="font-medium text-white">{hop.token}</span>
                            </div>
                          )}
                          {hop.amount_usd !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-white/40">Amount USD:</span>
                              <span className="font-medium text-white">
                                ${hop.amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                          {hop.destination_wallet && (
                            <div className="flex justify-between items-center">
                              <span className="text-white/40">Destination Wallet:</span>
                              {renderAddressWithAction(hop.destination_wallet, "destination wallet")}
                            </div>
                          )}

                          {/* Source Tx Hash */}
                          {hop.source_tx_hash ? (
                            <div className="flex justify-between items-center pt-1 border-t border-white/5">
                              <span className="text-white/40">Source Tx Hash:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-white/80" title={hop.source_tx_hash}>
                                  {truncateHash(hop.source_tx_hash, 6)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(hop.source_tx_hash)}
                                  aria-label="Copy source transaction hash"
                                  className="p-1 hover:bg-white/[0.06] rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                                  title="Copy source transaction hash"
                                >
                                  {copiedText === hop.source_tx_hash ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                {sourceExplorerUrl ? (
                                  <a
                                    href={sourceExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 rounded-md text-[10px] font-sans font-medium transition-all cursor-pointer"
                                    title={`View on explorer`}
                                  >
                                    <span>Explorer</span>
                                    <ExternalLink className="w-3 h-3 text-white/60" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-white/30 italic">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {/* Destination Tx Hash */}
                          {destTxHash ? (
                            <div className="flex justify-between items-center pt-1 border-t border-white/5">
                              <span className="text-white/40">Dest Tx Hash:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-white/80" title={destTxHash}>
                                  {truncateHash(destTxHash, 6)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(destTxHash)}
                                  aria-label="Copy destination transaction hash"
                                  className="p-1 hover:bg-white/[0.06] rounded text-white/40 hover:text-white transition-colors cursor-pointer"
                                  title="Copy destination transaction hash"
                                >
                                  {copiedText === destTxHash ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                {destExplorerUrl ? (
                                  <a
                                    href={destExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 rounded-md text-[10px] font-sans font-medium transition-all cursor-pointer"
                                    title={`View on explorer`}
                                  >
                                    <span>Explorer</span>
                                    <ExternalLink className="w-3 h-3 text-white/60" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-white/30 italic">
                                    Unavailable
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PRIVACY / SWAPPER ACTIVITY */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          {loadingPrivacy && (
            <div className="p-8 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
              <span>Loading privacy analysis...</span>
            </div>
          )}

          {errorPrivacy && !loadingPrivacy && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl font-mono text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unable to load privacy analysis ({errorPrivacy})</span>
              </div>
              <button
                type="button"
                onClick={fetchPrivacy}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg font-sans text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loadingPrivacy && !errorPrivacy && privacyData && (
            <>
              {/* Investigation Alert Banner */}
              {privacyData.privacy_swappers_detected.length > 0 && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white font-mono text-xs space-y-1">
                  <div className="flex items-center gap-2 font-medium font-sans text-xs text-white uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-white/60 shrink-0 animate-pulse" />
                    <span>Privacy Protocol Activity Detected</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed font-mono">
                    Forensic ledger analysis detected interaction with privacy mixing/swapping infrastructure.
                  </p>
                </div>
              )}

              {privacyData.privacy_swappers_detected.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40">
                  No privacy mixer findings detected for this case.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {privacyData.privacy_swappers_detected.map((item, idx) => {
                    const complianceStatus =
                      item.subpoena_questionnaire_ready === true
                        ? "Available"
                        : item.subpoena_questionnaire_ready === false
                        ? "Pending"
                        : "Unavailable";

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-semibold text-white font-sans text-sm">{item.service_name}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white border border-white/10 rounded-md font-mono uppercase">
                            {item.swapper_type || "Swapper"}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-white/40">Input Asset:</span>
                            <span className="font-medium text-white">{item.input_currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Output Asset:</span>
                            <span className="font-medium text-white">{item.output_currency}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-white/5">
                            <span className="text-white/40">Intercept Target:</span>
                            {renderAddressWithAction(item.intercept_address, "intercept address")}
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-white/40">Compliance Directive:</span>
                            <span
                              className={`font-medium px-2 py-0.5 rounded-md text-[10px] font-mono ${
                                complianceStatus === "Available"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-white/[0.04] text-white/50 border border-white/5"
                              }`}
                            >
                              {complianceStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 3: LAYERING ANALYSIS */}
      {activeTab === "layering" && (
        <div className="space-y-4">
          {loadingLayering && (
            <div className="p-8 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
              <span>Loading layering analysis...</span>
            </div>
          )}

          {errorLayering && !loadingLayering && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl font-mono text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Unable to load layering analysis ({errorLayering})</span>
              </div>
              <button
                type="button"
                onClick={fetchLayering}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg font-sans text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loadingLayering && !errorLayering && layeringData && (
            <>
              {/* Analysis Summary */}
              {layeringData.summary && (
                <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs space-y-1">
                  <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">Analysis Summary</div>
                  <p className="text-[11px] leading-relaxed text-white/80 font-sans">{layeringData.summary}</p>
                </div>
              )}

              {/* Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-white/40 uppercase">Max Depth</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {layeringData.max_hop_count !== undefined && layeringData.max_hop_count !== null
                      ? `${layeringData.max_hop_count} Hops`
                      : layeringData.max_layering_depth !== undefined && layeringData.max_layering_depth !== null
                      ? `${layeringData.max_layering_depth} Hops`
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 uppercase">Total Paths</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {layeringData.total_paths_discovered ?? "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 uppercase">Min Hops</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {layeringData.min_hop_count ?? "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 uppercase">Peeling Chains</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {layeringData.peeling_chain_count ?? "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 uppercase">Fan-Out Count</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {layeringData.fan_out_count ?? "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 uppercase">Velocity</div>
                  <div className="text-xs font-medium mt-1">
                    {layeringData.rapid_movement_detected === true ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Rapid
                      </span>
                    ) : layeringData.rapid_movement_detected === false ? (
                      <span className="text-white/60">Standard</span>
                    ) : (
                      <span className="text-white/30">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Intermediary Mules Table */}
              {(() => {
                const mules = layeringData.classified_intermediaries || layeringData.intermediary_mules || [];
                return (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-white/60 font-sans uppercase tracking-wider">
                      Intermediary Mules ({mules.length})
                    </div>

                    {mules.length === 0 ? (
                      <div className="p-6 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40">
                        No intermediary mule addresses identified for this case.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-white/5 rounded-xl bg-white/[0.01]">
                        <table className="w-full text-left font-mono text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] text-white/40 uppercase bg-white/[0.02]">
                              <th className="p-3">Wallet Address</th>
                              <th className="p-3">Role</th>
                              <th className="p-3 text-right">Holding Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {mules.map((mule, idx) => {
                              const holdingTimeText =
                                mule.holding_time_minutes !== undefined && mule.holding_time_minutes !== null
                                  ? `${mule.holding_time_minutes} min`
                                  : "N/A";

                              return (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-3">
                                    {renderAddressWithAction(mule.address, "intermediary wallet")}
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 bg-white/10 text-white rounded-md text-[10px] font-mono">
                                      {mule.role}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right text-white/80 font-mono">
                                    {holdingTimeText}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Laundering Paths Section */}
              {layeringData.paths && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-white/60 font-sans uppercase tracking-wider">
                    Laundering Paths Discovered ({layeringData.paths.length})
                  </div>
                  {layeringData.paths.length === 0 ? (
                    <div className="p-4 text-center bg-white/[0.01] rounded-xl border border-white/5 font-mono text-xs text-white/40">
                      No distinct layering paths discovered.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {layeringData.paths.map((p, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs space-y-1">
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Path #{idx + 1}</span>
                            <span className="text-white font-medium">{p.hop_count ?? 0} Hops</span>
                          </div>
                          {p.summary && <p className="text-[11px] text-white/70 font-sans">{p.summary}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
