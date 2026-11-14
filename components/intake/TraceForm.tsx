"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Chain, TraceRequest, TraceResult, WalletNode, TypologyFlag } from "@/lib/types";
import { createTrace, parseFir } from "@/lib/api";
import { FirParserPreview } from "./FirParserPreview";
import {
  Search,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface FormInputs {
  suspect_address: string;
  chain: Chain;
  max_hops: number;
  value_threshold_pct: number;
  complaint_id?: string;
  complaint_text?: string;
}

export function TraceForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"address" | "complaint">("address");
  const [isParsing, setIsParsing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    address: string;
    chain: Chain;
    scamType: string;
    amountInr: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      suspect_address: "",
      chain: "tron",
      max_hops: 5,
      value_threshold_pct: 2.0,
      complaint_id: "",
    },
  });

  const handleParseFirSubmit = async () => {
    const rawText = getValues("complaint_text");
    if (!rawText || !rawText.trim()) return;

    setIsParsing(true);
    setSubmitError(null);
    try {
      const result = await parseFir(rawText);
      const extractedAddr = result.suspect_address || "";
      const extractedChain = result.chain || "tron";

      if (!extractedAddr) {
        setSubmitError("Could not extract a valid suspect wallet address from the incident narrative.");
        return;
      }

      setValue("suspect_address", extractedAddr);
      setValue("chain", extractedChain);

      setParsedData({
        address: extractedAddr,
        chain: extractedChain,
        scamType: "Extracted Narrative Target",
        amountInr: 0,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to parse incident narrative.";
      setSubmitError(msg);
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    setSubmitError(null);
    setTraceResult(null);

    try {
      const requestPayload: TraceRequest = {
        suspect_address: data.suspect_address.trim(),
        chain: data.chain,
        max_hops: Number(data.max_hops),
        value_threshold_pct: Number(data.value_threshold_pct || 2.0),
        complaint_id: data.complaint_id,
      };

      const result = await createTrace(requestPayload);
      setTraceResult(result);
      setLoading(false);

      // Auto-navigate to case workbench
      setTimeout(() => {
        router.push(`/case/${result.case_id}`);
      }, 1500);
    } catch (err: unknown) {
      console.warn("[TraceForm] Trace execution error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initiate trace with backend API.";
      setSubmitError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl rounded-3xl bg-white/[0.02] border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Submit Error Banner */}
      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-400 hover:text-white font-bold ml-2 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 text-xs select-none">
        <button
          type="button"
          onClick={() => setTab("address")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition-all cursor-pointer ${
            tab === "address"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Direct Wallet Address</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("complaint")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition-all cursor-pointer ${
            tab === "complaint"
              ? "bg-white text-black font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incident Narrative (NLP)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {tab === "address" ? (
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Suspect Wallet Address *
            </label>
            <input
              type="text"
              placeholder="e.g. TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9 or 0xd8da6bf..."
              {...register("suspect_address", { required: "Wallet address is required" })}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 font-mono text-xs transition-colors"
            />
            <div className="text-[11px] text-neutral-500 mt-2 font-light">
              Supported networks: TRON (T...), EVM (0x...), Solana (Base58), or Bitcoin (1..., 3..., bc1...).
            </div>
            {errors.suspect_address && (
              <span className="text-rose-400 text-xs mt-1.5 block">
                {errors.suspect_address.message}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Incident Narrative / Case Dossier Brief
              </label>
              <textarea
                rows={5}
                placeholder="Paste victim narrative or case brief describing crypto fraud, transaction hashes, or suspect wallet addresses..."
                {...register("complaint_text")}
                className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 font-mono text-xs leading-relaxed transition-colors"
              />
              <button
                type="button"
                onClick={handleParseFirSubmit}
                disabled={isParsing}
                className="mt-3 text-xs font-sans font-medium text-neutral-300 hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                    <span>Extracting entities via Neural NLP...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Extract Entities with NLP Engine</span>
                  </>
                )}
              </button>
            </div>

            {/* Extracted Parameters Review Panel */}
            {parsedData && (
              <FirParserPreview
                extractedAddress={getValues("suspect_address") || parsedData.address}
                extractedChain={getValues("chain") || parsedData.chain}
                scamType={parsedData.scamType}
                amountInr={parsedData.amountInr}
                onAddressChange={(val) => {
                  setValue("suspect_address", val);
                  setParsedData((prev) => (prev ? { ...prev, address: val } : null));
                }}
                onChainChange={(val) => {
                  setValue("chain", val);
                  setParsedData((prev) => (prev ? { ...prev, chain: val } : null));
                }}
                onScamTypeChange={(val) =>
                  setParsedData((prev) => (prev ? { ...prev, scamType: val } : null))
                }
                onAmountChange={(val) =>
                  setParsedData((prev) => (prev ? { ...prev, amountInr: val } : null))
                }
              />
            )}
          </div>
        )}

        {/* Common Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Blockchain Network *
            </label>
            <select
              {...register("chain", { required: "Chain is required" })}
              className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-violet-500/80 text-xs font-sans transition-colors cursor-pointer"
            >
              <option value="tron">TRON (TRC-20 USDT)</option>
              <option value="solana">Solana (SPL Token)</option>
              <option value="ethereum">Ethereum (ERC-20)</option>
              <option value="bitcoin">Bitcoin (BTC UTXO)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Max Hops (1 to 10) *
            </label>
            <input
              type="number"
              min={1}
              max={10}
              {...register("max_hops", {
                required: "Max hops is required",
                min: { value: 1, message: "Min 1 hop" },
                max: { value: 10, message: "Max 10 hops" },
              })}
              className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-violet-500/80 font-mono text-xs transition-colors"
            />
            {errors.max_hops && (
              <span className="text-rose-400 text-xs mt-1.5 block">
                {errors.max_hops.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Case Reference Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. CS-2026-88910"
            {...register("complaint_id")}
            className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 font-mono text-xs transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md mt-6 cursor-pointer disabled:opacity-50"
        >
          <span>Start Investigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Real Execution Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />

          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-widest text-violet-400 font-semibold">
              Forensic Traversal
            </div>
            <div className="text-base font-medium font-sans text-white">
              Executing multi-hop ledger walk...
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed font-light">
              Walking transaction graph, attributing exchange deposit endpoints, and calculating ensemble risk scores.
            </p>
          </div>
        </div>
      )}

      {/* Post-Trace Telemetry Result Overlay */}
      {!loading && traceResult && (
        <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
          <div className="w-full max-w-md rounded-2xl bg-white/[0.03] border border-white/10 p-5 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-violet-300 font-semibold">
                Trace Telemetry Result
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            </div>

            {(() => {
              const suspectNode =
                traceResult.nodes?.find(
                  (n: WalletNode) => n.address.toLowerCase() === traceResult.suspect_address.toLowerCase()
                ) || traceResult.nodes?.[0];

              const overallRiskDisplay =
                traceResult.overall_risk_score !== undefined && traceResult.overall_risk_score !== null
                  ? `${traceResult.overall_risk_score}/100`
                  : "Unavailable";

              const gnnRiskDisplay =
                suspectNode?.gnn_risk_score !== undefined && suspectNode?.gnn_risk_score !== null
                  ? String(suspectNode.gnn_risk_score)
                  : "Unavailable";

              const anomalyScoreDisplay =
                suspectNode?.anomaly_score !== undefined && suspectNode?.anomaly_score !== null
                  ? String(suspectNode.anomaly_score)
                  : "Unavailable";

              const vaspDisplay = traceResult.attribution?.vasp_name || "Unattributed";

              const typologies = suspectNode?.typologyFlags;

              return (
                <div className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-neutral-500 text-[10px] uppercase">Overall Risk</div>
                      <div className="font-bold text-white text-sm mt-0.5">{overallRiskDisplay}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-neutral-500 text-[10px] uppercase">GNN Score</div>
                      <div className="font-bold text-white text-sm mt-0.5">{gnnRiskDisplay}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-neutral-500 text-[10px] uppercase">Anomaly Index</div>
                      <div className="font-bold text-white text-sm mt-0.5">{anomalyScoreDisplay}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-neutral-500 text-[10px] uppercase">Attributed VASP</div>
                      <div className="font-bold text-emerald-400 text-sm mt-0.5 truncate">{vaspDisplay}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="text-neutral-500 text-[10px] uppercase">Detected Typologies</div>
                    {typologies === undefined || typologies === null ? (
                      <div className="text-neutral-400 italic">None detected</div>
                    ) : typologies.length === 0 ? (
                      <div className="text-neutral-400">None detected</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {typologies.map((t: TypologyFlag | string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/40 text-violet-300 border border-violet-800/40 uppercase font-medium"
                          >
                            {String(t)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 text-center pt-1 font-sans">
                    Opening interactive forensic graph workbench...
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
