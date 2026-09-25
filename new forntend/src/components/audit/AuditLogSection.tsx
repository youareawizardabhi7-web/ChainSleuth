import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Clock,
  Filter,
  CheckCircle2,
  Lock,
  FileCheck,
} from "lucide-react";
import { getAuditLogs } from "@/lib/api";
import { AuditLogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AuditLogSection() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    getAuditLogs()
      .then((data) => setLogs(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.id.toLowerCase().includes(q) ||
      log.officer.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.query.toLowerCase().includes(q);

    const matchesAction =
      filterAction === "all" ||
      log.action.toLowerCase().includes(filterAction.toLowerCase());

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="workspace-in flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <Lock className="size-4" />
            <span>Supervisory Oversight & Chain of Custody</span>
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Supervisory Audit Trail
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Cryptographically sealed immutable register of search queries, multi-hop traversals & Section 94 BNSS freeze notice issuances.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel workspace-in p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Log ID, Officer, Action, or Query…"
              className="field pl-9 pr-4 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground ml-1" />
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Action:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="field w-auto px-3 py-1.5 text-xs font-semibold"
            >
              <option value="all">All Actions</option>
              <option value="Traversal">Graph Traversal</option>
              <option value="Notice">Section 94 Notice</option>
              <option value="Certificate">Evidence Certificate</option>
              <option value="Ingestion">NCRP Ingestion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel workspace-in overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/30 bg-white/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Officer / Unit</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Query / Case Reference</th>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">
                    {log.id}
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-foreground">
                    {log.officer}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-sans font-bold text-[10px] text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-sm truncate" title={log.query}>
                    {log.query}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-[11px]">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="size-3" />
                      SEALED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
