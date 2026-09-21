"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import ForceGraph3D, { ForceGraphMethods } from "react-force-graph-3d";
import { WalletNode, TransferEdge } from "@/lib/types";
import { GraphViewRef } from "./GraphViewRef";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Graph3DProps {
  nodes?: WalletNode[];
  edges?: TransferEdge[];
  selectedNode?: WalletNode | null;
  selectedEdge?: TransferEdge | null;
  onSelectNode?: (node: WalletNode | null) => void;
  onSelectEdge?: (edge: TransferEdge | null) => void;
  showLabels?: boolean;
  onFallbackTo2D?: () => void;
}

export interface Graph3DRef extends GraphViewRef {}

interface ForceNode {
  id: string;
  label: string;
  role: "vasp" | "burner" | "default";
  nodeObj: WalletNode;
  val: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
}

interface ForceLink {
  id: string;
  source: string;
  target: string;
  label: string;
  width: number;
  suspicious: boolean;
  edgeObj: TransferEdge;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export const Graph3D = forwardRef<Graph3DRef, Graph3DProps>(function Graph3D(
  {
    nodes = [],
    edges = [],
    selectedNode = null,
    selectedEdge = null,
    onSelectNode,
    onSelectEdge,
    showLabels = true,
    onFallbackTo2D,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Measure container dimensions using ResizeObserver
  useEffect(() => {
    if (!checkWebGLSupport()) {
      setWebGlSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(container);
    setDimensions({
      width: container.clientWidth || 600,
      height: container.clientHeight || 450,
    });

    return () => observer.disconnect();
  }, []);

  // Camera Control Ref API implementation
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (fgRef.current) {
        const fg = fgRef.current as any;
        const currentCam = fg.cameraPosition() || { x: 0, y: 0, z: 200 };
        fg.cameraPosition(
          {
            x: (currentCam.x || 0) * 0.8,
            y: (currentCam.y || 0) * 0.8,
            z: (currentCam.z || 200) * 0.8,
          },
          undefined,
          400
        );
      }
    },
    zoomOut: () => {
      if (fgRef.current) {
        const fg = fgRef.current as any;
        const currentCam = fg.cameraPosition() || { x: 0, y: 0, z: 200 };
        fg.cameraPosition(
          {
            x: (currentCam.x || 0) * 1.25,
            y: (currentCam.y || 0) * 1.25,
            z: (currentCam.z || 200) * 1.25,
          },
          undefined,
          400
        );
      }
    },
    fit: () => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 30);
      }
    },
    resetView: () => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 30);
      }
    },
  }));

  // Build sets for investigation path highlighting
  const { connectedNodeAddresses, connectedEdgeIds } = useMemo(() => {
    const nodeAddrs = new Set<string>();
    const edgeIds = new Set<string>();

    if (selectedNode) {
      nodeAddrs.add(selectedNode.address);
      edges.forEach((e) => {
        if (e.from === selectedNode.address || e.to === selectedNode.address) {
          edgeIds.add(e.txHash);
          nodeAddrs.add(e.from);
          nodeAddrs.add(e.to);
        }
      });
    }

    if (selectedEdge) {
      edgeIds.add(selectedEdge.txHash);
      nodeAddrs.add(selectedEdge.from);
      nodeAddrs.add(selectedEdge.to);
    }

    return { connectedNodeAddresses: nodeAddrs, connectedEdgeIds: edgeIds };
  }, [selectedNode, selectedEdge, edges]);

  // Map WalletNode[] & TransferEdge[] to 3D graph format
  const graphData = useMemo(() => {
    const maxVal = Math.max(...edges.map((e) => e.value), 1);

    const forceNodes: ForceNode[] = nodes.map((n) => {
      const isBurner = n.typologyFlags.length > 0;
      const role: "vasp" | "burner" | "default" = n.isVasp
        ? "vasp"
        : isBurner
        ? "burner"
        : "default";

      const truncated =
        n.address.length > 8
          ? `${n.address.slice(0, 4)}...${n.address.slice(-4)}`
          : n.address;

      // Functional sizes: VASP (10), Burner (6), Normal (4)
      const val = n.isVasp ? 10 : isBurner ? 6 : 4;

      // Functional colors: VASP (Teal), Burner (Red), Normal (Gray)
      const color = n.isVasp
        ? "#0d9488"
        : isBurner
        ? "#ef4444"
        : "#64748b";

      return {
        id: n.address,
        label: truncated,
        role,
        nodeObj: n,
        val,
        color,
      };
    });

    const forceLinks: ForceLink[] = edges.map((e) => {
      const thickness = Math.min(Math.max(1, (e.value / maxVal) * 4), 4);
      const isSuspicious = e.value > 10000 || e.token === "USDT";

      return {
        id: e.txHash,
        source: e.from,
        target: e.to,
        label: `${e.value.toLocaleString()} ${e.token}`,
        width: thickness,
        suspicious: isSuspicious,
        edgeObj: e,
      };
    });

    return { nodes: forceNodes, links: forceLinks };
  }, [nodes, edges]);

  // Dynamic node color handling based on selection state
  const getNodeColor = useCallback(
    (node: object) => {
      const n = node as ForceNode;
      const isSelected = selectedNode?.address === n.id;
      if (isSelected) return "#38bdf8"; // Highlight active selection

      const isFocused =
        selectedNode || selectedEdge;

      if (isFocused) {
        return connectedNodeAddresses.has(n.id) ? n.color : "#1e293b"; // Dim unrelated nodes
      }

      return n.color;
    },
    [selectedNode, selectedEdge, connectedNodeAddresses]
  );

  // Dynamic node radius handling
  const getNodeVal = useCallback(
    (node: object) => {
      const n = node as ForceNode;
      if (selectedNode?.address === n.id) return n.val * 1.5;
      return n.val;
    },
    [selectedNode]
  );

  // Link color handling
  const getLinkColor = useCallback(
    (link: object) => {
      const l = link as ForceLink;
      const isSelected = selectedEdge?.txHash === l.id;
      if (isSelected) return "#38bdf8";

      const isFocused = selectedNode || selectedEdge;
      if (isFocused) {
        return connectedEdgeIds.has(l.id)
          ? l.suspicious
            ? "#f87171"
            : "#38bdf8"
          : "rgba(30, 41, 59, 0.2)"; // Dim unrelated edges
      }

      return l.suspicious ? "#f87171" : "#334155";
    },
    [selectedNode, selectedEdge, connectedEdgeIds]
  );

  // Link width handling
  const getLinkWidth = useCallback(
    (link: object) => {
      const l = link as ForceLink;
      const isSelected = selectedEdge?.txHash === l.id;
      if (isSelected) return 3;
      if (selectedNode && connectedEdgeIds.has(l.id)) return 2;
      return l.width;
    },
    [selectedNode, selectedEdge, connectedEdgeIds]
  );

  // Compact HTML Hover Tooltip
  const getNodeLabel = useCallback((node: object) => {
    const n = node as ForceNode;
    const obj = n.nodeObj;
    const flags = obj.typologyFlags.join(", ") || "None";
    return `
      <div style="
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid #334155;
        padding: 6px 10px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
        color: #e2e8f0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        <div style="font-weight: bold; color: #38bdf8;">${n.label}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
          Chain: <span style="color: #cbd5e1;">${obj.chain.toUpperCase()}</span> | Risk: <span style="color: ${obj.riskScore > 70 ? '#ef4444' : '#0d9488'};">${obj.riskScore}/100</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8;">
          Balance: <span style="color: #cbd5e1;">${obj.balance.toLocaleString()}</span>
        </div>
        <div style="font-size: 9px; color: #64748b; margin-top: 2px;">
          Flags: ${flags}
        </div>
      </div>
    `;
  }, []);

  const handleNodeClick = useCallback(
    (node: object) => {
      const n = node as ForceNode;
      onSelectNode?.(n.nodeObj);
      onSelectEdge?.(null);
    },
    [onSelectNode, onSelectEdge]
  );

  const handleLinkClick = useCallback(
    (link: object) => {
      const l = link as ForceLink;
      onSelectEdge?.(l.edgeObj);
      onSelectNode?.(null);
    },
    [onSelectNode, onSelectEdge]
  );

  const handleBackgroundClick = useCallback(() => {
    onSelectNode?.(null);
    onSelectEdge?.(null);
  }, [onSelectNode, onSelectEdge]);

  if (!webGlSupported || hasError) {
    return (
      <div className="w-full h-full min-h-[420px] bg-slate-950 border border-slate-800 rounded flex flex-col items-center justify-center p-6 text-center select-none font-mono">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
        <div className="text-slate-200 font-sans text-sm font-semibold mb-1">
          3D Visualization Unavailable
        </div>
        <div className="text-slate-400 text-xs max-w-sm mb-4">
          WebGL acceleration is disabled or unsupported in this browser session.
        </div>
        {onFallbackTo2D && (
          <button
            type="button"
            onClick={onFallbackTo2D}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-teal-400 hover:text-teal-300 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Switch to 2D Graph
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] bg-slate-950 border border-slate-800 rounded overflow-hidden select-none"
    >
      <ForceGraph3D
        ref={fgRef as unknown as React.MutableRefObject<ForceGraphMethods>}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#020617"
        nodeColor={getNodeColor}
        nodeVal={getNodeVal}
        nodeLabel={getNodeLabel}
        nodeRelSize={1}
        nodeResolution={16}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor={getLinkColor}
        linkCurvature={0.1}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
        onBackgroundClick={handleBackgroundClick}
        enableNodeDrag={true}
        showNavInfo={false}
      />

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs pointer-events-none">
          No Graph Topology Loaded
        </div>
      )}
    </div>
  );
});
