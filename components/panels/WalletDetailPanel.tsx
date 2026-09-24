"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WalletNode, TransferEdge, VASPAttribution, CustomWalletLabelItem } from "@/lib/types";
import { getWalletTags } from "@/lib/api";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { TypologyFlags } from "./TypologyFlags";
import { RiskBadge } from "@/components/case/RiskBadge";
import { VaspAttributionCard } from "./VaspAttributionCard";
import { WalletTagModal } from "./WalletTagModal";
import { ArrowUpRight, ArrowDownLeft, ShieldAlert, AlertOctagon, ArrowRightLeft, Tag, Shield, RefreshCw } from "lucide-react";

interface WalletDetailPanelProps {
  node: WalletNode | null;
  edges?: TransferEdge[];
  attribution?: VASPAttribution | null;
  caseId?: string;
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
      <div className="h-full p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-500 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <ShieldAlert className="w-6 h-6 text-slate-700" />
        <div className="text-slate-300 font-sans font-semibold">No Node Selected</div>
        <p className="text-[11px] text-slate-500">
          Click any wallet node on the graph canvas to inspect balance, transaction history, & typology flags.
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
    <div className="h-full p-3.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 flex flex-col space-y-3.5 overflow-y-auto select-none">
      {/* Header with Tag Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-slate-400 font-semibold font-sans uppercase tracking-wider text-[11px]">
          Wallet Node Inspector
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTagModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800 rounded font-sans text-[11px] font-bold transition-colors cursor-pointer"
            title="Annotate or Tag Wallet"
          >
            <Tag className="w-3 h-3 text-teal-400" />
            <span>Tag Wallet</span>
          </button>
          <RiskBadge score={node.riskScore} size="sm" />
        </div>
      </div>

      {/* OFAC Sanctions Alert Banner */}
      {isOfacSanctioned && (
        <div className="p-3 bg-red-950/90 border-2 border-red-600 rounded text-red-200 font-mono text-xs space-y-2 shadow-lg shadow-red-950/50">
          <div className="flex items-center gap-2 font-bold font-sans text-xs text-red-400 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
            <span>OFAC Sanctions Match</span>
            <span className="ml-auto text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">
              CRITICAL
            </span>
          </div>
          <p className="text-[11px] text-red-300 font-mono leading-relaxed">
            This wallet address has been explicitly flagged by the backend as a match against official OFAC sanctions databases.
          </p>

          {node.sanctionsInfo && (
            <div className="pt-2 border-t border-red-800/80 space-y-1 text-[10px]">
              <div className="font-bold text-red-400 uppercase tracking-wider">
                Sanctions Evidence Details (Backend Provided)
              </div>
              {node.sanctionsInfo.sanctioned_entity_name && (
                <div>
                  <span className="text-red-400">Sanctioned Entity:</span>{" "}
                  <span className="text-slate-100 font-bold">{node.sanctionsInfo.sanctioned_entity_name}</span>
                </div>
              )}
              {node.sanctionsInfo.ofac_identifier && (
                <div>
                  <span className="text-red-400">OFAC ID:</span>{" "}
                  <span className="text-slate-100 font-bold">{node.sanctionsInfo.ofac_identifier}</span>
                </div>
              )}
              {node.sanctionsInfo.designation_reason && (
                <div>
                  <span className="text-red-400">Reason:</span>{" "}
                  <span className="text-slate-300">{node.sanctionsInfo.designation_reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cross-Chain Bridge Hop Card */}
      {isBridgeHop && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-700 rounded text-cyan-200 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold font-sans text-xs text-cyan-400 uppercase tracking-wider">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Cross-Chain Bridge Hop</span>
            {node.bridgeInfo?.bridge_name && (
              <span className="ml-auto text-[10px] bg-cyan-900 text-cyan-200 font-bold px-2 py-0.5 rounded border border-cyan-700">
                {node.bridgeInfo.bridge_name}
              </span>
            )}
          </div>
          <p className="text-[11px] text-cyan-300/90 leading-relaxed font-mono">
            This node has been identified by backend ledger analysis as a cross-chain liquidity bridge endpoint.
          </p>
        </div>
      )}

      {/* Full Address */}
      <div>
        <div className="text-slate-500 text-[10px] uppercase mb-1">Full Wallet Address</div>
        <AddressBadge address={node.address} truncateLength={8} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded border border-slate-800">
        <div>
          <div className="text-slate-500 text-[10px] uppercase">Chain</div>
          <div className="uppercase font-bold text-slate-100">{node.chain || "N/A"}</div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px] uppercase">Current Balance</div>
          <div className="font-bold text-slate-100">
            {node.balance !== undefined && node.balance !== null
              ? `${node.balance.toLocaleString()} ${
                  node.chain === "tron"
                    ? "TRX"
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
          <div className="text-slate-500 text-[10px] uppercase">Risk Assessment</div>
          <div className="font-bold text-slate-100">
            {node.riskScore !== undefined && node.riskScore !== null ? `${node.riskScore}/100` : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px] uppercase">First Seen</div>
          <div className="text-slate-300 text-[11px]">
            {node.firstSeen ? new Date(node.firstSeen).toLocaleDateString() : "N/A"}
          </div>
        </div>
      </div>

      {/* Investigator Annotations Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold font-sans uppercase text-[11px] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Investigator Annotations</span>
          </span>
          {isLoadingTags && <RefreshCw className="w-3 h-3 text-slate-500 animate-spin" />}
        </div>

        {customTags.length === 0 ? (
          <div className="text-slate-600 text-[11px] italic p-2 bg-slate-900/40 rounded border border-slate-900 text-center font-mono">
            No investigator annotations
          </div>
        ) : (
          <div className="space-y-2">
            {customTags.map((tagItem, idx) => (
              <div
                key={tagItem.id || `${tagItem.address}-${idx}`}
                className="p-2.5 bg-slate-900/90 border border-slate-800 rounded font-mono text-[11px] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 font-sans">{tagItem.entity_name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold uppercase bg-teal-950 text-teal-400 border border-teal-800">
                    [{tagItem.entity_type}]
                  </span>
                </div>
                {tagItem.case_reference && (
                  <div className="text-slate-400">
                    <span className="text-slate-500">Case Ref:</span> {tagItem.case_reference}
                  </div>
                )}
                {tagItem.source && (
                  <div className="text-slate-400">
                    <span className="text-slate-500">Source:</span> {tagItem.source}
                  </div>
                )}
                {tagItem.notes && (
                  <p className="text-slate-300 text-[10px] bg-slate-950 p-1.5 rounded border border-slate-800/80 leading-normal">
                    {tagItem.notes}
                  </p>
                )}
                {tagItem.tags && tagItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tagItem.tags.map((t, tIdx) => (
                      <span key={tIdx} className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded border border-slate-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Typology Flags */}
      {node.typologyFlags && node.typologyFlags.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase font-semibold">
            Detected Laundering Typologies
          </div>
          <TypologyFlags flags={node.typologyFlags} />
        </div>
      )}

      {/* Hops & Transactions List */}
      <div className="flex-1 space-y-2 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold font-sans uppercase text-[11px]">
            Transaction Hops ({walletTxs.length})
          </span>
        </div>

        {walletTxs.length === 0 ? (
          <div className="text-slate-600 text-[11px] text-center py-4 bg-slate-900/40 rounded">
            No active transfer hops recorded for this node
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {walletTxs.map((tx) => {
              const isOutbound = tx.from === node.address;
              const tokenSymbol =
                tx.token ||
                (node.chain === "tron"
                  ? "TRX"
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
                  className="p-2 bg-slate-900/60 border border-slate-800/80 rounded flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    {isOutbound ? (
                      <span className="p-1 rounded bg-red-950 text-red-400 border border-red-800" title="Outbound Hop">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-teal-950 text-teal-400 border border-teal-800" title="Inbound Hop">
                        <ArrowDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <div>
                      <AddressBadge address={isOutbound ? tx.to : tx.from} truncateLength={4} />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-200">
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
