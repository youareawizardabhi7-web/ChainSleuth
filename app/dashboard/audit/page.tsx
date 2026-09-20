"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AuditLogPage() {
  const mockAuditLogs = [
    {
      id: "LOG-1092",
      officer: "Inspector A. Sharma (IO-402)",
      action: "SEARCH_ADDRESS",
      query: "TABC1234567890XYZ99887766554433",
      timestamp: "2026-09-20T14:32:00Z",
    },
    {
      id: "LOG-1093",
      officer: "ACP R. Verma (Supervisor)",
      action: "APPROVE_NOTICE",
      query: "CS-2026-8891 (CoinDCX)",
      timestamp: "2026-09-20T14:45:00Z",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold font-sans text-slate-100 uppercase tracking-wider">
            Supervisory Audit Log
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Immutable log of search queries, graph traversals, and court freeze notice approvals
          </p>
        </div>

        <div className="w-full border border-slate-800 rounded bg-slate-950 font-mono text-xs overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Officer / Role</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Query</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-semibold text-slate-100">{log.id}</td>
                  <td className="p-3">{log.officer}</td>
                  <td className="p-3 font-bold text-teal-400">{log.action}</td>
                  <td className="p-3">{log.query}</td>
                  <td className="p-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
