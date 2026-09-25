import { useEffect, useState } from "react";
import {
  Layers,
  Clock,
  AlertTriangle,
  Lock,
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getCases } from "@/lib/api";
import { CaseSummary, Chain } from "@/lib/types";
import { RiskBadge } from "@/components/common/RiskBadge";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  onNavigate: (section: string, caseId?: string) => void;
  userRole?: string;
}

export function DashboardSection({ onNavigate, userRole = "Investigating Officer" }: DashboardSectionProps) {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supervisorOnlyPending, setSupervisorOnlyPending] = useState(false);

  const isSupervisor = userRole.toLowerCase().includes("supervis");

  useEffect(() => {
    getCases()
      .then((data) => setCases(data || []))
      .catch((err) => console.error("Error loading dashboard cases:", err))
      .finally(() => setLoading(false));
  }, []);

  // Summary Metrics
  const totalCount = cases.length;
  const activeCount = cases.filter(
    (c) => c.status === "active" || c.status === "pending_approval"
  ).length;
  const highRiskCount = cases.filter((c) => c.overall_risk_score >= 75).length;
  const pendingApprovalCount = cases.filter(
    (c) => c.status === "pending_approval"
  ).length;
  const vaspAttributedCount = cases.filter((c) => Boolean(c.attributed_vasp_name)).length;

  // Chain Distribution Breakdown
  const chainCounts: Record<Chain, number> = {
    tron: cases.filter((c) => c.chain === "tron").length,
    ethereum: cases.filter((c) => c.chain === "ethereum").length,
    solana: cases.filter((c) => c.chain === "solana").length,
    bitcoin: cases.filter((c) => c.chain === "bitcoin").length,
  };

  // Risk Distribution
  const riskBreakdown = {
    high: cases.filter((c) => c.overall_risk_score >= 75).length,
    medium: cases.filter(
      (c) => c.overall_risk_score >= 40 && c.overall_risk_score < 75
    ).length,
    low: cases.filter((c) => c.overall_risk_score < 40).length,
  };

  const attentionCases = cases
    .filter(
      (c) => (c.overall_risk_score >= 75 || c.status === "pending_approval") && c.status !== "closed"
    )
    .slice(0, 3);

  const filteredCases = cases.filter((c) => {
    if (chainFilter !== "all" && c.chain !== chainFilter) return false;
    if (statusFilter === "active" && c.status !== "active") return false;
    if (statusFilter === "pending" && c.status !== "pending_approval") return false;
    if (statusFilter === "high_risk" && c.overall_risk_score < 75) return false;
    if (supervisorOnlyPending && c.status !== "pending_approval") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.case_id.toLowerCase().includes(q);
      const matchAddress = c.suspect_address.toLowerCase().includes(q);
      const matchVasp = c.attributed_vasp_name?.toLowerCase().includes(q);
      if (!matchId && !matchAddress && !matchVasp) return false;
    }
    return true;
  });

  const chainBadgeMap: Record<string, string> = {
    tron: "bg-red-500/10 text-red-600 border-red-200",
    solana: "bg-purple-500/10 text-purple-600 border-purple-200",
    ethereum: "bg-blue-500/10 text-blue-600 border-blue-200",
    bitcoin: "bg-amber-500/10 text-amber-700 border-amber-200",
  };

  const statusBadgeMap: Record<string, { label: string; icon: typeof Clock; style: string }> = {
    active: {
      label: "Active Trace",
      icon: Clock,
      style: "bg-primary/10 text-primary border-primary/20",
    },
    pending_approval: {
      label: "Pending Approval",
      icon: Lock,
      style: "bg-amber-500/10 text-amber-700 border-amber-300",
    },
    frozen: {
      label: "Notice Served / Frozen",
      icon: ShieldCheck,
      style: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
    },
    closed: {
      label: "Closed",
      icon: ShieldCheck,
      style: "bg-muted text-muted-foreground border-border",
    },
  };

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="workspace-in flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            <span>Chainsleuth Intelligence Grid</span>
            <span className="inline-flex size-2 animate-ping rounded-full bg-primary/75" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Command Center
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Real-time multi-chain fraud intelligence, cross-jurisdiction alerts & statutory freeze directives.
          </p>
        </div>

        <Button
          onClick={() => onNavigate("new-investigation")}
          className="shrink-0 shadow-sm"
        >
          <PlusCircle className="size-4" />
          Start New Trace
        </Button>
      </div>

      {/* 5 Glass Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="glass-panel workspace-in p-4 [animation-delay:50ms]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Cases</span>
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">Recorded in registry</div>
        </div>

        <div className="glass-panel workspace-in p-4 [animation-delay:100ms]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Traces</span>
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-primary">
            {activeCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">Live graph monitoring</div>
        </div>

        <div className="glass-panel workspace-in p-4 [animation-delay:150ms]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <div className="grid size-8 place-items-center rounded-xl bg-rose-500/10 text-rose-600">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-rose-600">
            {highRiskCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">Score &ge; 75 (PMLA flagged)</div>
        </div>

        <div
          onClick={() => isSupervisor && setSupervisorOnlyPending(!supervisorOnlyPending)}
          className={cn(
            "glass-panel workspace-in p-4 transition-all [animation-delay:200ms]",
            isSupervisor && "cursor-pointer hover:border-primary/50",
            supervisorOnlyPending && "border-amber-400/80 bg-amber-50/40"
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Sign</span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Lock className="size-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-amber-600">
            {pendingApprovalCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">Awaiting supervisor sign</div>
        </div>

        <div className="glass-panel workspace-in p-4 col-span-2 sm:col-span-1 [animation-delay:250ms]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">VASP Matched</span>
            <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">
            {vaspAttributedCount}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">Identified freeze targets</div>
        </div>
      </div>

      {/* Visual Distribution & Priority Panel Grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Blockchain Distribution Breakdown */}
        <div className="glass-panel workspace-in p-5 lg:col-span-4 [animation-delay:200ms]">
          <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chain Distribution
            </span>
            <span className="font-mono text-xs text-muted-foreground">{totalCount} total</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-red-50/30 p-2.5">
              <span className="font-semibold text-red-600">TRON (TRC-20)</span>
              <span className="font-mono font-bold text-foreground">{chainCounts.tron}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-blue-200/60 bg-blue-50/30 p-2.5">
              <span className="font-semibold text-blue-600">Ethereum</span>
              <span className="font-mono font-bold text-foreground">{chainCounts.ethereum}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-purple-200/60 bg-purple-50/30 p-2.5">
              <span className="font-semibold text-purple-600">Solana</span>
              <span className="font-mono font-bold text-foreground">{chainCounts.solana}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-200/60 bg-amber-50/30 p-2.5">
              <span className="font-semibold text-amber-700">Bitcoin</span>
              <span className="font-mono font-bold text-foreground">{chainCounts.bitcoin}</span>
            </div>
          </div>
        </div>

        {/* Risk Severity Breakdown */}
        <div className="glass-panel workspace-in p-5 lg:col-span-4 [animation-delay:250ms]">
          <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Risk Severity
            </span>
            <span className="font-mono text-xs text-muted-foreground">Algorithmic GNN</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="font-semibold text-rose-600">Critical (&ge; 75)</span>
                <span className="font-mono font-bold">{riskBreakdown.high}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${totalCount ? (riskBreakdown.high / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="font-semibold text-amber-700">Medium (40 - 74)</span>
                <span className="font-mono font-bold">{riskBreakdown.medium}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${totalCount ? (riskBreakdown.medium / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium">
                <span className="font-semibold text-primary">Low (&lt; 40)</span>
                <span className="font-mono font-bold">{riskBreakdown.low}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${totalCount ? (riskBreakdown.low / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Attention Cases */}
        <div className="glass-panel workspace-in p-5 lg:col-span-4 [animation-delay:300ms]">
          <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2">
            <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-rose-600">
              <AlertTriangle className="size-3.5" />
              Priority Action Required
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">CRITICAL</span>
          </div>
          <div className="space-y-2">
            {attentionCases.map((ac) => (
              <button
                key={ac.case_id}
                type="button"
                onClick={() => onNavigate("investigations", ac.case_id)}
                className="group flex w-full items-center justify-between rounded-xl border border-white/40 bg-white/30 p-2.5 text-left transition-all hover:border-primary/40 hover:bg-white/60 active:scale-[0.99]"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-foreground group-hover:text-primary">
                    {ac.case_id}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase">
                    {ac.chain} &bull; {ac.attributed_vasp_name || "Mule cell"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge score={ac.overall_risk_score} size="sm" showIcon={false} />
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel workspace-in p-3 [animation-delay:350ms]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID, Suspect Wallet, or Target VASP…"
              className="field pl-9 pr-4 text-xs font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Blockchain Pills */}
            <div className="flex items-center rounded-full border border-border/40 bg-white/40 p-1">
              <Filter className="ml-2 mr-1 size-3 text-muted-foreground" />
              {(["all", "tron", "ethereum", "solana", "bitcoin"] as const).map((chain) => (
                <button
                  key={chain}
                  type="button"
                  onClick={() => setChainFilter(chain)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition-all",
                    chainFilter === chain
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chain}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field w-auto px-3 py-1.5 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Traces</option>
              <option value="pending">Pending Approval</option>
              <option value="high_risk">High Risk (&ge; 75)</option>
            </select>

            {isSupervisor && (
              <button
                type="button"
                onClick={() => setSupervisorOnlyPending(!supervisorOnlyPending)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
                  supervisorOnlyPending
                    ? "border-amber-400 bg-amber-100/80 text-amber-800"
                    : "border-border/50 bg-white/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <Lock className="mr-1 inline-block size-3" />
                Pending Only
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Cases Table */}
      <div className="glass-panel workspace-in overflow-hidden [animation-delay:400ms]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/30 bg-white/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Suspect Wallet</th>
                <th className="px-4 py-3">Chain</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Target VASP</th>
                <th className="px-4 py-3">Logged</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-mono">
                    <Clock className="mx-auto mb-2 size-5 animate-spin text-primary" />
                    Querying immutable case register…
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground font-mono">
                    No investigations match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const statusInfo = statusBadgeMap[c.status] || statusBadgeMap.active;
                  const StatusIcon = statusInfo.icon;
                  const chainStyle = chainBadgeMap[c.chain] || "bg-muted text-muted-foreground border-border";

                  return (
                    <tr
                      key={c.case_id}
                      onClick={() => onNavigate("investigations", c.case_id)}
                      className="group cursor-pointer transition-colors hover:bg-white/40"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-foreground group-hover:text-primary">
                        {c.case_id}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <AddressBadge address={c.suspect_address} truncateLength={6} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            chainStyle
                          )}
                        >
                          {c.chain}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge score={c.overall_risk_score} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            statusInfo.style
                          )}
                        >
                          <StatusIcon className="size-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {c.attributed_vasp_name ? (
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <ShieldCheck className="size-3.5 shrink-0" />
                            {c.attributed_vasp_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Unattributed</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                          Workbench
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
