"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SyndicateCorrelation } from "@/lib/types";
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
  const [correlations, setCorrelations] = useState<SyndicateCorrelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [backendAggregates, setBackendAggregates] = useState<{
    totalCorrelations?: number;
    totalVictims?: number;
    totalComplaints?: number;
    totalLossInr?: number;
  }>({});

  useEffect(() => {
    let isMounted = true;

    getNcrpCorrelations()
      .then((data) => {
        if (!isMounted) return;
        setCorrelations(data.correlations || []);
        setBackendAggregates({
          totalCorrelations: data.total_correlations,
          totalVictims: data.total_victims,
          totalComplaints: data.total_complaints,
          totalLossInr: data.total_loss_inr,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[NcrpCorrelationDashboard] API Error:", err);
        setError(err.message || "Unable to retrieve NCRP correlation intelligence.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ONLY calculate aggregate values directly from backend response records
  const totalCorrelations = backendAggregates.totalCorrelations ?? correlations.length;

  const totalVictims =
    backendAggregates.totalVictims ??
    correlations.reduce(
      (acc, item) => acc + (item.total_victims_linked ?? item.victims_linked ?? 0),
      0
    );

  const totalComplaints =
    backendAggregates.totalComplaints ??
    new Set(correlations.flatMap((c) => c.complaint_ids || [])).size;

  const totalLoss =
    backendAggregates.totalLossInr ??
    correlations.reduce((acc, item) => acc + (item.total_loss_inr ?? 0), 0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-4 font-mono text-xs text-slate-300 select-none">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-purple-950 border border-purple-600 text-purple-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-sans text-slate-100 uppercase tracking-wider">
              NCRP Cross-Complaint Syndicate Correlation Matrix
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Live Algorithmic Graph Correlation Engine (`GET /api/v1/ncrp/correlations`)
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-slate-950 border border-slate-800 rounded">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <div className="text-slate-400 font-mono text-xs">
            Analyzing cross-complaint syndicate correlations...
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-950/80 border border-red-800 rounded space-y-2 text-center text-red-200 shadow-xl">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <div className="font-bold font-sans text-sm">
            Unable to retrieve NCRP correlation intelligence.
          </div>
          <p className="text-[11px] text-red-300 max-w-md mx-auto font-mono">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && correlations.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-slate-950 border border-slate-800 rounded text-slate-500 text-center">
          <Network className="w-10 h-10 text-slate-700" />
          <div className="font-bold font-sans text-slate-300 text-sm">
            No cross-complaint correlations identified.
          </div>
          <p className="text-[11px] text-slate-500 max-w-md font-mono">
            No algorithmic syndicate linkages or common attributes were returned by the backend service.
          </p>
        </div>
      )}

      {/* SUCCESSFUL DATA PRESENTATION */}
      {!loading && !error && correlations.length > 0 && (
        <div className="space-y-4">
          {/* Summary Section (Aggregates strictly computed from backend data) */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> Total Correlations
              </span>
              <div className="text-xl font-bold font-mono text-purple-300">
                {totalCorrelations}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-400" /> Linked Victims
              </span>
              <div className="text-xl font-bold font-mono text-teal-300">{totalVictims}</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Linked Complaints
              </span>
              <div className="text-xl font-bold font-mono text-cyan-300 font-mono">
                {totalComplaints}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-center space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Aggregated Loss (INR)
              </span>
              <div className="text-xl font-bold font-mono text-rose-300">
                ₹{totalLoss.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Correlation Cards */}
          <div className="space-y-3">
            {correlations.map((item, idx) => {
              const syndicateLabel =
                item.syndicate_label || item.label || item.name || `Syndicate Correlation #${idx + 1}`;
              const attributeType = item.attribute_type || "common_link";
              const commonAttribute = item.common_attribute || "N/A";
              const victimsCount = item.total_victims_linked ?? item.victims_linked ?? 0;
              const lossInr = item.total_loss_inr ?? 0;
              const confidenceVal = item.confidence;
              const complaintIds = item.complaint_ids || [];
              const isExpanded = expandedIndex === idx;

              const targetAddress = item.common_wallet || item.suspect_wallet;
              const targetCaseId = item.case_id;

              return (
                <div
                  key={idx}
                  className={`bg-slate-950 border rounded-lg transition-all overflow-hidden ${
                    isExpanded ? "border-purple-600 shadow-xl" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none space-x-3 bg-slate-900/60 hover:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-purple-950 border border-purple-700 text-purple-300">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-sans text-slate-100 uppercase">
                            {syndicateLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                            {attributeType.toUpperCase().replace(/_/g, " ")}
                          </span>
                        </div>
                        {commonAttribute && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Common Attribute: <span className="text-teal-300 font-bold">{commonAttribute}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Metrics */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block font-sans">
                          Victims Linked
                        </span>
                        <span className="font-bold text-teal-300 text-xs font-mono">
                          {victimsCount}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block font-sans">
                          Total Loss (INR)
                        </span>
                        <span className="font-bold text-rose-300 text-xs font-mono">
                          ₹{lossInr.toLocaleString()}
                        </span>
                      </div>

                      {confidenceVal !== undefined && confidenceVal !== null && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase block font-sans">
                            Confidence
                          </span>
                          <span className="font-bold text-purple-400 text-xs font-mono">
                            {confidenceVal}
                            {typeof confidenceVal === "number" && confidenceVal <= 1 ? "%" : ""}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-100 p-1"
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
                    <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3.5">
                      {/* Optional Case / Wallet Navigation if returned by backend */}
                      {(targetAddress || targetCaseId) && (
                        <div className="p-3 bg-slate-900 border border-teal-800/80 rounded flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">
                              Backend Linked Infrastructure Target
                            </span>
                            <div className="flex items-center gap-2">
                              {targetAddress && (
                                <AddressBadge address={targetAddress} truncateLength={8} />
                              )}
                              {targetCaseId && (
                                <span className="text-slate-300 font-mono">
                                  Case ID: <strong>{targetCaseId}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={
                              targetCaseId
                                ? `/case/${targetCaseId}`
                                : `/trace/new?address=${encodeURIComponent(targetAddress || "")}`
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-sans font-bold text-xs rounded transition-colors"
                          >
                            <span>Inspect Case Workbench</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* Linked Complaint IDs */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Backend Linked Complaint IDs ({complaintIds.length})
                        </div>
                        {complaintIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {complaintIds.map((cid) => (
                              <span
                                key={cid}
                                className="px-2.5 py-1 bg-slate-900 text-slate-200 border border-slate-800 rounded font-mono text-[11px]"
                              >
                                {cid}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-500 font-mono text-[11px]">
                            No explicit complaint IDs specified for this correlation record.
                          </div>
                        )}
                      </div>
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
