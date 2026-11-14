"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CaseTable } from "@/components/case/CaseTable";
import { getCases } from "@/lib/api";
import { CaseSummary, Chain } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Clock,
  Layers,
  AlertCircle,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { currentRole } = useAppStore();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supervisorOnlyPending, setSupervisorOnlyPending] = useState(false);

  const isSupervisor = currentRole === "supervisory_officer";

  useEffect(() => {
    getCases()
      .then((data) => {
        setCases(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("[Dashboard] Failed to fetch cases:", err);
        setError("Unable to retrieve investigation cases.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Summary Metrics calculated from backend cases
  const totalCount = cases.length;
  const activeCount = cases.filter(
    (c) => c.status === "active" || c.status === "pending_approval"
  ).length;
  const highRiskCount = cases.filter((c) => c.overall_risk_score >= 75).length;
  const pendingApprovalCount = cases.filter(
    (c) => c.status === "pending_approval"
  ).length;
  const vaspAttributedCount = cases.filter((c) =>
    Boolean(c.attributed_vasp_name)
  ).length;

  // Chain Distribution Breakdown
  const chainCounts: Record<Chain, number> = {
    tron: cases.filter((c) => c.chain === "tron").length,
    ethereum: cases.filter((c) => c.chain === "ethereum").length,
    solana: cases.filter((c) => c.chain === "solana").length,
    bitcoin: cases.filter((c) => c.chain === "bitcoin").length,
  };

  // Risk Distribution Breakdown
  const riskBreakdown = {
    high: cases.filter((c) => c.overall_risk_score >= 75).length,
    medium: cases.filter(
      (c) => c.overall_risk_score >= 40 && c.overall_risk_score < 75
    ).length,
    low: cases.filter((c) => c.overall_risk_score < 40).length,
  };

  // Filtered List Computation
  const filteredCases = cases.filter((c) => {
    if (chainFilter !== "all" && c.chain !== chainFilter) {
      return false;
    }
    if (statusFilter === "active" && c.status !== "active") return false;
    if (statusFilter === "pending" && c.status !== "pending_approval") return false;
    if (statusFilter === "high_risk" && c.overall_risk_score < 75) return false;

    if (supervisorOnlyPending && c.status !== "pending_approval") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.case_id.toLowerCase().includes(q);
      const matchAddress = c.suspect_address.toLowerCase().includes(q);
      const matchVasp = c.attributed_vasp_name?.toLowerCase().includes(q);
      if (!matchId && !matchAddress && !matchVasp) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Command Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h1 className="font-instrument text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Investigation Overview
            </h1>
            <p className="text-xs text-neutral-400 font-light mt-1 max-w-2xl leading-relaxed">
              Active cases, multi-hop transaction tracing, and asset freeze directives.
            </p>
          </div>

          <Link
            href="/trace/new"
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-md shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Start New Trace</span>
          </Link>
        </div>

        {/* API Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Overview Stat KPI Cards */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Active Cases */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider">
                  Active Cases
                </span>
                <Layers className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-instrument text-3xl sm:text-4xl font-medium text-white">
                  {totalCount}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  ({activeCount} in active walk)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2 font-light">
                Indexed across 4 blockchain networks
              </p>
            </div>

            {/* High Risk Syndicates */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-rose-900/30 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300">
                  Critical Risk (≥75)
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-instrument text-3xl sm:text-4xl font-medium text-rose-400">
                  {highRiskCount}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  flagged cases
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2 font-light">
                Syndicate burners & peeling chains
              </p>
            </div>

            {/* VASP Attributions */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-emerald-900/30 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
                  Target VASP Matched
                </span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-instrument text-3xl sm:text-4xl font-medium text-emerald-400">
                  {vaspAttributedCount}
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  targets identified
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2 font-light">
                Ready for compliance freeze directive
              </p>
            </div>

            {/* Cash-Out Response Target */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-violet-900/30 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-violet-300">
                  Cash-Out Window SLA
                </span>
                <Clock className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-instrument text-3xl sm:text-4xl font-medium text-violet-300">
                  ~28.4m
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  avg turnaround
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2 font-light">
                Pre-liquidation asset preservation
              </p>
            </div>
          </div>
        )}

        {/* Intelligence Breakdown Strip: Networks & Risk */}
        {!error && !loading && cases.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Blockchain Distribution */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">
                  Multi-Chain Ledger Distribution
                </span>
                <span className="text-neutral-500 font-mono text-xs">
                  {totalCount} total cases
                </span>
              </div>

              {/* Multi-segment stacked bar */}
              <div className="w-full h-2.5 rounded-full bg-white/[0.04] overflow-hidden flex">
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${totalCount ? (chainCounts.tron / totalCount) * 100 : 0}%` }}
                  title={`TRON: ${chainCounts.tron}`}
                />
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${totalCount ? (chainCounts.ethereum / totalCount) * 100 : 0}%` }}
                  title={`Ethereum: ${chainCounts.ethereum}`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${totalCount ? (chainCounts.bitcoin / totalCount) * 100 : 0}%` }}
                  title={`Bitcoin: ${chainCounts.bitcoin}`}
                />
                <div
                  className="bg-purple-500 h-full"
                  style={{ width: `${totalCount ? (chainCounts.solana / totalCount) * 100 : 0}%` }}
                  title={`Solana: ${chainCounts.solana}`}
                />
              </div>

              {/* Legend with Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-neutral-300 text-[11px]">TRON</span>
                  </div>
                  <span className="font-bold text-white">{chainCounts.tron}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-neutral-300 text-[11px]">Ethereum</span>
                  </div>
                  <span className="font-bold text-white">{chainCounts.ethereum}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-neutral-300 text-[11px]">Bitcoin</span>
                  </div>
                  <span className="font-bold text-white">{chainCounts.bitcoin}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-neutral-300 text-[11px]">Solana</span>
                  </div>
                  <span className="font-bold text-white">{chainCounts.solana}</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment Breakdown */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">
                  Algorithmic Risk Severity
                </span>
                <span className="text-neutral-500 font-mono text-xs">
                  5-Model ML Ensemble
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Critical */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <span className="text-rose-400 font-medium">Critical Risk (≥75)</span>
                    <span className="text-neutral-300">{riskBreakdown.high} cases</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${totalCount ? (riskBreakdown.high / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <span className="text-amber-400 font-medium">Medium Risk (40–74)</span>
                    <span className="text-neutral-300">{riskBreakdown.medium} cases</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${totalCount ? (riskBreakdown.medium / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Low */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px]">
                    <span className="text-emerald-400 font-medium">Low Risk (&lt;40)</span>
                    <span className="text-neutral-300">{riskBreakdown.low} cases</span>
                  </div>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${totalCount ? (riskBreakdown.low / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search, Network & Status Filter Strip */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Case ID, Suspect Wallet, or Target VASP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 text-xs font-sans transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Blockchain Network Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
              {(["all", "tron", "ethereum", "bitcoin", "solana"] as const).map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() => setChainFilter(chain)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    chainFilter === chain
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {chain === "all" ? "All Networks" : chain.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/[0.04] text-neutral-300 border border-white/10 rounded-xl px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet-500/80 cursor-pointer"
            >
              <option value="all" className="bg-[#121212] text-white">All Statuses</option>
              <option value="active" className="bg-[#121212] text-white">Active Traces</option>
              <option value="pending" className="bg-[#121212] text-white">Pending Review</option>
              <option value="high_risk" className="bg-[#121212] text-white">High Risk (≥75)</option>
            </select>
          </div>
        </div>

        {/* Forensic Case Table */}
        <CaseTable cases={filteredCases} loading={loading} />
      </div>
    </AppShell>
  );
}
