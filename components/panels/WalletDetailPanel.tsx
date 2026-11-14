"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WalletNode, TransferEdge, VASPAttribution, CustomWalletLabelItem } from "@/lib/types";
import { getWalletTags } from "@/lib/api";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { TypologyFlags } from "./TypologyFlags";
import { RiskBadge } from "@/components/case/RiskBadge";
import { VaspAttributionCard } from "./VaspAttributionCard";
import { WalletTagModal } from "./WalletTagModal";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  AlertOctagon,
  ArrowRightLeft,
  Tag,
  Shield,
  RefreshCw,
  Cpu,
  Activity,
  FileText,
  Scale,
} from "lucide-react";

interface WalletDetailPanelProps {
  node: WalletNode | null;
  edges?: TransferEdge[];
  attribution?: VASPAttribution | null;
  caseId?: string;
}

function renderComponentScoreBar(label: string, weightLabel: string, score: number | null | undefined, isAnomaly = false) {
  const isAvailable = score !== undefined && score !== null;
  const numScore = isAvailable ? Number(score) : null;
  const normalizedVal = numScore !== null ? (numScore <= 1 && isAnomaly ? Math.round(numScore * 100) : Math.round(numScore)) : 0;

  let displayScore = "Unavailable";
  if (isAvailable && numScore !== null) {
    if (isAnomaly) {
      displayScore = `${numScore.toFixed(3)} (${Math.round(numScore * 100)}%)`;
    } else {
      displayScore = `${Math.round(numScore)}/100`;
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-white/80 font-sans">{label}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-white/50 font-mono">
            {weightLabel}
          </span>
        </div>
        <span className={isAvailable ? "text-white font-mono font-medium" : "text-white/30 italic font-mono"}>
          {displayScore}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isAvailable
              ? normalizedVal > 70
                ? "bg-rose-400"
                : normalizedVal > 30
                ? "bg-amber-400"
                : "bg-emerald-400"
              : "bg-white/10"
          }`}
          style={{ width: isAvailable ? `${Math.min(100, Math.max(0, normalizedVal))}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export function WalletDetailPanel({
  node,
  edges = [],
  attribution = null,
  caseId = "",
}: WalletDetailPanelProps) {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState<CustomWalletLabelItem[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const address = node?.address;

  const fetchCustomAnnotations = useCallback(async () => {
    if (!address) {
      setCustomTags([]);
      return;
    }
    setIsLoadingTags(true);
    try {
      const data = await getWalletTags(address);
      setCustomTags(data || []);
    } catch {
      setCustomTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, [address]);

  useEffect(() => {
    let isCancelled = false;
    Promise.resolve().then(() => {
      if (isCancelled) return;
      if (!address) {
        setCustomTags([]);
        return;
      }
      setIsLoadingTags(true);
      getWalletTags(address)
        .then((data) => {
          if (!isCancelled) setCustomTags(data || []);
        })
        .catch(() => {
          if (!isCancelled) setCustomTags([]);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingTags(false);
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [address]);

  if (!node) {
    return (
      <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs text-white/40 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <ShieldAlert className="w-6 h-6 text-white/20" />
        <div className="text-white font-sans font-medium text-xs">No Node Selected</div>
        <p className="text-[11px] text-white/40 font-sans max-w-xs">
          Select any wallet node on the graph canvas to inspect balances, transaction hops, and typology flags.
        </p>
      </div>
    );
  }

  // Check if this node is the attributed VASP deposit target address
  const isTargetVasp =
    node.isVasp ||
    (attribution &&
      node.address.toLowerCase() === attribution.deposit_address.toLowerCase());

  if (isTargetVasp && attribution) {
    return <VaspAttributionCard attribution={attribution} caseId={caseId} />;
  }

  // Filter inbound & outbound transactions for this specific wallet node
  const walletTxs = edges.filter(
    (e) => e.from === node.address || e.to === node.address
  );

  const isOfacSanctioned = node.typologyFlags?.includes("ofac_sanctioned");
  const isBridgeHop = node.typologyFlags?.includes("bridge_hop");

  return (
    <div className="h-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs text-white/80 flex flex-col space-y-4 overflow-y-auto select-none">
      {/* Header with Tag Button */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-white font-medium font-sans text-xs">
          Node Inspector
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTagModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 rounded-lg font-sans text-[11px] font-medium transition-all cursor-pointer shadow-sm"
            title="Annotate or Tag Wallet"
          >
            <Tag className="w-3 h-3 text-white/60" />
            <span>Tag Node</span>
          </button>
          <RiskBadge score={node.riskScore} size="sm" />
        </div>
      </div>

      {/* OFAC Sanctions Alert Banner */}
      {isOfacSanctioned && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 font-medium font-sans text-xs text-rose-300 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>OFAC Sanctions Match</span>
            <span className="ml-auto text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
              CRITICAL
            </span>
          </div>
          <p className="text-[11px] text-white/70 font-mono leading-relaxed">
            Wallet address matches official OFAC sanctions databases.
          </p>

          {node.sanctionsInfo && (
            <div className="pt-2 border-t border-rose-500/20 space-y-1 text-[10px]">
              <div className="font-semibold text-rose-300 uppercase tracking-wider">
                Sanctions Details
              </div>
              {node.sanctionsInfo.sanctioned_entity_name && (
                <div>
                  <span className="text-white/50">Entity:</span>{" "}
                  <span className="text-white font-bold">{node.sanctionsInfo.sanctioned_entity_name}</span>
                </div>
              )}
              {node.sanctionsInfo.ofac_identifier && (
                <div>
                  <span className="text-white/50">Identifier:</span>{" "}
                  <span className="text-white font-bold">{node.sanctionsInfo.ofac_identifier}</span>
                </div>
              )}
              {node.sanctionsInfo.designation_reason && (
                <div>
                  <span className="text-white/50">Reason:</span>{" "}
                  <span className="text-white/80">{node.sanctionsInfo.designation_reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cross-Chain Bridge Hop Card */}
      {isBridgeHop && (
        <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white font-mono text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-sans text-xs text-white font-medium uppercase tracking-wider">
            <ArrowRightLeft className="w-4 h-4 text-white/70 shrink-0" />
            <span>Cross-Chain Bridge Hop</span>
            {node.bridgeInfo?.bridge_name && (
              <span className="ml-auto text-[10px] bg-white/10 text-white font-mono font-medium px-2 py-0.5 rounded-md border border-white/10">
                {node.bridgeInfo.bridge_name}
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed font-mono">
            Node identified as a cross-chain liquidity bridge endpoint.
          </p>
        </div>
      )}

      {/* Full Address */}
      <div>
        <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider mb-1">
          Target Wallet Address
        </div>
        <AddressBadge address={node.address} truncateLength={8} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
        <div>
          <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider">Network</div>
          <div className="uppercase font-medium text-white">{node.chain || "N/A"}</div>
        </div>
        <div>
          <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider">Balance</div>
          <div className="font-medium text-white">
            {node.balance !== undefined && node.balance !== null
              ? `${node.balance.toLocaleString()} ${
                  node.chain === "tron"
                    ? "TRX"
                    : node.chain === "base"
                    ? "ETH"
                    : node.chain === "ethereum"
                    ? "ETH"
                    : node.chain === "bitcoin"
                    ? "BTC"
                    : node.chain === "solana"
                    ? "SOL"
                    : ""
                }`
              : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider">Risk Score</div>
          <div className="font-medium text-white">
            {node.riskScore !== undefined && node.riskScore !== null ? `${node.riskScore}/100` : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider">First Seen</div>
          <div className="text-white/70 text-[11px]">
            {node.firstSeen ? new Date(node.firstSeen).toLocaleDateString() : "N/A"}
          </div>
        </div>
      </div>

      {/* AML High-Risk Indicator Banner */}
      {Boolean(node.pmla_flag) && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl font-mono text-xs space-y-1">
          <div className="flex items-center justify-between font-sans text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              High Risk AML Indicator
            </span>
            <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
              Flagged
            </span>
          </div>
          <p className="text-[10px] text-white/70 font-mono leading-normal">
            Automated anti-money laundering anomaly flag detected on transaction graph structure.
          </p>
        </div>
      )}

      {/* Fallback metrics for robustness */}
      {(() => {
        const gnnScore = node.gnn_risk_score !== undefined && node.gnn_risk_score !== null
          ? node.gnn_risk_score
          : (node.riskScore ?? 0);

        const typologyScore = node.typology_score !== undefined && node.typology_score !== null
          ? node.typology_score
          : (node.typologyFlags && node.typologyFlags.length > 0 ? 85 : 0);

        const compositeScore = node.riskScore ?? 0;
        const anomalyScore = node.anomaly_score ?? null;

        return (
          <div className="space-y-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[11px] font-sans font-medium text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-white/60" />
                Risk Score Breakdown
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Composite: {compositeScore}/100
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {renderComponentScoreBar("Graph Traversal", "40%", gnnScore)}
              {renderComponentScoreBar("Typology Risk", "35%", typologyScore)}
              {renderComponentScoreBar("Anomaly Index", "25%", anomalyScore, true)}
            </div>
          </div>
        );
      })()}

      {/* Case Notes & Annotations Section */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-white/60 font-sans text-xs font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-white/40" />
            <span>Case Notes & Annotations</span>
          </span>
          {isLoadingTags && <RefreshCw className="w-3 h-3 text-white/40 animate-spin" />}
        </div>

        {customTags.length === 0 ? (
          <div className="text-white/30 text-xs italic p-3 bg-white/[0.01] rounded-xl border border-white/5 text-center font-sans">
            No notes or tags added for this node.
          </div>
        ) : (
          <div className="space-y-2">
            {customTags.map((tagItem, idx) => {
              if (!tagItem || typeof tagItem !== "object") return null;
              const entityName = tagItem.entity_name || (typeof tagItem === "string" ? tagItem : "Investigator Tag");
              return (
                <div
                  key={tagItem.id || `${tagItem.address || "tag"}-${idx}`}
                  className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white font-sans">{entityName}</span>
                    {tagItem.entity_type && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-white/10 text-white border border-white/10">
                        {tagItem.entity_type}
                      </span>
                    )}
                  </div>
                  {tagItem.case_reference && (
                    <div className="text-white/50 text-[11px]">
                      <span className="text-white/30">Ref:</span> {tagItem.case_reference}
                    </div>
                  )}
                  {tagItem.notes && (
                    <p className="text-white/80 text-[11px] bg-white/[0.02] p-2 rounded-lg border border-white/5 leading-normal">
                      {tagItem.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Typology Flags */}
      {node.typologyFlags && node.typologyFlags.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="text-white/40 text-[10px] uppercase font-mono tracking-wider">
            Detected Laundering Typologies
          </div>
          <TypologyFlags flags={node.typologyFlags} />
        </div>
      )}

      {/* Hops & Transactions List */}
      <div className="flex-1 space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-white/60 font-medium font-sans text-xs">
            Transaction Hops ({walletTxs.length})
          </span>
        </div>

        {walletTxs.length === 0 ? (
          <div className="text-white/30 text-xs text-center py-4 bg-white/[0.01] rounded-xl border border-white/5 font-sans">
            No transfer hops recorded for this node
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {walletTxs.map((tx) => {
              const isOutbound = tx.from === node.address;
              const tokenSymbol =
                tx.token ||
                (node.chain === "tron"
                  ? "TRX"
                  : node.chain === "base"
                  ? "ETH"
                  : node.chain === "ethereum"
                  ? "ETH"
                  : node.chain === "bitcoin"
                  ? "BTC"
                  : node.chain === "solana"
                  ? "SOL"
                  : "N/A");

              return (
                <div
                  key={tx.txHash || `${tx.from}-${tx.to}-${tx.value}`}
                  className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {isOutbound ? (
                      <span className="p-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20" title="Outbound Hop">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="Inbound Hop">
                        <ArrowDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <div>
                      <AddressBadge address={isOutbound ? tx.to : tx.from} truncateLength={4} />
                      <div className="text-[10px] text-white/30 mt-0.5 font-mono">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-medium text-white font-mono text-xs">
                    {tx.value !== undefined && tx.value !== null
                      ? `${tx.value.toLocaleString()} ${tokenSymbol}`
                      : "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wallet Tagging Modal */}
      <WalletTagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        address={node.address}
        chain={node.chain}
        onTagSuccess={fetchCustomAnnotations}
      />
    </div>
  );
}
