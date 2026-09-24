"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { VASPRegistryItem } from "@/lib/types";
import { getVaspRegistry } from "@/lib/api";
import { Building2, Search, Filter, RefreshCw, AlertTriangle, ShieldCheck, Mail, Globe, Clock, ExternalLink } from "lucide-react";

export default function VaspDirectoryPage() {
  const [vasps, setVasps] = useState<VASPRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("all");

  const fetchRegistry = useCallback(async (isMounted = true) => {
    if (isMounted) {
      setIsLoading(true);
      setErrorMsg(null);
    }
    try {
      const data = await getVaspRegistry();
      if (isMounted) {
        setVasps(data || []);
      }
    } catch (err) {
      console.error("[VaspDirectory] Error fetching VASP registry:", err);
      if (isMounted) {
        const msg = err instanceof Error ? err.message : "Unable to load VASP registry.";
        setErrorMsg(msg);
      }
    } fontout: {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getVaspRegistry();
        if (isMounted) {
          setVasps(data || []);
          setErrorMsg(null);
        }
      } catch (err) {
        console.error("[VaspDirectory] Error fetching VASP registry:", err);
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Unable to load VASP registry.";
          setErrorMsg(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side filtering operating strictly on actual returned backend records
  const filteredVasps = vasps.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = v.vasp_name.toLowerCase().includes(q);
    const jurisMatch = (v.jurisdiction || "").toLowerCase().includes(q);
    const emailMatch = (v.nodal_officer_email || "").toLowerCase().includes(q);
    const chainMatchStr = (v.supported_chains || []).join(" ").toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || jurisMatch || emailMatch || chainMatchStr;

    const matchesChain =
      selectedChain === "all" ||
      (v.supported_chains || []).some((c) => c.toLowerCase() === selectedChain.toLowerCase());

    return matchesSearch && matchesChain;
  });

  return (
    <AppShell>
      <div className="space-y-4 font-mono text-xs select-none">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold font-sans text-slate-100 uppercase tracking-wider">
                VASP Nodal Officer Directory
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                FIU-IND Registered Virtual Asset Service Providers & Legal Compliance Directives
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchRegistry(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-sans text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-teal-400" : "text-slate-400"}`} />
            <span>Refresh Registry</span>
          </button>
        </div>

        {/* Search & Chain Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search VASP by name, jurisdiction, email, or supported chain..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono uppercase">Chain:</span>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono cursor-pointer"
            >
              <option value="all">All Chains</option>
              <option value="tron">TRON</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
              <option value="bitcoin">Bitcoin</option>
            </select>
          </div>
        </div>

        {/* Content Section: Loading / Error / Table / Empty */}
        {isLoading ? (
          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-xs">
              <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
              <span>Querying backend VASP registry database...</span>
            </div>
            {/* Table Loading Skeleton */}
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-900 border border-slate-800 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-6 bg-red-950/60 border border-red-800 rounded space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-red-400 font-bold font-sans text-sm uppercase">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Unable to load VASP registry.</span>
            </div>
            <p className="text-xs text-red-300 font-mono max-w-md mx-auto">{errorMsg}</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => fetchRegistry(true)}
                className="px-4 py-2 bg-red-900 hover:bg-red-800 border border-red-700 text-white font-sans text-xs font-bold rounded cursor-pointer transition-colors shadow-lg"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredVasps.length === 0 ? (
          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded text-center space-y-2">
            <Building2 className="w-8 h-8 text-slate-700 mx-auto" />
            <div className="text-slate-300 font-sans font-semibold text-xs">No VASP records available.</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-mono">
              {searchQuery || selectedChain !== "all"
                ? "No registered VASP entries matched your search criteria."
                : "The backend database currently has no VASP registry records available."}
            </p>
          </div>
        ) : (
          <div className="border border-slate-800 rounded bg-slate-950 overflow-x-auto shadow-xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold select-none">
                <tr>
                  <th className="p-3">VASP / Exchange Name</th>
                  <th className="p-3">FIU-IND Status</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Nodal Officer Email</th>
                  <th className="p-3">Supported Chains</th>
                  <th className="p-3">Notice Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredVasps.map((vasp, idx) => {
                  const isFiu = vasp.is_fiu_registered ?? vasp.fiu_registered ?? false;
                  const turnaround = vasp.notice_turnaround || (vasp.notice_turnaround_hours ? `${vasp.notice_turnaround_hours}h` : "Not available");

                  return (
                    <tr key={`${vasp.vasp_name}-${idx}`} className="hover:bg-slate-900/60 transition-colors">
                      {/* VASP Name */}
                      <td className="p-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>{vasp.vasp_name}</span>
                      </td>

                      {/* FIU-IND Status */}
                      <td className="p-3">
                        {isFiu ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800">
                            Not Registered
                          </span>
                        )}
                      </td>

                      {/* Jurisdiction */}
                      <td className="p-3 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <span>{vasp.jurisdiction || "Global"}</span>
                        </span>
                      </td>

                      {/* Nodal Email */}
                      <td className="p-3 text-slate-300">
                        {vasp.nodal_officer_email ? (
                          <a
                            href={`mailto:${vasp.nodal_officer_email}`}
                            className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 hover:underline"
                            title="Draft Section 94 Notice email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{vasp.nodal_officer_email}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-slate-600">None Provided</span>
                        )}
                      </td>

                      {/* Supported Chains */}
                      <td className="p-3 text-slate-300">
                        {vasp.supported_chains && vasp.supported_chains.length > 0 ? (
                          <span>{vasp.supported_chains.join(" · ")}</span>
                        ) : (
                          <span className="text-slate-600">Not specified</span>
                        )}
                      </td>

                      {/* Notice Turnaround */}
                      <td className="p-3 text-slate-300 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{turnaround}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
