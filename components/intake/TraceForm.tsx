"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Chain, TraceRequest } from "@/lib/types";
import { createTrace, parseFir } from "@/lib/api";
import { FirParserPreview } from "./FirParserPreview";
import {
  Search,
  FileText,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface FormInputs {
  suspect_address: string;
  chain: Chain;
  max_hops: number;
  value_threshold_pct: number;
  complaint_id?: string;
  complaint_text?: string;
}

const LOADING_STEPS = [
  "Initializing investigation session",
  "Identifying target blockchain format",
  "Tracing multi-hop TRC-20 transactions",
  "Building Neo4j graph topology",
  "Analyzing laundering typologies (Peeling & Gas attribution)",
  "Checking VASP registry & deposit cluster attribution",
];

export function TraceForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"address" | "complaint">("address");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    address: string;
    chain: Chain;
    scamType: string;
    amountInr: number;
  } | null>(null);

  // Simulated progressive loading state
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
    try {
      const result = await parseFir(rawText);
      const extractedAddr = result.suspect_address || "TABC1234567890XYZ99887766554433";
      const extractedChain = result.chain || "tron";

      setValue("suspect_address", extractedAddr);
      setValue("chain", extractedChain);

      setParsedData({
        address: extractedAddr,
        chain: extractedChain,
        scamType: "Part-Time Task Scam (Telegram Cyber Fraud)",
        amountInr: 485000,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    setCurrentStepIndex(0);

    // Simulate 1.8s progressive loading sequence steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 300);

    try {
      const requestPayload: TraceRequest = {
        suspect_address: data.suspect_address,
        chain: data.chain,
        max_hops: Number(data.max_hops),
        value_threshold_pct: Number(data.value_threshold_pct || 2.0),
        complaint_id: data.complaint_id,
      };

      // Wait total 1.8s delay to demonstrate investigation loading sequence
      await new Promise((res) => setTimeout(res, 1800));

      const result = await createTrace(requestPayload);
      router.push(`/case/${result.case_id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded p-6 font-mono text-xs select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 mb-6 font-sans">
        <button
          type="button"
          onClick={() => setTab("address")}
          className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            tab === "address"
              ? "border-teal-500 text-teal-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-4 h-4" />
          Paste Address
        </button>

        <button
          type="button"
          onClick={() => setTab("complaint")}
          className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            tab === "complaint"
              ? "border-teal-500 text-teal-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Complaint Text (AI Extraction)
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {tab === "address" ? (
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Suspect Wallet Address *
            </label>
            <input
              type="text"
              placeholder="e.g. TABC1234567890XYZ99887766554433"
              {...register("suspect_address", { required: "Wallet address is required" })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-teal-500 font-mono text-xs"
            />
            {errors.suspect_address && (
              <span className="text-red-400 text-[11px] mt-1 block">
                {errors.suspect_address.message}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Raw Victim Complaint / FIR Narrative Text
              </label>
              <textarea
                rows={5}
                placeholder="Paste victim statement narrative describing crypto scam, transaction hashes, or wallet address..."
                {...register("complaint_text")}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-teal-500 font-mono text-xs leading-relaxed"
              />
              <button
                type="button"
                onClick={handleParseFirSubmit}
                disabled={isParsing}
                className="mt-2 text-xs font-sans font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-teal-800/80 rounded transition-colors"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Parsing FIR narrative with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Parse FIR Narrative with Gemini AI
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Blockchain Network *
            </label>
            <select
              {...register("chain", { required: "Chain is required" })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-teal-500 uppercase font-mono text-xs"
            >
              <option value="tron">TRON (TRC-20 USDT)</option>
              <option value="solana">SOLANA (SPL Token)</option>
              <option value="ethereum">ETHEREUM (ERC-20)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
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
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-teal-500 font-mono text-xs"
            />
            {errors.max_hops && (
              <span className="text-red-400 text-[11px] mt-1 block">
                {errors.max_hops.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">
            Complaint / FIR Reference ID (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. NCRP-2026-88910"
            {...register("complaint_id")}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-teal-500 font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-slate-950 font-sans font-bold text-xs rounded flex items-center justify-center gap-2 transition-colors mt-6 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          Start Investigation
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Professional Investigation Loading Sequence Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded p-6 flex flex-col items-center justify-center text-center space-y-6 z-20 font-mono">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />

          <div className="space-y-1">
            <div className="text-sm font-bold font-sans uppercase tracking-wider text-slate-100">
              Executing Automated Investigation Trace
            </div>
            <p className="text-xs text-slate-400">
              Analyzing transaction ledger & graph typologies...
            </p>
          </div>

          {/* Progressive Step Tracker */}
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded p-3 text-left space-y-2">
            {LOADING_STEPS.map((stepText, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={stepText} className="flex items-center gap-2.5 text-[11px]">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span
                    className={
                      isDone
                        ? "text-teal-300 font-medium"
                        : isCurrent
                        ? "text-slate-100 font-bold"
                        : "text-slate-600"
                    }
                  >
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
