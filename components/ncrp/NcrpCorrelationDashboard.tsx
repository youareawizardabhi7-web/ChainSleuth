"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SyndicateCorrelationItem } from "@/lib/types";
import { getNcrpCorrelations } from "@/lib/api";
import { AddressBadge } from "@/components/ui/AddressBadge";
import {
  Network,
  Loader2,
  AlertCircle,
  Users,
  FileText,
  TrendingDown,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

export function NcrpCorrelationDashboard() {
  const [correlations, setCorrelations] = useState<SyndicateCorrelationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [backendAggregates, setBackendAggregates] = useState<{
    totalCorrelations?: number;
  }>({});

  useEffect(() => {
    let isMounted = true;

    getNcrpCorrelations()
      .then((data) => {
        if (!isMounted) return;
        setCorrelations(data.correlations || []);
        setBackendAggregates({
          totalCorrelations: data.total_correlations,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[NcrpCorrelationDashboard] API Error:", err);
        setError(err.message || "Unable to retrieve syndicate correlation intelligence.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCorrelations = backendAggregates.totalCorrelations || correlations.length;
  const totalComplaints = new Set(correlations.flatMap((c) => c.linked_ncrp_ack_numbers || [])).size;
  const totalSuspectWallets = new Set(correlations.flatMap((c) => c.linked_suspect_addresses || [])).size;
  const totalLoss = correlations.reduce((acc, item) => acc + (item.total_aggregate_loss_inr || 0), 0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const getThreatBadge = (level?: string) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
      default:
        return "bg-white/[0.04] text-white/70 border-white/10";
    }
  };

  return (
    <div className="space-y-5">
      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-white/5 bg-white/[0.02]">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
          <div className="text-white/40 font-mono text-xs">
            Evaluating cross-jurisdiction syndicate correlations...
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-center text-rose-200">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="font-semibold text-rose-300 text-sm">
            Syndicate Correlation Query Failure
          </div>
          <p className="text-xs text-white/70 max-w-md mx-auto font-mono">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && correlations.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
          <Network className="w-8 h-8 text-white/20" />
          <div className="font-medium text-white text-sm">
            No Syndicate Clusters Identified
          </div>
          <p className="text-xs text-white/40 max-w-md font-sans">
            No cross-complaint graph correlations or common laundering pivots were detected in the ledger database.
          </p>
        </div>
      )}

      {/* SUCCESSFUL DATA PRESENTATION */}
      {!loading && !error && correlations.length > 0 && (
        <div className="space-y-5">
          {/* Summary Section - 4 KPI Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 relative overflow-hidden group hover:border-white/10 transition-all">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-white/60" /> Total Clusters
              </span>
              <div className="text-2xl font-mono font-medium text-white">
                {totalCorrelations}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 relative overflow-hidden group hover:border-white/10 transition-all">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-white/60" /> Linked Wallets
              </span>
              <div className="text-2xl font-mono font-medium text-white">
                {totalSuspectWallets}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 relative overflow-hidden group hover:border-white/10 transition-all">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-white/60" /> Correlated Cases
              </span>
              <div className="text-2xl font-mono font-medium text-white">
                {totalComplaints}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 relative overflow-hidden group hover:border-white/10 transition-all">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400/80" /> Aggregate Loss
              </span>
              <div className="text-2xl font-mono font-medium text-rose-400">
                ₹{totalLoss.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Correlation Cards */}
          <div className="space-y-3">
            {correlations.map((item, idx) => {
              const correlationId = item.correlation_id || `correlation-${idx}`;
              const pivotLabel = item.pivot_entity_label || `Syndicate Cluster #${idx + 1}`;
              const correlationType = item.correlation_type || "shared_link";
              const pivotAddress = item.pivot_address;
              const ackNumbers = item.linked_ncrp_ack_numbers || [];
              const suspectAddresses = item.linked_suspect_addresses || [];
              const lossInr = item.total_aggregate_loss_inr || 0;
              const states = item.reporting_states || [];
              const threatLevel = item.syndicate_threat_level;
              const recommendation = item.action_recommendation;
              const isExpanded = expandedIndex === idx;

              return (
                <div
                  key={correlationId}
                  className={`rounded-2xl border bg-white/[0.02] transition-all overflow-hidden ${
                    isExpanded ? "border-white/20 bg-white/[0.03]" : "border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {pivotLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${getThreatBadge(threatLevel)}`}>
                            {threatLevel || "SYNDICATE"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider bg-white/[0.04] text-white/60 border border-white/5 uppercase">
                            {correlationType.toUpperCase().replace(/_/g, " ")}
                          </span>
                        </div>
                        {pivotAddress && (
                          <div className="text-xs text-white/40 font-mono mt-1 flex items-center gap-2">
                            <span>Pivot Address:</span>
                            <AddressBadge address={pivotAddress} truncateLength={8} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Metrics */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                          Linked Cases
                        </span>
                        <span className="font-mono text-sm font-medium text-white">
                          {ackNumbers.length}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                          Total Valuation
                        </span>
                        <span className="font-mono text-sm font-medium text-rose-400">
                          ₹{lossInr.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label="Toggle cluster details"
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/5 space-y-4 bg-white/[0.01]">
                      {/* Action Recommendation */}
                      {recommendation && (
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
                            Forensic Recommendation
                          </span>
                          <p className="text-xs text-white/80 font-sans leading-relaxed">
                            {recommendation}
                          </p>
                        </div>
                      )}

                      {/* Reporting Jurisdictions */}
                      {states.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                            Reporting Jurisdictions ({states.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {states.map((st) => (
                              <span
                                key={st}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/70 font-mono"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Linked Suspect Addresses */}
                      {suspectAddresses.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                            Linked Suspect Wallets ({suspectAddresses.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {suspectAddresses.map((addr) => (
                              <AddressBadge key={addr} address={addr} truncateLength={6} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Linked NCRP Ack Numbers */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                          Correlated Incident Numbers ({ackNumbers.length})
                        </span>
                        {ackNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {ackNumbers.map((ack) => (
                              <span
                                key={ack}
                                className="px-2.5 py-1 bg-white/[0.03] text-white/80 border border-white/10 rounded-lg font-mono text-xs"
                              >
                                {ack}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-white/40 font-mono text-xs">
                            No explicit incident reference identifiers linked.
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {pivotAddress && (
                        <div className="pt-2 flex justify-end">
                          <Link
                            href={`/trace/new?address=${encodeURIComponent(pivotAddress)}`}
                            className="px-4 py-2 rounded-xl bg-white text-black font-medium text-xs hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span>Initiate Forensic Trace on Pivot Address</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
