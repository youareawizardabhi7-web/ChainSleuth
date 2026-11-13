# 🛰️ ChainSleuth: Frontend Integration Guide & Backend Upgrades
**Document for Frontend Engineer** | **Status: Ready for Implementation**

This guide outlines all the new features, endpoints, and data structures added to the ChainSleuth backend, along with exact TypeScript types, API calls, and UI components needed on the frontend.

---

## 📋 Table of Contents
1. [Executive Summary of Backend Changes](#1-executive-summary-of-backend-changes)
2. [TypeScript Type Definitions to Update (`lib/types.ts`)](#2-typescript-type-definitions-to-update-libtypests)
3. [New API Functions to Add (`lib/api.ts`)](#3-new-api-functions-to-add-libapits)
4. [New UI Features to Implement](#4-new-ui-features-to-implement)
   - [Feature A: AI Legal Forensic Report Modal](#feature-a-ai-legal-forensic-report-modal)
   - [Feature B: New Typology Badges (`coinjoin_mixer` & `burner_wallet`)](#feature-b-new-typology-badges)
   - [Feature C: In-App Wallet Tagging & Labeling Modal](#feature-c-in-app-wallet-tagging--labeling-modal)
   - [Feature D: Multi-Chain Selector (Bitcoin UTXO Support)](#feature-d-multi-chain-selector)

---

## 1. Executive Summary of Backend Changes

The backend has been upgraded with a 5-model AI/ML ensemble and new forensic endpoints:
1. **Trained AI/ML Models Active on Every Trace (`POST /api/v1/trace/`)**:
   - **GraphSAGE GNN** (`graphsage_risk.onnx`): Topological illicit flow scoring.
   - **XGBoost Typology Suite** (`peeling_chain`, `fan_out`, `coinjoin_mixer`, `burner_wallet`).
   - **Isolation Forest**: Unsupervised transaction velocity & anomaly index (0.0 to 1.0).
   - **Calibrated Ensemble Scorer**: 40% GNN, 30% Typology, 20% Anomaly, 10% Rules.
2. **New Dedicated Forensic Report Generator**:
   - `POST /api/v1/report/generate` produces a complete, court-admissible forensic intelligence docket and asset freeze directive.
3. **Live Custom Wallet Labeling & Intel Tagging**:
   - `GET /api/v1/vasp/tags/{address}` (fetches custom labels & VASP hot-wallet match).
   - `POST /api/v1/vasp/labels` (persists custom officer tags into Supabase + Upstash Redis).
4. **Full Multi-Chain Address Support**:
   - Address validation and tracing for `tron`, `ethereum`, `solana`, and `bitcoin` (Legacy `1...`, Script `3...`, SegWit `bc1q...`).

---

## 2. TypeScript Type Definitions to Update (`lib/types.ts`)

### A. Add New Typology Flags:
In `lib/types.ts`, update `TypologyFlag` to include the new ML-detected flags:
```typescript
export type TypologyFlag =
  | "peeling_chain"
  | "fan_out"
  | "zero_gas_burner"
  | "first_funder_match"
  | "dex_swap"
  | "ofac_sanctioned"
  | "bridge_hop"
  | "coinjoin_mixer"    // <-- NEW: Privacy Mixer / Tornado Cash detection
  | "burner_wallet";    // <-- NEW: XGBoost behavioral burner classifier
```

### B. Add Types for the AI Legal Report:
```typescript
export interface ForensicReportRequest {
  case_id: string;
  suspect_address: string;
  chain: string;
  nodes: WalletNode[];
  edges: TransferEdge[];
  overall_risk_score: number;
  attribution?: VASPAttribution | null;
  status?: string;
  created_at?: string;
}

export interface ForensicReportResponse {
  case_id: string;
  suspect_address: string;
  chain: string;
  overall_risk_score: number;
  report: string; // Markdown text containing court-admissible statutory analysis
}
```

### C. Add Types for Custom Wallet Tagging:
```typescript
export interface WalletTag {
  address: string;
  label: string;
  category: "exchange" | "scam" | "mixer" | "mule" | "merchant" | "other";
  source: string;
  notes?: string;
  created_at?: string;
}

export interface CreateWalletTagPayload {
  address: string;
  label: string;
  category: "exchange" | "scam" | "mixer" | "mule" | "merchant" | "other";
  source?: string;
  notes?: string;
}
```

---

## 3. New API Functions to Add (`lib/api.ts`)

Add these 3 async functions to `lib/api.ts`:

```typescript
/**
 * 1. Generate statutory court-admissible forensic report via Gemini AI
 * Calls POST /api/v1/report/generate
 */
export async function generateForensicReport(
  traceResult: TraceResult
): Promise<ForensicReportResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}/report/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(traceResult),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Report generation failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * 2. Fetch custom intel tags & VASP attribution for a wallet address
 * Calls GET /api/v1/vasp/tags/{address}
 */
export async function getWalletTags(address: string): Promise<WalletTag[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vasp/tags/${encodeURIComponent(address)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags || [];
  } catch (err) {
    console.error("Failed to fetch wallet tags:", err);
    return [];
  }
}

/**
 * 3. Save a new custom intel label for a wallet address into Supabase
 * Calls POST /api/v1/vasp/labels
 */
export async function saveWalletTag(payload: CreateWalletTagPayload): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}/vasp/labels`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to save tag (${res.status}): ${errorText}`);
  }
}
```

---

## 4. New UI Features to Implement

### Feature A: AI Legal Forensic Report Modal
**Where to put it**: In the Case View (`app/case/[id]/page.tsx`), right next to the `[Generate Section 94 Notice]` button.

**Behavior**:
1. Click `[📄 Generate Forensic AI Case Docket]`.
2. Shows a spinner: *"Analyzing graph topology & synthesizing statutory legal affidavit..."*.
3. Calls `generateForensicReport(caseData)`.
4. Renders a modal displaying the Markdown narrative (formatted with headings, legal citations under Section 94 BNSS & PMLA 2002, and suspect asset tables).
5. Provides a `[📋 Copy Report]` and `[💾 Save Markdown]` button.

---

### Feature B: New Typology Badges
**Where to put it**: Update `components/panels/TypologyFlags.tsx`.

Add configs for the 2 new backend flags:
```typescript
coinjoin_mixer: {
  title: "CoinJoin / Privacy Mixer Interaction",
  icon: Shuffle, // from lucide-react
  badgeStyle: "bg-purple-950/90 border-purple-800 text-purple-300",
  explanation:
    "Transaction hops interact with anonymizing mixer contracts (e.g. Tornado Cash, Wasabi) to obscure provenance.",
},
burner_wallet: {
  title: "XGBoost Burner Wallet",
  icon: Flame, // from lucide-react
  badgeStyle: "bg-red-950/90 border-red-800 text-red-400",
  explanation:
    "Machine learning classifier identified single-use disposable transit wallet characteristics.",
},
```

---

### Feature C: In-App Wallet Tagging & Labeling Modal
**Where to put it**: In `components/panels/WalletDetailPanel.tsx`.

**Behavior**:
1. In the `WalletDetailPanel`, under the address badge, add a small button: `[+ Add Intel Tag]`.
2. Clicking opens a simple modal with:
   - **Label Name**: e.g., *"Telegram Investment Scam Mule #3"*
   - **Category Dropdown**: `mule` | `scam` | `exchange` | `mixer` | `other`
   - **Notes**: Optional description
3. Calls `saveWalletTag(...)`.
4. Shows a green toast: *"Tag saved to intelligence database"*.

---

### Feature D: Multi-Chain Selector (Include Bitcoin UTXO)
**Where to put it**: In `components/intake/TraceForm.tsx`.

Ensure the chain dropdown includes all 4 backend-supported chains:
- `tron` — TRON (TRC-20 USDT)
- `ethereum` — Ethereum (ERC-20 & Native)
- `solana` — Solana (SPL Tokens)
- `bitcoin` — Bitcoin (UTXO & SegWit)

---

### 🚀 Summary Checklist for Frontend Dev
- [ ] Add `coinjoin_mixer` & `burner_wallet` to `lib/types.ts`
- [ ] Add `generateForensicReport()` to `lib/api.ts`
- [ ] Add `saveWalletTag()` & `getWalletTags()` to `lib/api.ts`
- [ ] Add the 2 new typology badge configs to `TypologyFlags.tsx`
- [ ] Add `[📄 Generate Forensic AI Case Docket]` button and preview modal on Case Page
- [ ] (Optional) Add `[+ Add Intel Tag]` button in `WalletDetailPanel.tsx`
