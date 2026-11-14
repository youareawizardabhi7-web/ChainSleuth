"use client";

import React, { useEffect, useState } from "react";
import { WalletCluster } from "@/lib/types";
import { getCaseClusters } from "@/lib/api";
import { AddressBadge } from "@/components/ui/AddressBadge";
import {
  Boxes,
  Loader2,
  AlertCircle,
  XCircle,
  Network,
  Building,
  Layers,
  Sparkles,
} from "lucide-react";

interface ForensicClustersPanelProps {
  caseId: string;
  selectedCluster: WalletCluster | null;
  onSelectCluster: (cluster: WalletCluster | null) => void;
  visibleGraphNodeAddresses?: string[];
}

export function ForensicClustersPanel({
  caseId,
  selectedCluster,
  onSelectCluster,
  visibleGraphNodeAddresses = [],
}: ForensicClustersPanelProps) {
  const [clusters, setClusters] = useState<WalletCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCaseClusters(caseId)
      .then((data) => {
        if (!isMounted) return;
        setClusters(data.clusters || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[ForensicClustersPanel] Error fetching clusters:", err);
        setError(err.message || "Unable to retrieve forensic clusters.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  const getClusterTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "vasp_sweep":
      case "exchange_sweep":
        return {
          label: "VASP SWEEP",
          colorClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        };
      case "syndicate_gas":
      case "syndicate_gas_funder":
        return {
          label: "SYNDICATE GAS",
          colorClass: "bg-white/10 text-white border-white/20",
        };
      case "layering_cell":
      case "laundering_typology":
        return {
          label: "LAYERING CELL",
          colorClass: "bg-rose-500/10 text-rose-300 border-rose-500/20",
        };
      case "smurfing_cell":
        return {
          label: "SMURFING CELL",
          colorClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        };
      case "dex_liquidity":
        return {
          label: "DEX LIQUIDITY",
          colorClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
        };
      default:
        return {
          label: (type || "CLUSTER").toUpperCase().replace(/_/g, " "),
          colorClass: "bg-white/[0.04] text-white/60 border-white/10",
        };
    }
  };

  const visibleSet = new Set(visibleGraphNodeAddresses.map((a) => a.toLowerCase()));

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs text-white/80 flex flex-col space-y-3.5 select-none h-full overflow-y-auto min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-white/60" />
          <span className="text-white font-medium font-sans text-xs">
            Forensic Wallet Clusters
          </span>
        </div>

        {selectedCluster && (
          <button
            type="button"
            onClick={() => onSelectCluster(null)}
            className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-md border border-white/10 text-[10px] font-sans transition-all cursor-pointer"
          >
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Active Selection Banner */}
      {selectedCluster && (
        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white/60 animate-pulse" />
              Active Graph Highlight
            </span>
            <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-md border border-white/10 font-mono">
              {(selectedCluster.member_addresses || []).length} Wallets
            </span>
          </div>
          <p className="text-xs text-white/60 font-mono">
            Filtering by:{" "}
            <span className="font-medium text-white">
              {selectedCluster.label || "Cluster"}
            </span>
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          <div className="text-white/40 font-mono text-xs">Analyzing wallet clusters...</div>
        </div>
      )}

      {/* API Error State */}
      {!loading && error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-center text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 mx-auto" />
          <div className="font-semibold font-sans text-xs">Unable to retrieve clusters</div>
          <p className="text-[10px] text-white/70 font-mono">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clusters.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center text-white/40">
          <Network className="w-7 h-7 text-white/20" />
          <div className="font-sans font-medium text-white text-xs">
            No Clusters Detected
          </div>
          <p className="text-xs text-white/40 max-w-xs font-sans">
            No algorithmically grouped wallet sub-networks were detected for this case.
          </p>
        </div>
      )}

      {/* Render Clusters List */}
      {!loading && !error && clusters.length > 0 && (
        <div className="space-y-2.5">
          {clusters.map((cluster, idx) => {
            const clusterId = cluster.cluster_id || `cluster-${idx}`;
            const isSelected = selectedCluster && selectedCluster.cluster_id === clusterId;
            const label = cluster.label || `Cluster #${idx + 1}`;
            const badge = getClusterTypeBadge(cluster.cluster_type);
            const addresses = cluster.member_addresses || [];
            const nodeCount = addresses.length;
            const entityName = cluster.entity_name;
            const description = cluster.description;

            const visibleInGraphCount =
              visibleGraphNodeAddresses.length > 0
                ? addresses.filter((addr) => visibleSet.has(addr.toLowerCase())).length
                : addresses.length;

            return (
              <div
                key={clusterId}
                onClick={() => onSelectCluster(isSelected ? null : cluster)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-white/[0.06] border-white/30 shadow-lg"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                {/* Cluster Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-mono border uppercase tracking-wider mb-1 ${badge.colorClass}`}
                    >
                      {badge.label}
                    </span>
                    <div className="font-medium text-white font-sans text-xs">{label}</div>
                  </div>

                  {/* Risk Score / Volume */}
                  <div className="text-right shrink-0">
                    {cluster.dominant_risk_score !== undefined && (
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block font-mono">
                          Risk
                        </span>
                        <span className="text-rose-400 font-medium text-xs font-mono">
                          {cluster.dominant_risk_score}/100
                        </span>
                      </div>
                    )}
                    {cluster.total_volume_usdt !== undefined && cluster.total_volume_usdt > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ${cluster.total_volume_usdt.toLocaleString()} USDT
                      </span>
                    )}
                  </div>
                </div>

                {/* Entity Name if available */}
                {entityName && (
                  <div className="flex items-center gap-1.5 text-xs text-white/70 font-sans">
                    <Building className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span>
                      Entity: <strong className="text-white">{entityName}</strong>
                    </span>
                  </div>
                )}

                {/* Description if available */}
                {description && (
                  <p className="text-[11px] text-white/60 font-sans leading-relaxed bg-white/[0.02] p-2 rounded-lg border border-white/5">
                    {description}
                  </p>
                )}

                {/* Cluster Stats */}
                <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5 font-mono">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-white/40" />
                    <span>
                      Members: <strong className="text-white">{nodeCount}</strong>
                    </span>
                  </div>
                  {visibleGraphNodeAddresses.length > 0 && (
                    <div className="text-white/40">
                      Graph:{" "}
                      <strong className="text-white/80">
                        {visibleInGraphCount}/{addresses.length}
                      </strong>{" "}
                      visible
                    </div>
                  )}
                </div>

                {/* Addresses list preview */}
                {addresses.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {addresses.slice(0, 3).map((addr) => (
                      <AddressBadge key={addr} address={addr} truncateLength={4} />
                    ))}
                    {addresses.length > 3 && (
                      <span className="text-[9px] text-white/40 self-center px-1 font-mono">
                        +{addresses.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
