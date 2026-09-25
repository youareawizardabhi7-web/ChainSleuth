import { useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { GlassSelect } from "@/components/ui/glass-select";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { startTrace } from "@/lib/api";
import { Chain } from "@/lib/types";

interface NewInvestigationSectionProps {
  onInvestigationCreated?: (caseId: string) => void;
  tabsOpacity?: number;
}

export function NewInvestigationSection({
  onInvestigationCreated,
  tabsOpacity = 10,
}: NewInvestigationSectionProps) {
  const [activeTab, setActiveTab] = useState<"address" | "complaint">("address");
  const [address, setAddress] = useState("TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9");
  const [complaintText, setComplaintText] = useState("");
  const [network, setNetwork] = useState("TRON (TRC-20 USDT)");
  const [maxHops, setMaxHops] = useState(5);
  const [complaintId, setComplaintId] = useState("NCRP-2026-88910");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ripple, setRipple] = useState<{ tab: "address" | "complaint"; x: number; y: number; id: number } | null>(null);

  function handleTabClick(tab: "address" | "complaint", event: MouseEvent<HTMLButtonElement>) {
    setActiveTab(tab);
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({ tab, x: event.clientX - rect.left, y: event.clientY - rect.top, id: Date.now() });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    let chain: Chain = "tron";
    if (network.includes("Ethereum")) chain = "ethereum";
    else if (network.includes("Solana")) chain = "solana";
    else if (network.includes("Bitcoin")) chain = "bitcoin";

    try {
      const res = await startTrace({
        suspect_address: address,
        chain,
        max_hops: Number(maxHops),
        complaint_id: complaintId,
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(false);
        if (onInvestigationCreated && res?.case_id) {
          onInvestigationCreated(res.case_id);
        }
      }, 1200);
    } catch {
      setIsSubmitting(false);
      setSubmitted(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="workspace-in mb-7">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
          <Search className="size-4" />
          <span>Asset trace intake</span>
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">New Trace Intake</h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Initiate algorithmic multi-hop blockchain asset traversal from a suspect address or complaint narrative.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel workspace-in [animation-delay:100ms]">
        <div
          style={{ backgroundColor: `color-mix(in oklab, white ${tabsOpacity}%, transparent)` }}
          className="grid grid-cols-2 border-b border-white/30"
        >
          <button
            type="button"
            onClick={(e) => handleTabClick("address", e)}
            className="relative min-h-14 overflow-hidden px-4 text-sm font-semibold text-muted-foreground transition-[background-color,color,transform] duration-200 active:scale-[0.97] sm:px-6 cursor-pointer"
          >
            {ripple?.tab === "address" && (
              <span key={ripple.id} aria-hidden className="tab-ripple" style={{ left: ripple.x, top: ripple.y }} />
            )}
            <span className={cn("relative z-10 inline-block", activeTab === "address" && "font-bold text-primary")}>
              Paste Address
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => handleTabClick("complaint", e)}
            className="relative min-h-14 overflow-hidden px-4 text-sm font-semibold text-muted-foreground transition-[background-color,color,transform] duration-200 active:scale-[0.97] sm:px-6 cursor-pointer"
          >
            {ripple?.tab === "complaint" && (
              <span key={ripple.id} aria-hidden className="tab-ripple" style={{ left: ripple.x, top: ripple.y }} />
            )}
            <span className={cn("relative z-10 inline-block", activeTab === "complaint" && "font-bold text-primary")}>
              Complaint Text <span className="hidden sm:inline">(AI Extraction)</span>
            </span>
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          <div key={activeTab} className="tab-swap">
            {activeTab === "address" ? (
              <Field
                label="Suspect Wallet Address"
                required
                hint="Supported: TRON, EVM, Solana, or Bitcoin addresses."
              >
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="field font-mono"
                  placeholder="e.g. TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9"
                />
              </Field>
            ) : (
              <Field
                label="Complaint Narrative"
                required
                hint="Paste the relevant complaint text to identify wallet addresses via LLM extraction."
              >
                <textarea
                  required
                  rows={4}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="field resize-none"
                  placeholder="Paste cybercrime complaint or FIR narrative here…"
                />
              </Field>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Blockchain Network" required>
              <GlassSelect
                defaultValue={network}
                options={["TRON (TRC-20 USDT)", "Ethereum (ERC-20)", "Solana (Native)", "Bitcoin"]}
                ariaLabel="Blockchain network"
              />
            </Field>
            <Field label="Max Hops (1 to 10)" required>
              <input
                type="number"
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                min={1}
                max={10}
                className="field"
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label="Complaint / FIR Reference ID" hint="Optional">
            <input
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              className="field"
              placeholder="e.g. NCRP-2026-88910"
            />
          </Field>

          <Button type="submit" size="wide" disabled={isSubmitting}>
            <ShieldCheck className="size-4" />
            {submitted ? "Investigation queued — Generating graph…" : "Start Investigation"}
            <ArrowRight className={cn("size-4 transition-transform", submitted && "translate-x-1")} />
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground">
        {label}
        {required && <span className="text-primary">*</span>}
        {hint && <span className="ml-auto font-normal normal-case">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
