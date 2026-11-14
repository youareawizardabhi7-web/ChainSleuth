"use client";

import React from "react";
import { Chain } from "@/lib/types";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface FirParserPreviewProps {
  extractedAddress: string;
  extractedChain: Chain;
  scamType: string;
  amountInr: number;
  onAddressChange: (val: string) => void;
  onChainChange: (val: Chain) => void;
  onScamTypeChange: (val: string) => void;
  onAmountChange: (val: number) => void;
}

export function FirParserPreview({
  extractedAddress,
  extractedChain,
  scamType,
  amountInr,
  onAddressChange,
  onChainChange,
  onScamTypeChange,
  onAmountChange,
}: FirParserPreviewProps) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Extracted Entities</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Extracted Address */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-mono text-neutral-400 block mb-1.5 uppercase tracking-wider">
            Target Address
          </label>
          <input
            type="text"
            value={extractedAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-violet-500/80 transition-colors"
          />
        </div>

        {/* Detected Chain */}
        <div>
          <label className="text-[11px] font-mono text-neutral-400 block mb-1.5 uppercase tracking-wider">
            Network
          </label>
          <select
            value={extractedChain}
            onChange={(e) => onChainChange(e.target.value as Chain)}
            className="w-full h-10 px-3.5 bg-[#121212] border border-white/10 rounded-xl text-white text-xs font-sans focus:outline-none focus:border-violet-500/80 transition-colors cursor-pointer"
          >
            <option value="tron">TRON (TRC-20)</option>
            <option value="base">Base (Basescan / L2)</option>
            <option value="ethereum">Ethereum (ERC-20)</option>
            <option value="solana">Solana (SPL)</option>
            <option value="bitcoin">Bitcoin (UTXO)</option>
          </select>
        </div>

        {/* Typology / Scam Classification */}
        <div>
          <label className="text-[11px] font-mono text-neutral-400 block mb-1.5 uppercase tracking-wider">
            Typology Classification
          </label>
          <input
            type="text"
            value={scamType}
            onChange={(e) => onScamTypeChange(e.target.value)}
            className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs font-sans focus:outline-none focus:border-violet-500/80 transition-colors"
          />
        </div>

        {/* Amount Reported */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-mono text-neutral-400 block mb-1.5 uppercase tracking-wider">
            Estimated Loss Valuation (INR / Native)
          </label>
          <input
            type="number"
            value={amountInr || ""}
            placeholder="0.00"
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-violet-500/80 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
