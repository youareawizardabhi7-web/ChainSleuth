"use client";

import React, { useState } from "react";
import { Clock, Zap, Check, Copy, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface InvestigativeAdvisoryPanelProps {
  recommendations?: string[];
  slaAlert?: string;
  caseId?: string;
}

function sanitizeAdvisory(text: string): string {
  if (!text) return "";
  return text
    .replace(/Section\s*94\s*(?:of\s*the\s*)?(?:BNSS|Bharatiya\s*Nagarik\s*Suraksha\s*Sanhita)(?:,?\s*\d{4})?\s*(?:freeze\s*notice|legal\s*freeze\s*notice)?/gi, "compliance freeze notice")
    .replace(/BNSS\s*§?\s*94\s*(?:freeze\s*notice)?/gi, "compliance freeze notice")
    .replace(/Section\s*63\s*(?:of\s*the\s*)?(?:BSA|Bharatiya\s*Sakshya\s*Adhiniyam)(?:,?\s*\d{4})?\s*(?:evidence\s*certificate|digital\s*evidence\s*certificate)?/gi, "cryptographic evidence certificate")
    .replace(/BSA\s*§?\s*63\s*(?:certificate)?/gi, "cryptographic evidence certificate")
    .replace(/NCRP\s*\/\s*SAHYOG\s*(?:portals|portal)?/gi, "incident records")
    .replace(/SAHYOG\s*(?:portal|portals)?/gi, "incident feed")
    .replace(/NCRP\s*(?:portal|portals)?/gi, "incident registry")
    .replace(/FIR\s*complaints?/gi, "correlated incident reports")
    .replace(/\bFIR\b/gi, "incident docket")
    .replace(/Subpoena\s*logs/gi, "Request compliance records")
    .replace(/courtroom admissibility/gi, "audit admissibility")
    .replace(/case diary/gi, "case dossier")
    .replace(/\bIO\b|\bInvestigating Officer\b/gi, "Investigator");
}

export function InvestigativeAdvisoryPanel({
  recommendations = [],
  slaAlert,
  caseId = "",
}: InvestigativeAdvisoryPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!slaAlert && recommendations.length === 0) return null;

  const isCriticalSla = slaAlert?.includes("CRITICAL");
  const isHighUrgency = slaAlert?.includes("HIGH URGENCY");

  const handleCopy = () => {
    const text = [
      `CASE FORENSIC ADVISORY — ${caseId}`,
      `SLA STATUS: ${sanitizeAdvisory(slaAlert || "Standard")}`,
      "",
      "ACTIONABLE FORENSIC RECOMMENDATIONS:",
      ...recommendations.map((r, i) => `${i + 1}. ${sanitizeAdvisory(r)}`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col overflow-hidden shadow-xl space-y-0">
      {/* SLA Alert Banner */}
      {slaAlert && (
        <div
          className={`p-3.5 flex items-start gap-2.5 border-b ${
            isCriticalSla
              ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
              : isHighUrgency
              ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
              : "bg-white/[0.03] border-white/10 text-white/80"
          }`}
        >
          {isCriticalSla ? (
            <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-sans text-xs leading-relaxed font-medium">
            {sanitizeAdvisory(slaAlert)}
          </div>
        </div>
      )}

      {/* Advisory Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white/60" />
          <span className="font-sans font-medium text-xs text-white">
            Forensic Recommendations ({recommendations.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/10 text-[10px] font-mono transition-all cursor-pointer"
            title="Copy recommendations to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      {isExpanded && recommendations.length > 0 && (
        <div className="p-3.5 space-y-2 max-h-72 overflow-y-auto">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start gap-2.5 text-xs text-white/80"
            >
              <span className="w-4 h-4 rounded-md bg-white/[0.06] border border-white/10 text-white font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="font-sans text-neutral-300 leading-relaxed text-[11px]">
                {sanitizeAdvisory(rec)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
