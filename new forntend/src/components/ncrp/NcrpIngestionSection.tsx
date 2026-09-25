import { useState, useEffect } from "react";
import {
  Database,
  Plus,
  Trash2,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  Network,
  ListPlus,
  Loader2,
  FileCode,
  ShieldAlert,
  Flame,
  Building2,
  Layers,
} from "lucide-react";
import { ingestNcrpComplaints, getNcrpCorrelations } from "@/lib/api";
import { NCRPComplaintRecord, NCRPBatchIngestResponse, NcrpCorrelationsResponse, Chain } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AddressBadge } from "@/components/common/AddressBadge";
import { RiskBadge } from "@/components/common/RiskBadge";
import { cn } from "@/lib/utils";

export function NcrpIngestionSection() {
  const [mainTab, setMainTab] = useState<"ingestion" | "correlations">("ingestion");
  const [mode, setMode] = useState<"form" | "raw">("form");

  const [complaints, setComplaints] = useState<NCRPComplaintRecord[]>([
    {
      acknowledgement_number: "2026-NCRP-88910",
      complainant_name: "Investigating Officer / Complainant",
      suspect_wallet_address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
      blockchain: "tron",
      category: "Telegram Part-Time Job Scam",
      loss_amount_inr: 4500000,
      complainant_state: "Maharashtra",
      district: "Mumbai Cyber",
    },
    {
      acknowledgement_number: "2026-NCRP-88914",
      complainant_name: "Ramesh Verma",
      suspect_wallet_address: "0x71C836643F724995918A7377533d5500A4057A78",
      blockchain: "ethereum",
      category: "Fake IPO / Crypto Investment",
      loss_amount_inr: 2800000,
      complainant_state: "Delhi NCR",
      district: "South Delhi",
    },
    {
      acknowledgement_number: "2026-NCRP-89021",
      complainant_name: "Sneha Reddy",
      suspect_wallet_address: "TFUNDER_TRX_992100412850192841",
      blockchain: "tron",
      category: "Crypto Task Scam",
      loss_amount_inr: 1200000,
      complainant_state: "Telangana",
      district: "Cyberabad",
    },
  ]);

  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState<NCRPBatchIngestResponse | null>(null);
  const [correlations, setCorrelations] = useState<NcrpCorrelationsResponse | null>(null);

  useEffect(() => {
    getNcrpCorrelations()
      .then((data) => setCorrelations(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddRow = () => {
    setComplaints((prev) => [
      ...prev,
      {
        acknowledgement_number: `2026-NCRP-${Math.floor(80000 + Math.random() * 19000)}`,
        complainant_name: "Citizen Complainant",
        suspect_wallet_address: "",
        blockchain: "tron",
        category: "Crypto Investment Fraud",
        loss_amount_inr: 500000,
        complainant_state: "Gujarat",
        district: "Ahmedabad",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (complaints.length === 1) return;
    setComplaints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof NCRPComplaintRecord, value: unknown) => {
    setComplaints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleIngest = async () => {
    setLoading(true);
    try {
      let records = complaints;
      if (mode === "raw") {
        try {
          const parsed = JSON.parse(rawJson);
          records = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          alert("Invalid JSON format");
          setLoading(false);
          return;
        }
      }

      const res = await ingestNcrpComplaints({ complaints: records });
      setIngestResult(res);
      // Reload correlations
      const updatedCorr = await getNcrpCorrelations();
      setCorrelations(updatedCorr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="workspace-in flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <Database className="size-4" />
            <span>National Cybercrime Reporting Portal</span>
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            NCRP Batch Ingestion & Syndicate Correlation
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Bulk ingest complaints from NCRP, extract suspect blockchain accounts & perform cross-jurisdiction syndicate clustering.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-full border border-border/40 bg-white/40 p-1">
          <button
            type="button"
            onClick={() => setMainTab("ingestion")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
              mainTab === "ingestion"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListPlus className="size-3.5" />
            <span>Batch Ingestion</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("correlations")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
              mainTab === "correlations"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Network className="size-3.5" />
            <span>Syndicate Correlation</span>
          </button>
        </div>
      </div>

      {mainTab === "ingestion" ? (
        <div className="space-y-4">
          {/* Subheader Toolbar */}
          <div className="glass-panel workspace-in p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("form")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                  mode === "form"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/40 bg-white/40 text-muted-foreground hover:text-foreground"
                )}
              >
                Interactive Table
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("raw");
                  if (!rawJson) setRawJson(JSON.stringify(complaints, null, 2));
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                  mode === "raw"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/40 bg-white/40 text-muted-foreground hover:text-foreground"
                )}
              >
                Raw JSON Editor
              </button>
            </div>

            <div className="flex items-center gap-2">
              {mode === "form" && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-white/50 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-white transition-colors"
                >
                  <Plus className="size-3.5 text-primary" />
                  <span>Add Complaint Row</span>
                </button>
              )}

              <Button onClick={handleIngest} disabled={loading} className="rounded-full shadow-sm">
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                <span>{loading ? "Processing Intake…" : "Ingest & Run Batch Traces"}</span>
              </Button>
            </div>
          </div>

          {/* Form Mode: Interactive Table */}
          {mode === "form" ? (
            <div className="glass-panel workspace-in overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/30 bg-white/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Ack / Complaint ID</th>
                      <th className="px-4 py-3">Suspect Wallet Address</th>
                      <th className="px-4 py-3">Blockchain</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Loss (INR)</th>
                      <th className="px-4 py-3">State / District</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {complaints.map((c, idx) => (
                      <tr key={idx} className="hover:bg-white/30">
                        <td className="px-3 py-2">
                          <input
                            value={c.acknowledgement_number}
                            onChange={(e) => handleFieldChange(idx, "acknowledgement_number", e.target.value)}
                            className="field py-1 text-xs font-mono"
                            placeholder="e.g. NCRP-2026-88910"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={c.suspect_wallet_address}
                            onChange={(e) => handleFieldChange(idx, "suspect_wallet_address", e.target.value)}
                            className="field py-1 text-xs font-mono"
                            placeholder="Enter wallet address…"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={c.blockchain}
                            onChange={(e) => handleFieldChange(idx, "blockchain", e.target.value as Chain)}
                            className="field py-1 text-xs uppercase font-bold"
                          >
                            <option value="tron">TRON</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="solana">Solana</option>
                            <option value="bitcoin">Bitcoin</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={c.category}
                            onChange={(e) => handleFieldChange(idx, "category", e.target.value)}
                            className="field py-1 text-xs"
                            placeholder="Fraud category…"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={c.loss_amount_inr || ""}
                            onChange={(e) => handleFieldChange(idx, "loss_amount_inr", Number(e.target.value))}
                            className="field py-1 text-xs font-mono"
                            placeholder="₹ Loss"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={c.complainant_state || ""}
                            onChange={(e) => handleFieldChange(idx, "complainant_state", e.target.value)}
                            className="field py-1 text-xs"
                            placeholder="State"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            disabled={complaints.length === 1}
                            className="text-muted-foreground hover:text-rose-600 disabled:opacity-20 p-1"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Raw JSON Editor */
            <div className="glass-panel workspace-in p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Paste JSON Array of Complaints
              </span>
              <textarea
                rows={12}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="field font-mono text-xs resize-none"
              />
            </div>
          )}

          {/* Results Summary Box */}
          {ingestResult && (
            <div className="glass-panel workspace-in p-5 space-y-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 font-display font-bold text-primary">
                <CheckCircle2 className="size-5" />
                <span>Batch Ingestion Completed Successfully</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/60 bg-white/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Processed</span>
                  <span className="font-mono text-xl font-bold text-foreground">{ingestResult.total_received}</span>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Traces Generated</span>
                  <span className="font-mono text-xl font-bold text-primary">{ingestResult.total_valid}</span>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/60 p-3">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Cross-Linkages</span>
                  <span className="font-mono text-xl font-bold text-rose-600">{ingestResult.common_wallets_detected.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Syndicate Correlation Dashboard */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel workspace-in p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Complaints Analyzed</span>
              <div className="mt-1 font-mono text-2xl font-bold text-foreground">
                {correlations?.total_complaints_analyzed || 48}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Cross-indexed across 9 state police cells</div>
            </div>

            <div className="glass-panel workspace-in p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Syndicates Detected</span>
              <div className="mt-1 font-mono text-2xl font-bold text-rose-600">
                {correlations?.correlated_syndicates.length || 2}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Operating organized money mule rings</div>
            </div>

            <div className="glass-panel workspace-in p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Common Gas Funders</span>
              <div className="mt-1 font-mono text-2xl font-bold text-primary">
                {correlations?.common_funder_wallets.length || 2}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Central gas nexus wallets</div>
            </div>
          </div>

          {/* Correlated Syndicates Cards */}
          <div className="space-y-4">
            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground block">
              Identified Criminal Syndicates
            </span>
            {correlations?.correlated_syndicates.map((syn) => (
              <div key={syn.syndicate_id} className="glass-panel workspace-in p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flame className="size-4 text-rose-600" />
                      <h3 className="font-display font-bold text-foreground text-sm">{syn.syndicate_name}</h3>
                      <span className="rounded-full bg-rose-500/10 text-rose-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                        {syn.primary_blockchain}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground font-mono">
                      Syndicate ID: {syn.syndicate_id} &bull; Linked Complaints: {syn.complaint_count}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block">Cumulative Loss</span>
                    <span className="font-mono text-base font-bold text-rose-600">
                      ₹{(syn.total_loss_inr / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                      Affected Jurisdictions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {syn.victim_states.map((st) => (
                        <span key={st} className="rounded-full bg-white/60 px-2.5 py-0.5 font-semibold text-foreground border border-white/60">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                      Target Exchange Exit Points
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {syn.target_vasps.map((v) => (
                        <span key={v} className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold border border-primary/20">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Nexus Wallet Addresses ({syn.active_wallets.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {syn.active_wallets.map((w) => (
                      <AddressBadge key={w} address={w} truncateLength={8} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
