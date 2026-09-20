"use client";

import React from "react";
import { Download, ShieldCheck, FileCheck } from "lucide-react";
import { AddressBadge } from "@/components/ui/AddressBadge";

interface NoticePreviewProps {
  caseId?: string;
  vaspName?: string;
  depositAddress?: string;
  evidenceHash?: string;
}

export function NoticePreview({
  caseId = "CS-2026-8891",
  vaspName = "CoinDCX (Neblio Technologies Pvt Ltd)",
  depositAddress = "TCOINDCXDEPOSIT9988776655443311",
  evidenceHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
}: NoticePreviewProps) {
  return (
    <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded p-6 font-mono text-xs text-slate-300 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="text-teal-400 font-bold text-sm tracking-wider uppercase">
            FORMAL FREEZE ORDER — SECTION 94 BNSS, 2023
          </div>
          <div className="text-slate-500 mt-0.5">Reference Case ID: {caseId}</div>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-sans font-bold rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF Notice
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded space-y-2 leading-relaxed">
        <p className="font-bold text-slate-200">TO: Nodal Compliance Officer, {vaspName}</p>
        <p>
          WHEREAS information has been laid before the undersigned Cyber Crime Police Station regarding stolen victim funds routed through crypto networks...
        </p>
        <p className="text-teal-300 font-semibold">
          YOU ARE HEREBY DIRECTED TO IMMEDIATELY FREEZE AND RESTRAIN MOVEMENT ON THE SPECIFIED DEPOSIT ACCOUNT:
        </p>
        <div className="py-2">
          <span className="text-slate-500 block mb-1">KYC Deposit Address:</span>
          <AddressBadge address={depositAddress} truncateLength={10} />
        </div>
      </div>

      {/* Section 63 BSA Digital Evidence Certificate */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded space-y-2">
        <div className="flex items-center gap-2 text-teal-400 font-semibold border-b border-slate-800 pb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Section 63 BSA Evidence Certificate (Digital Evidence Hash Stamp)</span>
        </div>
        <div className="text-slate-400 text-[11px] leading-normal">
          This document carries a cryptographically verifiable SHA-256 hash stamp corresponding to the graph traversal chain recorded at the time of legal notice issuance.
        </div>
        <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-300">
          <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="truncate bg-slate-950 px-2 py-1 border border-slate-800 rounded w-full">
            {evidenceHash}
          </span>
        </div>
      </div>
    </div>
  );
}
