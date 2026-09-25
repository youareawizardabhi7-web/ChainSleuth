import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Tag,
  X,
  ExternalLink,
} from "lucide-react";
import { getVaspRegistry } from "@/lib/api";
import { CustomWalletLabelItem } from "@/lib/types";
import { AddressBadge } from "@/components/common/AddressBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VaspDirectorySection() {
  const [vasps, setVasps] = useState<CustomWalletLabelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Centralized Exchange (CEX)");
  const [newChain, setNewChain] = useState("tron");
  const [newNotes, setNewNotes] = useState("");

  const loadData = () => {
    setLoading(true);
    getVaspRegistry()
      .then((data) => setVasps(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredVasps = vasps.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (v.entity_name || "").toLowerCase().includes(q);
    const addrMatch = (v.address || "").toLowerCase().includes(q);
    const typeMatch = (v.entity_type || "").toLowerCase().includes(q);
    const notesMatch = (v.notes || "").toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || addrMatch || typeMatch || notesMatch;
    const matchesChain =
      selectedChain === "all" ||
      (v.chain && v.chain.toLowerCase() === selectedChain.toLowerCase());

    return matchesSearch && matchesChain;
  });

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newName) return;

    setVasps((prev) => [
      {
        address: newAddress,
        entity_name: newName,
        entity_type: newType,
        chain: newChain,
        notes: newNotes,
        is_verified: true,
        confidence_score: 95,
      },
      ...prev,
    ]);

    setIsAddModalOpen(false);
    setNewAddress("");
    setNewName("");
    setNewNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="workspace-in flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <Building2 className="size-4" />
            <span>Virtual Asset Service Providers</span>
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            VASP & Threat Intel Labeled Registry
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Curated intelligence database of verified exchanges, deposit sweep consolidators & compliance nodal officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/40 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-white"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin text-primary")} />
            <span>Refresh</span>
          </button>
          <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full shadow-sm text-xs">
            <Plus className="size-3.5" />
            <span>Add Custom Label</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel workspace-in p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by entity name, address, category, or notes…"
              className="field pl-9 pr-4 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground ml-1" />
            <span className="text-[11px] font-bold uppercase text-muted-foreground">Chain:</span>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="field w-auto px-3 py-1.5 text-xs font-semibold"
            >
              <option value="all">All Chains</option>
              <option value="tron">TRON</option>
              <option value="ethereum">Ethereum</option>
              <option value="solana">Solana</option>
              <option value="bitcoin">Bitcoin</option>
            </select>
          </div>
        </div>
      </div>

      {/* VASP Table */}
      <div className="glass-panel workspace-in overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/30 bg-white/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Entity Name</th>
                <th className="px-4 py-3">Wallet Address</th>
                <th className="px-4 py-3">Category / Role</th>
                <th className="px-4 py-3">Chain</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredVasps.map((vasp) => (
                <tr key={vasp.address} className="hover:bg-white/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span>{vasp.entity_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <AddressBadge address={vasp.address} truncateLength={6} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {vasp.entity_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/60 border border-white/60 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                      {vasp.chain}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                      <CheckCircle2 className="size-3" />
                      Verified ({vasp.confidence_score || 95}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={vasp.notes}>
                    {vasp.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Custom Wallet Label */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg p-6 space-y-4 bg-white/95 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  Add Custom Intelligence Label
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddLabel} className="space-y-4 text-xs">
              <label className="block space-y-1.5">
                <span className="font-bold uppercase text-[10px] text-muted-foreground">Wallet Address *</span>
                <input
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"
                  className="field font-mono"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="font-bold uppercase text-[10px] text-muted-foreground">Entity Name *</span>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Binance Internal Sweep #3"
                  className="field"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="font-bold uppercase text-[10px] text-muted-foreground">Category</span>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="field"
                  >
                    <option value="Centralized Exchange (CEX)">Centralized Exchange (CEX)</option>
                    <option value="FIU-IND Registered VASP">FIU-IND Registered VASP</option>
                    <option value="Decentralized Mixer / Swap">Decentralized Mixer / Swap</option>
                    <option value="Suspected Syndicate Mule">Suspected Syndicate Mule</option>
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="font-bold uppercase text-[10px] text-muted-foreground">Blockchain</span>
                  <select
                    value={newChain}
                    onChange={(e) => setNewChain(e.target.value)}
                    className="field uppercase font-bold"
                  >
                    <option value="tron">TRON</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                    <option value="bitcoin">Bitcoin</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="font-bold uppercase text-[10px] text-muted-foreground">Investigative Notes</span>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context or FIR cross references…"
                  className="field resize-none"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Entity Label
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
