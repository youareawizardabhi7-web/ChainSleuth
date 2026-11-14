"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NCRPBatchIngestResponse, IngestedSummaryItem, Chain } from "@/lib/types";
import { ingestNcrpComplaints, runNcrpBatchTrace } from "@/lib/api";
import { NcrpCorrelationDashboard } from "@/components/ncrp/NcrpCorrelationDashboard";
import {
  Database,
  Plus,
  Trash2,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  FileCode,
  ListPlus,
  Network,
} from "lucide-react";

export interface NCRPFormItem {
  complaint_id: string;
  acknowledgement_no?: string;
  category?: string;
  sub_category?: string;
  suspect_wallet_address: string;
  blockchain: Chain | string;
  transaction_hash?: string;
  loss_amount_inr?: number;
  complainant_state?: string;
  district?: string;
  incident_datetime?: string;
}

export default function NcrpIngestionPage() {
  const [mainTab, setMainTab] = useState<"ingestion" | "correlations">("ingestion");
  const [mode, setMode] = useState<"form" | "raw">("form");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "correlations") {
        setMainTab("correlations");
      }
    }
  }, []);
  const [complaints, setComplaints] = useState<NCRPFormItem[]>([
    {
      complaint_id: "",
      acknowledgement_no: "",
      category: "",
      sub_category: "",
      suspect_wallet_address: "",
      blockchain: "tron",
      transaction_hash: "",
      loss_amount_inr: undefined,
      complainant_state: "",
      district: "",
      incident_datetime: "",
    },
  ]);
  const [rawJson, setRawJson] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingestResponse, setIngestResponse] = useState<NCRPBatchIngestResponse | null>(null);

  const [batchTracing, setBatchTracing] = useState(false);
  const [batchTraceMessage, setBatchTraceMessage] = useState<string | null>(null);

  const handleAddRow = () => {
    setComplaints((prev) => [
      ...prev,
      {
        complaint_id: "",
        acknowledgement_no: "",
        category: "",
        sub_category: "",
        suspect_wallet_address: "",
        blockchain: "tron",
        transaction_hash: "",
        loss_amount_inr: undefined,
        complainant_state: "",
        district: "",
        incident_datetime: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (complaints.length === 1) return;
    setComplaints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof NCRPFormItem, value: unknown) => {
    setComplaints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validateComplaints = (items: NCRPFormItem[]): string | null => {
    if (items.length === 0) {
      return "At least one complaint record is required.";
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.complaint_id && !item.acknowledgement_no) {
        return `Record #${i + 1}: Complaint ID or Acknowledgement Number is required.`;
      }
      if (!item.suspect_wallet_address || !item.suspect_wallet_address.trim()) {
        return `Record #${i + 1}: Suspect wallet address is required.`;
      }
      if (!item.blockchain) {
        return `Record #${i + 1}: Blockchain network selection is required.`;
      }
    }
    return null;
  };

  const handleIngest = async () => {
    setError(null);
    setIngestResponse(null);
    setBatchTraceMessage(null);

    let rawRecords: NCRPFormItem[] = [];

    if (mode === "form") {
      const valErr = validateComplaints(complaints);
      if (valErr) {
        setError(valErr);
        return;
      }
      rawRecords = complaints;
    } else {
      try {
        const parsed = JSON.parse(rawJson);
        rawRecords = Array.isArray(parsed) ? parsed : parsed.complaints || [parsed];
        const valErr = validateComplaints(rawRecords);
        if (valErr) {
          setError(valErr);
          return;
        }
      } catch {
        setError("Invalid JSON format. Please paste a valid complaints array JSON.");
        return;
      }
    }

    const payloadComplaints = rawRecords.map((c, idx) => ({
      acknowledgement_number: c.acknowledgement_no?.trim() || c.complaint_id?.trim() || `ACK-${Date.now()}-${idx + 1}`,
      complainant_name: "Investigating Officer / Intelligence Feed",
      suspect_wallet_address: c.suspect_wallet_address.trim(),
      blockchain: c.blockchain || "tron",
      category: c.category || "Investment Fraud",
      sub_category: c.sub_category || undefined,
      reported_loss_inr: c.loss_amount_inr ? Number(c.loss_amount_inr) : undefined,
      incident_state: c.complainant_state || undefined,
    }));

    setLoading(true);
    try {
      const response = await ingestNcrpComplaints({ complaints: payloadComplaints });
      setIngestResponse(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection error: Unable to reach backend server.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTrace = async () => {
    if (!ingestResponse || !ingestResponse.records || ingestResponse.records.length === 0) return;
    setBatchTracing(true);
    setBatchTraceMessage(null);
    try {
      const caseIds = ingestResponse.records.map((r) => r.case_id).filter(Boolean);
      const results = await runNcrpBatchTrace(caseIds);
      setBatchTraceMessage(`Batch trace completed: ${results.length} trace graphs generated.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run multi-complaint batch trace.";
      setBatchTraceMessage(`Batch trace error: ${msg}`);
    } finally {
      setBatchTracing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="font-instrument text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Incident Intelligence & Batch Ingestion
            </h1>
            <p className="text-xs text-neutral-400 font-light mt-1">
              High-throughput complaint intake, multi-source record normalization, and syndicate clustering.
            </p>
          </div>

          {/* Top-Level Section Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMainTab("ingestion")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mainTab === "ingestion"
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Batch Ingestion</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("correlations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mainTab === "correlations"
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Syndicate Matrix</span>
            </button>
          </div>
        </div>

        {mainTab === "correlations" ? (
          <NcrpCorrelationDashboard />
        ) : (
          <div className="space-y-5">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                Data Input Mode
              </span>
              <div className="inline-flex p-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("form")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer text-xs ${
                    mode === "form"
                      ? "bg-white/10 text-white font-medium shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <ListPlus className="w-3 h-3" />
                  <span>Structured Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("raw")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer text-xs ${
                    mode === "raw"
                      ? "bg-white/10 text-white font-medium shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>JSON Array</span>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="font-semibold text-rose-300 font-sans">Ingestion Validation Notice</div>
                  <div className="text-white/70 font-mono text-[11px]">{error}</div>
                </div>
              </div>
            )}

            {/* FORM MODE */}
            {mode === "form" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                    Active Records ({complaints.length})
                  </span>

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Complaint</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {complaints.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span className="font-mono text-[10px] text-white/40 tracking-wider uppercase">
                          Record #{String(idx + 1).padStart(2, "0")}
                        </span>
                        {complaints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="text-rose-400/70 hover:text-rose-400 text-xs flex items-center gap-1 font-sans cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Row 1: Identification & Classification */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Complaint ID <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. NCRP-2026-9041"
                            value={item.complaint_id}
                            onChange={(e) => handleFieldChange(idx, "complaint_id", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Acknowledgement No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ACK-8839201"
                            value={item.acknowledgement_no || ""}
                            onChange={(e) => handleFieldChange(idx, "acknowledgement_no", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Financial Fraud"
                            value={item.category || ""}
                            onChange={(e) => handleFieldChange(idx, "category", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Sub-Category
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Crypto Investment Scam"
                            value={item.sub_category || ""}
                            onChange={(e) => handleFieldChange(idx, "sub_category", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 2: Asset & Blockchain Vector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Suspect Wallet Address <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"
                            value={item.suspect_wallet_address}
                            onChange={(e) =>
                              handleFieldChange(idx, "suspect_wallet_address", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Blockchain <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={item.blockchain}
                            onChange={(e) => handleFieldChange(idx, "blockchain", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          >
                            <option value="tron">TRON (TRX / TRC-20)</option>
                            <option value="base">BASE (Basescan / L2)</option>
                            <option value="ethereum">ETHEREUM (ETH / EVM)</option>
                            <option value="solana">SOLANA (SOL)</option>
                            <option value="bitcoin">BITCOIN (BTC UTXO)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Loss Amount (INR)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 250000"
                            value={item.loss_amount_inr ?? ""}
                            onChange={(e) => handleFieldChange(idx, "loss_amount_inr", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Row 3: Forensic Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Transaction Hash (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="0x... or transaction identifier"
                            value={item.transaction_hash || ""}
                            onChange={(e) => handleFieldChange(idx, "transaction_hash", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            Complainant State
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Delhi"
                            value={item.complainant_state || ""}
                            onChange={(e) => handleFieldChange(idx, "complainant_state", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
                            District
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. New Delhi"
                            value={item.district || ""}
                            onChange={(e) => handleFieldChange(idx, "district", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* RAW JSON IMPORT MODE */
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                    Complaints JSON Array Import
                  </label>
                  <span className="text-[10px] text-white/30 font-mono">
                    Schema: Array of complaint objects
                  </span>
                </div>
                <textarea
                  rows={9}
                  placeholder={`[\n  {\n    "complaint_id": "NCRP-2026-9041",\n    "suspect_wallet_address": "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",\n    "blockchain": "tron",\n    "loss_amount_inr": 250000\n  }\n]`}
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-white/20 font-mono text-xs focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            )}

            {/* INGEST ACTION BUTTON */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleIngest}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-medium text-xs hover:bg-white/90 transition-all duration-150 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Ingesting Incident Records...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Run Ingestion Pipeline</span>
                  </>
                )}
              </button>
            </div>

            {/* INGESTION RESULTS DASHBOARD */}
            {ingestResponse && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Ingestion Execution Summary
                      </div>
                      <div className="text-xs text-white/40 font-mono mt-0.5">
                        Ingested {ingestResponse.total_complaints} complaint(s) successfully ({ingestResponse.valid_wallets_count} verified wallet address(es)).
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBatchTrace}
                      disabled={!ingestResponse.records || ingestResponse.records.length === 0 || batchTracing}
                      title="Trigger batch trace execution on backend for ingested cases"
                      className="px-4 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {batchTracing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>Execute Multi-Case Batch Trace</span>
                    </button>
                  </div>

                  {batchTraceMessage && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 text-xs font-mono">
                      {batchTraceMessage}
                    </div>
                  )}

                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                        Ingested Complaints
                      </span>
                      <div className="text-2xl font-mono font-medium text-white">
                        {ingestResponse.total_complaints}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 block flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid Addresses
                      </span>
                      <div className="text-2xl font-mono font-medium text-emerald-400">
                        {ingestResponse.valid_wallets_count}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block flex items-center justify-center gap-1">
                        <Network className="w-3 h-3" /> Source Portal
                      </span>
                      <div className="text-sm font-mono font-medium text-white/80 pt-1">
                        {ingestResponse.source_portal || "NCRP / SAHYOG"}
                      </div>
                    </div>
                  </div>

                  {/* Confirmed Records Detail */}
                  {ingestResponse.records && ingestResponse.records.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-white/40">
                        Processed Records ({ingestResponse.records.length})
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {ingestResponse.records.map((rec: IngestedSummaryItem, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/80"
                          >
                            <div className="flex items-center gap-2.5">
                              {rec.is_valid_address ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="font-semibold text-white">{rec.acknowledgement_number}</span>
                              {rec.case_id && (
                                <span className="text-[10px] bg-white/[0.04] text-white/70 px-2 py-0.5 rounded-md border border-white/10 font-mono">
                                  #{rec.case_id}
                                </span>
                              )}
                              <span className="text-white/40 text-[11px]">
                                ({rec.chain.toUpperCase()} · {rec.suspect_address.slice(0, 6)}...{rec.suspect_address.slice(-4)})
                              </span>
                            </div>
                            <span className="text-emerald-400/90 text-[10px] font-mono uppercase tracking-wider">
                              {rec.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
