"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CaseTable } from "@/components/case/CaseTable";
import { getCases } from "@/lib/api";
import { CaseSummary } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  PlusCircle,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Building2,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { currentRole } = useAppStore();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [supervisorOnlyPending, setSupervisorOnlyPending] = useState(false);

  const isSupervisor = currentRole === "supervisory_officer";

  useEffect(() => {
    getCases()
      .then((data) => setCases(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Summary Stat Calculations
  const activeCount = cases.filter((c) => c.status === "active" || c.status === "pending_approval").length;
  const highRiskCount = cases.filter((c) => c.overall_risk_score >= 75).length;
  const pendingApprovalCount = cases.filter((c) => c.status === "pending_approval").length;
  const vaspAttributedCount = cases.filter((c) => Boolean(c.attributed_vasp_name)).length;

  // Filtered List Computation
  const filteredCases = cases.filter((c) => {
    // Chain filter
    if (chainFilter !== "all" && c.chain !== chainFilter) {
      return false;
    }
    // Supervisor Pending filter
    if (supervisorOnlyPending && c.status !== "pending_approval") {
      return false;
    }
    // Search query filter
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
      <div className="space-y-4 font-mono text-xs select-none">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-base font-bold font-sans text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              Investigations
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Active Crypto Fraud Cases, Risk Scores & Target VASP Freeze Status
            </p>
          </div>

          <Link
            href="/trace/new"
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-sans font-bold text-xs rounded transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            + New Trace
          </Link>
        </div>

        {/* Summary Area (4 SIEM Stat Cards) */}
        <div className="grid grid-cols-4 gap-3 font-sans">
          {/* Active Investigations */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Active Investigations
              </div>
              <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                {activeCount} <span className="text-[11px] text-slate-500 font-normal">cases</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-teal-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* High Risk Cases */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                High Risk Cases (&gt;=75)
              </div>
              <div className="text-lg font-bold text-red-400 font-mono mt-0.5">
                {highRiskCount} <span className="text-[11px] text-slate-500 font-normal">flagged</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {/* Pending Approval */}
          <div
            onClick={() => isSupervisor && setSupervisorOnlyPending(!supervisorOnlyPending)}
            className={`p-3 bg-slate-900/80 border rounded flex items-center justify-between transition-colors ${
              supervisorOnlyPending ? "border-amber-500 bg-amber-950/20" : "border-slate-800"
            } ${isSupervisor ? "cursor-pointer hover:border-amber-700" : ""}`}
            title={isSupervisor ? "Click to filter pending approval cases" : ""}
          >
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                Pending Approval
                {isSupervisor && <span className="text-amber-400 font-bold text-[9px]">(FILTER)</span>}
              </div>
              <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                {pendingApprovalCount} <span className="text-[11px] text-slate-500 font-normal">awaiting</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* VASP Attributions */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                VASP Attributions
              </div>
              <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">
                {vaspAttributedCount} <span className="text-[11px] text-slate-500 font-normal">matched</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-teal-300">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 border border-slate-800 rounded">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Case ID or Suspect Wallet Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
            />
          </div>

          {/* Chain & Supervisor Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
              {(["all", "tron", "solana", "ethereum"] as const).map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() => setChainFilter(chain)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                    chainFilter === chain
                      ? "bg-slate-800 text-teal-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>

            {/* Extra Supervisor Filter Tab */}
            {isSupervisor && (
              <button
                type="button"
                onClick={() => setSupervisorOnlyPending(!supervisorOnlyPending)}
                className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold border transition-colors flex items-center gap-1.5 ${
                  supervisorOnlyPending
                    ? "bg-amber-950 text-amber-300 border-amber-700 font-bold"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Lock className="w-3 h-3 text-amber-400" />
                Pending Approval Filter
              </button>
            )}
          </div>
        </div>

        {/* Main Case Table */}
        <CaseTable cases={filteredCases} loading={loading} />
      </div>
    </AppShell>
  );
}
