"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CaseSummary } from "@/lib/types";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { RiskBadge } from "@/components/case/RiskBadge";
import { ArrowRight, Building2, Clock, CheckCircle2, Lock, AlertCircle, ShieldAlert } from "lucide-react";

interface CaseTableProps {
  cases: CaseSummary[];
  loading?: boolean;
}

export function CaseTable({ cases, loading = false }: CaseTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="w-full border border-white/10 rounded-2xl bg-white/[0.02] p-12 text-center text-xs text-neutral-400 space-y-3">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="font-mono text-neutral-400">Loading case records & topology indices...</div>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="w-full border border-white/10 rounded-2xl bg-white/[0.02] p-16 text-center text-xs text-neutral-400 space-y-3">
        <AlertCircle className="w-7 h-7 text-neutral-500 mx-auto" />
        <div className="text-white font-medium text-sm font-sans">No matching investigations found</div>
        <p className="text-neutral-500 text-xs max-w-sm mx-auto">
          Try adjusting your search query, blockchain network filters, or risk thresholds.
        </p>
      </div>
    );
  }

  // Sort by risk score descending by default
  const sortedCases = [...cases].sort((a, b) => b.overall_risk_score - a.overall_risk_score);

  const statusBadgeMap: Record<
    string,
    { label: string; icon: React.ElementType; style: string; dot: string }
  > = {
    active: {
      label: "Active Trace",
      icon: Clock,
      style: "bg-white/[0.04] text-neutral-200 border-white/10",
      dot: "bg-emerald-400",
    },
    pending_approval: {
      label: "Pending Review",
      icon: Clock,
      style: "bg-amber-950/40 text-amber-300 border-amber-800/40",
      dot: "bg-amber-400",
    },
    frozen: {
      label: "Notice Served",
      icon: Lock,
      style: "bg-cyan-950/40 text-cyan-300 border-cyan-800/40",
      dot: "bg-cyan-400",
    },
    closed: {
      label: "Closed",
      icon: CheckCircle2,
      style: "bg-white/[0.02] text-neutral-500 border-white/5",
      dot: "bg-neutral-600",
    },
  };

  const chainBadgeMap: Record<string, { label: string; dot: string; style: string }> = {
    tron: {
      label: "TRON",
      dot: "bg-red-400",
      style: "bg-red-950/30 text-red-300 border-red-800/40",
    },
    ethereum: {
      label: "Ethereum",
      dot: "bg-blue-400",
      style: "bg-blue-950/30 text-blue-300 border-blue-800/40",
    },
    solana: {
      label: "Solana",
      dot: "bg-purple-400",
      style: "bg-purple-950/30 text-purple-300 border-purple-800/40",
    },
    bitcoin: {
      label: "Bitcoin",
      dot: "bg-amber-400",
      style: "bg-amber-950/30 text-amber-300 border-amber-800/40",
    },
  };

  return (
    <div className="w-full overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-inter">
          <thead className="border-b border-white/10 bg-white/[0.03] text-neutral-400 font-mono text-[11px] uppercase tracking-wider select-none">
            <tr>
              <th className="py-3.5 px-4 font-medium">Case Reference</th>
              <th className="py-3.5 px-4 font-medium">Suspect Wallet</th>
              <th className="py-3.5 px-4 font-medium">Network</th>
              <th className="py-3.5 px-4 font-medium">Risk Score</th>
              <th className="py-3.5 px-4 font-medium">Status</th>
              <th className="py-3.5 px-4 font-medium">Target VASP</th>
              <th className="py-3.5 px-4 font-medium">Created</th>
              <th className="py-3.5 px-4 font-medium text-right">Workbench</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {sortedCases.map((c) => {
              const statusInfo = statusBadgeMap[c.status] || statusBadgeMap.active;
              const chainInfo = chainBadgeMap[c.chain] || {
                label: c.chain.toUpperCase(),
                dot: "bg-neutral-400",
                style: "bg-white/[0.04] text-neutral-300 border-white/10",
              };

              // Clean short case reference badge
              const shortId = c.case_id.includes("-")
                ? `#CS-${c.case_id.split("-")[0].toUpperCase()}`
                : `#CS-${c.case_id.slice(0, 6).toUpperCase()}`;

              // Formatted relative date
              const createdDate = c.created_at
                ? new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Active";

              return (
                <tr
                  key={c.case_id}
                  onClick={() => router.push(`/case/${c.case_id}`)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  {/* Case Identifier */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">
                        {shortId}
                      </span>
                    </div>
                  </td>

                  {/* Suspect Target Wallet */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <AddressBadge address={c.suspect_address} truncateLength={6} />
                  </td>

                  {/* Blockchain Network */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${chainInfo.style}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${chainInfo.dot}`} />
                      <span>{chainInfo.label}</span>
                    </span>
                  </td>

                  {/* Calibrated Risk Score */}
                  <td className="py-3.5 px-4">
                    <RiskBadge score={c.overall_risk_score} size="sm" />
                  </td>

                  {/* Investigation Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${statusInfo.style}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </td>

                  {/* Destination VASP Match */}
                  <td className="py-3.5 px-4">
                    {c.attributed_vasp_name ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-[11px] font-medium font-mono">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.attributed_vasp_name}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-xs font-mono">
                        Unattributed transit
                      </span>
                    )}
                  </td>

                  {/* Date Created */}
                  <td className="py-3.5 px-4 text-xs font-mono text-neutral-400">
                    {createdDate}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-white transition-colors">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
