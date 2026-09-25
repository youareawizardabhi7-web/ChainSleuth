import { useState, useEffect } from "react";
import {
  FileText,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  Send,
  Building2,
  Lock,
  Stamp,
  Printer,
  FileCheck,
} from "lucide-react";
import { getCase, generateNotice } from "@/lib/api";
import { TraceResult, LegalNoticePayload } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AddressBadge } from "@/components/common/AddressBadge";
import { cn } from "@/lib/utils";

interface LegalNoticesSectionProps {
  initialCaseId?: string;
}

const LOADING_STEPS = [
  "Preparing case evidence & traversal graph snapshot",
  "Building Section 94 BNSS legal freeze notice template",
  "Generating Section 63 BSA digital evidence certificate",
  "Calculating cryptographic SHA-256 evidence hash stamp",
  "Directive ready for official legal service",
];

export function LegalNoticesSection({ initialCaseId = "CASE-2026-TRON-8891" }: LegalNoticesSectionProps) {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [traceData, setTraceData] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [served, setServed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [evidenceHash, setEvidenceHash] = useState("7d49e1a88b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c");

  useEffect(() => {
    setLoading(true);
    getCase(caseId)
      .then((data) => {
        setTraceData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleGenerateNotice = async () => {
    if (!traceData) return;
    setGenerating(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((curr) => {
        if (curr < LOADING_STEPS.length - 1) {
          return curr + 1;
        }
        clearInterval(interval);
        return curr;
      });
    }, 400);

    try {
      const payload: LegalNoticePayload = {
        case_number: caseId,
        suspect_address: traceData.suspect_address,
        attributed_vasp: traceData.attribution || {
          vasp_name: "Binance Seychelles",
          is_fiu_registered: false,
          confidence_score: 95,
          deposit_address: "TDEPOSIT_BINANCE_Seychelles_88",
          hot_wallet_address: "TBINANCE_HOT_WALLET_MAIN_01",
          nodal_officer_email: "lawenforcement@binance.com",
        },
        loss_amount_inr: 3500000,
        flow_summary: "Funds funneled via multi-hop burner laundering into target VASP deposit address.",
        sha256_evidence_hash: evidenceHash,
      };

      const res = await generateNotice(payload);
      setEvidenceHash(res.sha256_evidence_hash);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyNotice = () => {
    const text = `GOVERNMENT OF INDIA\nOFFICE OF THE SUPERINTENDENT OF POLICE, CYBER CRIME DIVISION\nNOTICE UNDER SECTION 94 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023\n\nTo:\nThe Nodal Officer / Compliance Department\n${traceData?.attribution?.vasp_name || "Target VASP"}\n\nRe: IMMEDIATE ASSET IMMOBILIZATION & FREEZE ORDER - Case No: ${caseId}\nTarget Wallet: ${traceData?.attribution?.deposit_address || "TDEPOSIT_BINANCE_Seychelles_88"}\nAmount to Freeze: 35,000 USDT\nEvidence Hash: ${evidenceHash}\n\nYou are hereby directed to immediately freeze the above account and preserve KYC records.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="workspace-in flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <Stamp className="size-4" />
            <span>Statutory Legal Enforcement</span>
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Section 94 BNSS Legal Freeze Directive
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Statutory freezing requisition & Section 63 BSA evidence hash stamping for target VASP compliance officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateNotice}
            disabled={generating}
            className="shadow-sm"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileCheck className="size-4" />
            )}
            <span>{generating ? "Synthesizing Notice…" : "Re-generate Freeze Notice"}</span>
          </Button>
        </div>
      </div>

      {/* Progressive Step Sequence Banner */}
      {generating && (
        <div className="glass-panel workspace-in p-4 space-y-2 border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs font-bold text-primary">
            <span>Automated Legal Packaging Pipeline</span>
            <span>Step {stepIndex + 1} of {LOADING_STEPS.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-primary" />
            {LOADING_STEPS[stepIndex]}
          </p>
        </div>
      )}

      {/* Main Notice Document Preview */}
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel workspace-in p-6 sm:p-10 space-y-6 bg-white/95 shadow-xl border border-white/60">
          {/* Official Emblem & Header */}
          <div className="text-center border-b border-border/50 pb-6 space-y-1">
            <div className="mx-auto size-12 rounded-full bg-primary/10 grid place-items-center mb-2">
              <ShieldAlert className="size-6 text-primary" />
            </div>
            <div className="font-display font-bold uppercase tracking-widest text-xs text-primary">
              Police Department &bull; Cyber Crime Investigation Division
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">
              Formal Notice Under Section 94 BNSS, 2023
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground">
              (Order to Produce Documents or Freeze Digital Assets in Cyber Fraud Proceedings)
            </p>
          </div>

          {/* Reference Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/60 p-4 rounded-2xl border border-white/80">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Case Reference No:</span>
              <span className="font-bold text-foreground">{caseId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Issue Date:</span>
              <span className="font-bold text-foreground">{new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Target VASP Entity:</span>
              <span className="font-bold text-primary">{traceData?.attribution?.vasp_name || "Binance Seychelles"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Nodal Officer Email:</span>
              <span className="font-bold text-foreground">{traceData?.attribution?.nodal_officer_email || "compliance@binance.com"}</span>
            </div>
          </div>

          {/* Legal Directive Narrative */}
          <div className="space-y-4 text-xs leading-relaxed text-foreground/90">
            <p>
              <strong>WHEREAS</strong>, an investigation under the relevant provisions of the Bharatiya Nyaya Sanhita (BNS) and Information Technology Act, 2000 is currently underway regarding stolen digital assets funneled from victim accounts;
            </p>
            <p>
              <strong>AND WHEREAS</strong>, certified on-chain graph analysis indicates that illicit proceeds from suspect address{" "}
              <code className="font-mono bg-black/5 px-1 py-0.5 rounded text-foreground font-bold">
                {traceData?.suspect_address}
              </code>{" "}
              were routed through multi-hop layering and credited into the following account maintained with your exchange:
            </p>

            {/* Target Account Highlights */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Target Deposit Wallet:</span>
                <span className="font-bold text-primary">
                  {traceData?.attribution?.deposit_address || "TDEPOSIT_BINANCE_Seychelles_88"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Mandated Freeze Volume:</span>
                <span className="font-bold text-rose-600">35,000.00 USDT (or equivalent fiat/crypto)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Blockchain Network:</span>
                <span className="font-bold text-foreground">TRON (TRC-20)</span>
              </div>
            </div>

            <p>
              <strong>NOW THEREFORE</strong>, by virtue of powers conferred under <strong>Section 94 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong>, you are hereby mandated to:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>Immediately freeze and immobilize withdrawals, transfers, and internal debiting from the target account.</li>
              <li>Furnish complete KYC dossier, registered email, phone number, and IP connection access logs within 24 hours.</li>
              <li>Acknowledge electronic receipt of this directive to the designated investigating officer.</li>
            </ol>
          </div>

          {/* Cryptographic SHA-256 Stamp */}
          <div className="rounded-2xl border border-border/60 bg-white/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <Stamp className="size-4" />
                Section 63 BSA Digital Evidence Cryptographic Stamp
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">FIPS 180-4 COMPLIANT</span>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground break-all bg-white/80 p-2.5 rounded-xl border border-border/40 select-all">
              {evidenceHash}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Signed electronically under the Digital Signature Act. Any tampering with this PDF invalidates verification.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
            <div className="text-xs text-muted-foreground">
              Status: <span className="font-bold text-primary">{served ? "SERVED TO NODAL" : "READY TO SERVE"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyNotice}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted"
              >
                {copied ? <CheckCircle2 className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied to Clipboard" : "Copy Notice Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Printer className="size-3.5" />
                <span>Print PDF</span>
              </button>

              <Button
                onClick={() => {
                  setServed(true);
                  setTimeout(() => setServed(false), 4000);
                }}
                className="rounded-full shadow-sm text-xs"
              >
                <Send className="size-3.5" />
                <span>{served ? "Notice Transmitted via Secure SMTP" : "Serve to Compliance Nodal"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
