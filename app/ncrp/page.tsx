"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NCRPComplaint, NCRPIngestResponse } from "@/lib/types";
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

export default function NcrpIngestionPage() {
  const [mainTab, setMainTab] = useState<"ingestion" | "correlations">("ingestion");
  const [mode, setMode] = useState<"form" | "raw">("form");
  const [complaints, setComplaints] = useState<NCRPComplaint[]>([
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
  const [ingestResponse, setIngestResponse] = useState<NCRPIngestResponse | null>(null);

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

  const handleFieldChange = (index: number, field: keyof NCRPComplaint, value: unknown) => {
    setComplaints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const validateComplaints = (items: NCRPComplaint[]): string | null => {
    if (items.length === 0) {
      return "At least one complaint record is required.";
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.complaint_id || !item.complaint_id.trim()) {
        return `Row #${i + 1}: Complaint ID is required.`;
      }
      if (!item.suspect_wallet_address || !item.suspect_wallet_address.trim()) {
        return `Row #${i + 1}: Suspect wallet address is required.`;
      }
      if (!item.blockchain) {
        return `Row #${i + 1}: Blockchain selection is required.`;
      }
    }
    return null;
  };

  const handleIngest = async () => {
    setError(null);
    setIngestResponse(null);
    setBatchTraceMessage(null);

    let itemsToIngest: NCRPComplaint[] = [];

    if (mode === "form") {
      const valErr = validateComplaints(complaints);
      if (valErr) {
        setError(valErr);
        return;
      }
      itemsToIngest = complaints.map((c) => ({
        ...c,
        complaint_id: c.complaint_id.trim(),
        suspect_wallet_address: c.suspect_wallet_address.trim(),
        transaction_hash: c.transaction_hash?.trim() || undefined,
        loss_amount_inr: c.loss_amount_inr ? Number(c.loss_amount_inr) : undefined,
      }));
    } else {
      try {
        const parsed = JSON.parse(rawJson);
        itemsToIngest = Array.isArray(parsed) ? parsed : parsed.complaints || [parsed];
        const valErr = validateComplaints(itemsToIngest);
        if (valErr) {
          setError(valErr);
          return;
        }
      } catch (err: unknown) {
        setError("Invalid JSON format. Please paste a valid NCRP complaint array JSON.");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await ingestNcrpComplaints(itemsToIngest);
      setIngestResponse(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection error: Unable to reach backend server.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTrace = async () => {
    if (!ingestResponse || !ingestResponse.batch_trace_supported) return;
    setBatchTracing(true);
    setBatchTraceMessage(null);
    try {
      const ids =
        ingestResponse.successful_records?.map((r) => r.complaint_id) || [];
      const res = await runNcrpBatchTrace(ids);
      setBatchTraceMessage(res.message || "Multi-complaint batch trace launched successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run multi-complaint batch trace.";
      setBatchTraceMessage(`Batch trace error: ${msg}`);
    } finally {
      setBatchTracing(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col space-y-4 font-mono text-xs select-none max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-teal-950 border border-teal-600 text-teal-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold font-sans text-slate-100 uppercase tracking-wider">
                NCRP / SAHYOG Portal Intelligence
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">
                Official Law Enforcement Complaint Bulk Import & Cross-State Syndicate Correlation Matrix
              </p>
            </div>
          </div>
        </div>

        {/* Top-Level Section Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-0.5">
          <button
            type="button"
            onClick={() => setMainTab("ingestion")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t font-sans font-bold text-xs transition-colors cursor-pointer border-t border-x ${
              mainTab === "ingestion"
                ? "bg-slate-900 text-teal-400 border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200 border-transparent bg-transparent"
            }`}
          >
            <Database className="w-4 h-4 text-teal-400" />
            <span>Complaint Ingestion Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("correlations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-t font-sans font-bold text-xs transition-colors cursor-pointer border-t border-x ${
              mainTab === "correlations"
                ? "bg-slate-900 text-purple-400 border-slate-700 shadow"
                : "text-slate-400 hover:text-slate-200 border-transparent bg-transparent"
            }`}
          >
            <Network className="w-4 h-4 text-purple-400" />
            <span>Syndicate Correlation Dashboard</span>
          </button>
        </div>

        {mainTab === "correlations" ? (
          <NcrpCorrelationDashboard />
        ) : (
          <>
            {/* Mode Switcher */}
            <div className="flex items-center justify-end">
              <div className="flex items-center bg-slate-900 p-1 rounded border border-slate-800 font-sans text-xs">
                <button
                  type="button"
                  onClick={() => setMode("form")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${
                    mode === "form"
                      ? "bg-slate-800 text-teal-400 border border-slate-700 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Interactive Bulk Form
                </button>
                <button
                  type="button"
                  onClick={() => setMode("raw")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-colors cursor-pointer ${
                    mode === "raw"
                      ? "bg-slate-800 text-teal-400 border border-slate-700 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  JSON / Array Import
                </button>
              </div>
            </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/90 border border-red-700 rounded text-red-200 text-xs font-mono flex items-start gap-2 shadow">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold font-sans">Ingestion Error / Validation Failure</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* FORM MODE */}
        {mode === "form" ? (
          <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-lg p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-slate-200 font-sans uppercase text-xs tracking-wider">
                Ingestion Batch Complaints ({complaints.length} Record{complaints.length > 1 ? "s" : ""})
              </span>

              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700 rounded text-xs font-sans font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Complaint Row
              </button>
            </div>

            <div className="space-y-3 overflow-x-auto">
              {complaints.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                    <span>RECORD #{idx + 1}</span>
                    {complaints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Complaint ID */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Complaint ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="NCRP-2026-XXXX"
                        value={item.complaint_id}
                        onChange={(e) => handleFieldChange(idx, "complaint_id", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Acknowledgement No */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Acknowledgement No.
                      </label>
                      <input
                        type="text"
                        placeholder="ACK-8839201"
                        value={item.acknowledgement_no || ""}
                        onChange={(e) => handleFieldChange(idx, "acknowledgement_no", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="Financial Fraud"
                        value={item.category || ""}
                        onChange={(e) => handleFieldChange(idx, "category", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Sub Category */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Sub Category
                      </label>
                      <input
                        type="text"
                        placeholder="Crypto Investment Scam"
                        value={item.sub_category || ""}
                        onChange={(e) => handleFieldChange(idx, "sub_category", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Suspect Wallet Address */}
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Suspect Wallet Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"
                        value={item.suspect_wallet_address}
                        onChange={(e) =>
                          handleFieldChange(idx, "suspect_wallet_address", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Blockchain */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Blockchain <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={item.blockchain}
                        onChange={(e) => handleFieldChange(idx, "blockchain", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500 uppercase font-bold"
                      >
                        <option value="tron">TRON (TRX / TRC-20)</option>
                        <option value="ethereum">ETHEREUM (ETH / EVM)</option>
                        <option value="solana">SOLANA (SOL)</option>
                        <option value="bitcoin">BITCOIN (BTC UTXO)</option>
                      </select>
                    </div>

                    {/* Loss Amount INR */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Loss Amount (INR)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 250000"
                        value={item.loss_amount_inr ?? ""}
                        onChange={(e) => handleFieldChange(idx, "loss_amount_inr", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Transaction Hash */}
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Transaction Hash (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={item.transaction_hash || ""}
                        onChange={(e) => handleFieldChange(idx, "transaction_hash", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Complainant State */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        Complainant State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi"
                        value={item.complainant_state || ""}
                        onChange={(e) => handleFieldChange(idx, "complainant_state", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block font-semibold mb-0.5">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={item.district || ""}
                        onChange={(e) => handleFieldChange(idx, "district", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* RAW JSON IMPORT MODE */
          <div className="space-y-2 bg-slate-950 border border-slate-800 rounded-lg p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 font-sans uppercase">
                Paste Official NCRP Bulk Complaints JSON Array
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Format: Array of NCRPComplaint objects</span>
            </div>
            <textarea
              rows={10}
              placeholder='[\n  {\n    "complaint_id": "NCRP-2026-9041",\n    "suspect_wallet_address": "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",\n    "blockchain": "tron",\n    "loss_amount_inr": 250000\n  }\n]'
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        {/* INGEST ACTION BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleIngest}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-sans font-bold text-xs rounded transition-colors shadow-xl cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span className="text-slate-200">Ingesting Complaints to Backend...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Ingest Complaints to Backend (POST /api/v1/ncrp/ingest)</span>
              </>
            )}
          </button>
        </div>

        {/* INGESTION RESULTS DASHBOARD */}
        {ingestResponse && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded">
              <div>
                <div className="text-sm font-bold font-sans text-slate-100 uppercase tracking-wider">
                  Backend Ingestion Execution Summary
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {ingestResponse.message || "Complaints processed by server endpoint."}
                </div>
              </div>

              {/* Action: Run Multi-Complaint Batch Trace */}
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={handleBatchTrace}
                  disabled={!ingestResponse.batch_trace_supported || batchTracing}
                  title={
                    !ingestResponse.batch_trace_supported
                      ? "Multi-Complaint Batch Trace disabled: Backend endpoint does not expose batch tracing for this payload."
                      : "Trigger batch trace execution on backend"
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 border border-purple-500/50 disabled:border-slate-800 text-slate-100 font-sans font-bold text-xs rounded transition-colors shadow cursor-pointer disabled:cursor-not-allowed"
                >
                  {batchTracing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <Play className="w-4 h-4 text-purple-300" />
                  )}
                  <span>Run Multi-Complaint Batch Trace</span>
                </button>
                {!ingestResponse.batch_trace_supported && (
                  <span className="text-[9px] text-slate-500 mt-1">
                    (Disabled: Backend feature flag not exposed)
                  </span>
                )}
              </div>
            </div>

            {batchTraceMessage && (
              <div className="p-3 bg-purple-950/80 border border-purple-700 rounded text-purple-200 text-xs font-mono">
                {batchTraceMessage}
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded text-center space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Submitted</span>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {ingestResponse.submitted_count}
                </div>
              </div>

              <div className="p-3 bg-teal-950/60 border border-teal-700/80 rounded text-center space-y-1">
                <span className="text-teal-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Successful Ingestions
                </span>
                <div className="text-xl font-bold font-mono text-teal-300">
                  {ingestResponse.successful_count}
                </div>
              </div>

              <div className="p-3 bg-rose-950/60 border border-rose-700/80 rounded text-center space-y-1">
                <span className="text-rose-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Failed / Discarded
                </span>
                <div className="text-xl font-bold font-mono text-rose-300">
                  {ingestResponse.failed_count}
                </div>
              </div>
            </div>

            {/* Successful Records Detail */}
            {ingestResponse.successful_records && ingestResponse.successful_records.length > 0 && (
              <div className="space-y-2 bg-slate-950 border border-teal-800/80 rounded p-3">
                <div className="text-xs font-bold text-teal-300 font-sans uppercase">
                  Successfully Confirmed Backend Records
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  {ingestResponse.successful_records.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="font-bold">{rec.complaint_id}</span>
                        {rec.case_id && (
                          <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded border border-teal-800">
                            Case: {rec.case_id}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {rec.message || "Confirmed & Indexed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Records Detail */}
            {ingestResponse.failed_records && ingestResponse.failed_records.length > 0 && (
              <div className="space-y-2 bg-slate-950 border border-rose-800/80 rounded p-3">
                <div className="text-xs font-bold text-rose-300 font-sans uppercase">
                  Failed Records / Backend Validation Errors
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  {ingestResponse.failed_records.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-900 rounded border border-rose-900/60 flex items-center justify-between text-rose-200"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-bold">{rec.complaint_id}</span>
                      </div>
                      <span className="text-rose-300 text-[10px]">
                        {rec.error || rec.message || "Validation Error"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </AppShell>
  );
}
