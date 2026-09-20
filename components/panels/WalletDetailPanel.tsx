"use client";

import React from "react";
import { WalletNode, TransferEdge, VASPAttribution } from "@/lib/types";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { TypologyFlags } from "./TypologyFlags";
import { RiskBadge } from "@/components/case/RiskBadge";
import { VaspAttributionCard } from "./VaspAttributionCard";
import { ArrowUpRight, ArrowDownLeft, ShieldAlert } from "lucide-react";

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

  return (
    <div className="h-full p-3.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 flex flex-col space-y-3.5 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-slate-400 font-semibold font-sans uppercase tracking-wider text-[11px]">
          Wallet Node Inspector
        </span>
        <RiskBadge score={node.riskScore} size="sm" />
      </div>

      {/* Full Address + Copy Button */}
      <div>
        <div className="text-slate-500 text-[10px] uppercase mb-1">Full Wallet Address</div>
        <AddressBadge address={node.address} truncateLength={8} />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded border border-slate-800">
        <div>
          <div className="text-slate-500 text-[10px] uppercase">Chain</div>
          <div className="uppercase font-bold text-slate-100">{node.chain}</div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px] uppercase">Current Balance</div>
          <div className="font-bold text-slate-100">
            {node.balance.toLocaleString()} {node.chain === "tron" ? "TRX" : "SOL"}
          </div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px] uppercase">Risk Assessment</div>
          <div className="font-bold text-slate-100">{node.riskScore}/100</div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px] uppercase">First Seen</div>
          <div className="text-slate-300 text-[11px]">
            {new Date(node.firstSeen).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Typology Flags with Plain-English Explanations */}
      {node.typologyFlags.length > 0 && (
        <div className="space-y-1.5">
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
              return (
                <div
                  key={tx.txHash}
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
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-200">
                    {tx.value.toLocaleString()} {tx.token}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
