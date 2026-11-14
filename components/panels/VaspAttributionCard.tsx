"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VASPAttribution } from "@/lib/types";
import { downloadCourtEvidenceBundle } from "@/lib/api";
import { AddressBadge } from "@/components/ui/AddressBadge";
import { EvidenceCertModal } from "@/components/case/EvidenceCertModal";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Mail,
  Phone,
  Target,
  Layers,
  ArrowRight,
  Archive,
  Loader2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

interface VaspAttributionCardProps {
  attribution: VASPAttribution | null;
  caseId: string;
}

export function VaspAttributionCard({ attribution, caseId }: VaspAttributionCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  if (!attribution) return null;

  const handleExportBundle = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadCourtEvidenceBundle(caseId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection error: Unable to reach backend server.";
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs text-white/80 flex flex-col space-y-4 shadow-xl select-none relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              VASP Match Identified
            </div>
            <div className="text-sm font-semibold text-white font-sans">
              {attribution.vasp_name}
            </div>
          </div>
        </div>

        {/* FIU-IND Badge */}
        {attribution.is_fiu_registered ? (
          <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium font-sans">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            FIU-IND Registered
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium font-sans">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Unregistered VASP
          </span>
        )}
      </div>

      {/* Confidence Score & Plain-English Explanation */}
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-mono">
            Confidence Score
          </span>
          <span className="text-white font-mono font-medium text-xs">
            {attribution.confidence_score !== undefined && attribution.confidence_score !== null
              ? `${
                  attribution.confidence_score <= 1
                    ? Math.round(attribution.confidence_score * 100)
                    : Math.round(attribution.confidence_score)
                }% Confidence`
              : "N/A"}
          </span>
        </div>
        <p className="text-[11px] text-white/60 font-sans leading-normal">
          Attribution verified via deposit sweep heuristics connecting suspect trail directly to {attribution.vasp_name} infrastructure.
        </p>
      </div>

      {/* Address Distinction Section */}
      <div className="space-y-2.5">
        {/* Actionable Deposit Address */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-white font-medium text-[11px] font-sans">
              <Target className="w-3.5 h-3.5 text-white/70" />
              Actionable Deposit Address
            </span>
            <span className="text-[9px] bg-white/10 text-white px-2 py-0.5 rounded-md font-mono border border-white/10">
              Target
            </span>
          </div>
          <div className="pt-0.5">
            <AddressBadge address={attribution.deposit_address} truncateLength={8} />
          </div>
          <p className="text-[10px] text-white/40 font-mono leading-normal pt-1 border-t border-white/5">
            Primary KYC-linked account named in compliance notice.
          </p>
        </div>

        {/* Exchange Hot Wallet */}
        <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-white/40">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
              <Layers className="w-3 h-3 text-white/40" />
              Exchange Hot Wallet
            </span>
            <span className="text-[9px] text-white/40 font-mono">Pooled Liquidity</span>
          </div>
          <div>
            <AddressBadge address={attribution.hot_wallet_address} truncateLength={8} />
          </div>
          <p className="text-[10px] text-white/30 font-mono">
            Shared liquidity pool — do not target for freeze.
          </p>
        </div>
      </div>

      {/* Nodal Officer Contact Information */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
        <div className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
          Compliance Contact Details
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <Mail className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <span className="font-sans font-medium">{attribution.nodal_officer_email}</span>
          </div>
          {attribution.nodal_officer_phone && (
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="font-mono">{attribution.nodal_officer_phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportBundle}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-white/60" />
                <span>Evidence Bundle</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCertModalOpen(true)}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
            <span>Certificate</span>
          </button>
        </div>

        {exportError && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 text-xs font-mono flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{exportError}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportError(null)}
              className="text-rose-400 hover:text-white font-bold ml-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Generate Compliance Asset Freeze Notice */}
        <Link
          href={`/case/${caseId}/notice`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-black hover:bg-white/90 font-medium text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Issue Compliance Notice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Compile Judicial Case Docket */}
        <Link
          href={`/case/${caseId}/fir`}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer shadow-sm"
        >
          <FileCheck className="w-4 h-4 text-white/60" />
          <span>Case Docket</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <EvidenceCertModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        caseId={caseId}
      />
    </div>
  );
}
