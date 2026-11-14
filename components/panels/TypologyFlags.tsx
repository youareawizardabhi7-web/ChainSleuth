"use client";

import React from "react";
import { TypologyFlag } from "@/lib/types";
import { Layers, Flame, Share2, Link2, Repeat, Info, AlertOctagon, ArrowRightLeft, Shuffle } from "lucide-react";

interface TypologyFlagsProps {
  flags: TypologyFlag[];
}

const TYPOLOGY_CONFIG: Record<
  string,
  {
    title: string;
    icon: React.ElementType;
    badgeStyle: string;
    explanation: string;
  }
> = {
  peeling_chain: {
    title: "Peeling chain detected",
    icon: Layers,
    badgeStyle: "bg-red-950/90 border-red-800 text-red-400",
    explanation:
      "Most of the transferred value continues to a new wallet while a smaller portion is repeatedly peeled away to cash out.",
  },
  zero_gas_burner: {
    title: "Zero-gas wallet",
    icon: Flame,
    badgeStyle: "bg-red-950/90 border-red-800 text-red-400",
    explanation:
      "Address initialized with zero native gas balance, relying on external fee sponsorship for token transfers.",
  },
  fan_out: {
    title: "Fan-out structuring",
    icon: Share2,
    badgeStyle: "bg-amber-950/90 border-amber-800 text-amber-400",
    explanation:
      "Funds split rapidly across multiple sub-wallets within a short window to distribute transfer volume.",
  },
  first_funder_match: {
    title: "Common gas funder match",
    icon: Link2,
    badgeStyle: "bg-purple-950/90 border-purple-800 text-purple-400",
    explanation:
      "Reverse gas fee tracing links this address to an external funding account identified across multiple cases.",
  },
  dex_swap: {
    title: "DEX swap hop",
    icon: Repeat,
    badgeStyle: "bg-cyan-950/90 border-cyan-800 text-cyan-400",
    explanation:
      "Automated liquidity pool swap transaction detected on a decentralized exchange protocol.",
  },
  ofac_sanctioned: {
    title: "OFAC SANCTIONS MATCH - CRITICAL",
    icon: AlertOctagon,
    badgeStyle: "bg-red-950 border-2 border-red-600 text-red-200 shadow-lg shadow-red-950/60",
    explanation:
      "This wallet address has been flagged by the backend as an explicit match against official OFAC sanctions databases.",
  },
  bridge_hop: {
    title: "Cross-chain bridge hop",
    icon: ArrowRightLeft,
    badgeStyle: "bg-cyan-950 border border-cyan-700 text-cyan-300",
    explanation:
      "Cross-chain liquidity bridge transaction flagged by the backend system for asset protocol transfer.",
  },
  coinjoin_mixer: {
    title: "CoinJoin mixer detected",
    icon: Shuffle,
    badgeStyle: "bg-purple-950/90 border-purple-800 text-purple-300",
    explanation: "Backend-detected CoinJoin mixing pattern.",
  },
  burner_wallet: {
    title: "Transit wallet detected",
    icon: Flame,
    badgeStyle: "bg-orange-950/90 border-orange-800 text-orange-400",
    explanation: "Temporary intermediary address used for rapid fund transit.",
  },
};

export function TypologyFlags({ flags }: TypologyFlagsProps) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="space-y-2 font-mono text-xs">
      {flags.map((flag, idx) => {
        const flagKey = typeof flag === "string" ? flag : String(flag);
        const config = TYPOLOGY_CONFIG[flagKey] || {
          title: flagKey.replace(/_/g, " "),
          icon: Info,
          badgeStyle: "bg-slate-900 border-slate-700 text-slate-300",
          explanation: "Backend Typology",
        };
        const Icon = config.icon;

        return (
          <div
            key={`${flagKey}-${idx}`}
            className={`p-2.5 rounded border ${config.badgeStyle} space-y-1`}
          >
            <div className="flex items-center gap-2 font-bold font-sans text-xs capitalize">
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{config.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono leading-normal pl-5">
              {config.explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
}
