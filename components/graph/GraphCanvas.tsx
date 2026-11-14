"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from "react";
import cytoscape from "cytoscape";
import { getCytoscapeStyles } from "./graphStyles";
import { WalletNode, TransferEdge } from "@/lib/types";
import { GraphViewRef } from "./GraphViewRef";
import { ShieldAlert, ExternalLink, Copy, Check } from "lucide-react";

export interface GraphCanvasRef extends GraphViewRef {
  relayout: () => void;
}

interface GraphCanvasProps {
  nodes?: WalletNode[];
  edges?: TransferEdge[];
  onSelectNode?: (node: WalletNode | null) => void;
  onSelectEdge?: (edge: TransferEdge | null) => void;
  showLabels?: boolean;
  selectedClusterAddresses?: string[];
  timelineCutoffTs?: number | null;
}

export const GraphCanvas = forwardRef<GraphViewRef, GraphCanvasProps>(function GraphCanvas(
  {
    nodes = [],
    edges = [],
    onSelectNode,
    onSelectEdge,
    showLabels = true,
    selectedClusterAddresses = [],
    timelineCutoffTs = null,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Hover card state
  const [hoveredNode, setHoveredNode] = useState<{
    node: WalletNode;
    x: number;
    y: number;
  } | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 1.25);
      }
    },
    zoomOut: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      }
    },
    fit: () => {
      if (cyRef.current) {
        cyRef.current.fit(undefined, 30);
      }
    },
    resetView: () => {
      if (cyRef.current) {
        const layout = cyRef.current.layout({
          name: "breadthfirst",
          directed: true,
          padding: 30,
          spacingFactor: 1.25,
        });
        layout.run();
        cyRef.current.fit(undefined, 30);
      }
    },
    relayout: () => {
      if (cyRef.current) {
        const layout = cyRef.current.layout({
          name: "breadthfirst",
          directed: true,
          padding: 30,
          spacingFactor: 1.25,
        });
        layout.run();
      }
    },
  }));

  // Filter edges and active nodes based on timeline scrubber
  const { visibleEdges, visibleNodes } = useMemo(() => {
    if (timelineCutoffTs === null) {
      return { visibleEdges: edges, visibleNodes: nodes };
    }

    const filteredEdges = edges.filter((e) => {
      if (!e.timestamp) return true;
      const ts = new Date(e.timestamp).getTime();
      return !isNaN(ts) && ts <= timelineCutoffTs;
    });

    const activeAddrs = new Set<string>();
    filteredEdges.forEach((e) => {
      activeAddrs.add(e.from.toLowerCase());
      activeAddrs.add(e.to.toLowerCase());
    });

    // Always keep root origin node
    if (nodes.length > 0) {
      activeAddrs.add(nodes[0].address.toLowerCase());
    }

    const filteredNodes = nodes.filter((n) =>
      activeAddrs.has(n.address.toLowerCase())
    );

    return { visibleEdges: filteredEdges, visibleNodes: filteredNodes };
  }, [nodes, edges, timelineCutoffTs]);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [
      ...visibleNodes.map((n, idx) => {
        const isOfac = n.typologyFlags?.includes("ofac_sanctioned");
        const isBridge = n.typologyFlags?.includes("bridge_hop");
        const isBurner = n.typologyFlags.length > 0;
        const role = n.isVasp
          ? "vasp"
          : isOfac
          ? "ofac"
          : isBridge
          ? "bridge"
          : isBurner
          ? "burner"
          : idx === 0
          ? "origin"
          : "default";

        const truncated =
          n.address.length > 8
            ? `${n.address.slice(0, 4)}...${n.address.slice(-4)}`
            : n.address;

        return {
          data: {
            id: n.address,
            label: truncated,
            role: role,
            nodeObj: n,
          },
        };
      }),
      ...visibleEdges.map((e) => {
        // Logarithmic edge thickness scaling: width between 1.8px and 6.5px
        const logVal = Math.log10(Math.max(1, e.value));
        const thickness = Math.min(Math.max(1.8, logVal * 1.15), 6.5);
        const isSuspicious = e.value > 10000 || e.token === "USDT";

        return {
          data: {
            id: e.txHash,
            source: e.from,
            target: e.to,
            label: `${e.value.toLocaleString()} ${e.token}`,
            width: thickness,
            suspicious: isSuspicious ? "true" : "false",
            edgeObj: e,
          },
        };
      }),
    ];

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: getCytoscapeStyles(showLabels),
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 30,
        spacingFactor: 1.25,
      },
    });

    cyRef.current.on("tap", "node", (evt) => {
      const nodeData = evt.target.data("nodeObj") as WalletNode;
      onSelectNode?.(nodeData);
      onSelectEdge?.(null);
    });

    cyRef.current.on("tap", "edge", (evt) => {
      const edgeData = evt.target.data("edgeObj") as TransferEdge;
      onSelectEdge?.(edgeData);
      onSelectNode?.(null);
    });

    cyRef.current.on("tap", (evt) => {
      if (evt.target === cyRef.current) {
        onSelectNode?.(null);
        onSelectEdge?.(null);
      }
    });

    // Hover tooltip card events
    cyRef.current.on("mouseover", "node", (evt) => {
      const nodeData = evt.target.data("nodeObj") as WalletNode;
      const renderedPos = evt.target.renderedPosition();
      setHoveredNode({
        node: nodeData,
        x: renderedPos.x,
        y: renderedPos.y,
      });
    });

    cyRef.current.on("mouseout", "node", () => {
      setHoveredNode(null);
    });

    return () => {
      cyRef.current?.destroy();
    };
  }, [visibleNodes, visibleEdges, showLabels, onSelectNode, onSelectEdge]);

  // Effect to highlight cluster nodes
  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().removeClass("cluster-highlighted");
    if (selectedClusterAddresses && selectedClusterAddresses.length > 0) {
      const addrSet = new Set(selectedClusterAddresses.map((a) => a.toLowerCase()));
      cyRef.current.nodes().forEach((node) => {
        if (addrSet.has(node.id().toLowerCase())) {
          node.addClass("cluster-highlighted");
        }
      });
    }
  }, [selectedClusterAddresses, visibleNodes]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 1500);
  };

  const getExplorerUrl = (chain: string, address: string) => {
    const c = (chain || "tron").toLowerCase();
    if (c === "base") return `https://basescan.org/address/${address}`;
    if (c === "ethereum") return `https://etherscan.io/address/${address}`;
    if (c === "solana") return `https://solscan.io/account/${address}`;
    if (c === "bitcoin") return `https://mempool.space/address/${address}`;
    return `https://tronscan.org/#/address/${address}`;
  };

  return (
    <div className="relative w-full h-full bg-[#030303] select-none overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Glassmorphic Hover Card (Item 5) */}
      {hoveredNode && (
        <div
          style={{
            left: `${Math.min(
              hoveredNode.x + 18,
              (containerRef.current?.clientWidth || 500) - 240
            )}px`,
            top: `${Math.max(12, hoveredNode.y - 45)}px`,
          }}
          className="absolute z-30 pointer-events-auto w-60 bg-[#080808]/95 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-2xl font-mono text-[11px] space-y-2 text-white animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header with Chain Pill & VASP */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90 font-semibold border border-white/10">
              {hoveredNode.node.chain || "TRON"}
            </span>

            {hoveredNode.node.isVasp ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                VASP TARGET
              </span>
            ) : (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                  hoveredNode.node.riskScore > 70
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-white/5 text-white/60 border-white/10"
                }`}
              >
                RISK {hoveredNode.node.riskScore}/100
              </span>
            )}
          </div>

          {/* Address with Quick Copy */}
          <div>
            <span className="text-[9px] text-white/40 block uppercase tracking-wider mb-0.5">
              Wallet Address
            </span>
            <div className="flex items-center justify-between gap-1 text-[10px] text-white/90 bg-white/[0.03] p-1 rounded-md border border-white/5">
              <span className="truncate">{hoveredNode.node.address}</span>
              <button
                type="button"
                onClick={() => handleCopy(hoveredNode.node.address)}
                className="text-white/40 hover:text-white p-0.5 cursor-pointer"
                title="Copy address"
              >
                {copiedAddr ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/40">Balance:</span>
            <span className="font-bold text-white">
              {hoveredNode.node.balance.toLocaleString()}{" "}
              {hoveredNode.node.chain === "bitcoin" ? "BTC" : "USDT"}
            </span>
          </div>

          {/* Typology Flags */}
          {hoveredNode.node.typologyFlags &&
            hoveredNode.node.typologyFlags.length > 0 && (
              <div className="pt-1 border-t border-white/10 flex flex-wrap gap-1">
                {hoveredNode.node.typologyFlags.slice(0, 2).map((flag, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

          {/* Explorer Link */}
          <div className="pt-1 border-t border-white/10 text-right">
            <a
              href={getExplorerUrl(
                hoveredNode.node.chain || "tron",
                hoveredNode.node.address
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View Explorer</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {visibleNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 font-mono text-xs">
          No Graph Topology Loaded
        </div>
      )}
    </div>
  );
});
