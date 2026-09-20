# 🛡️ ChainSleuth — Crypto Fraud Investigation & Asset Tracing Console

> **Smart India Hackathon (SIH26183) + Web3 / Security Track**  
> *Automated multi-chain asset tracing, laundering typology detection, VASP deposit attribution, and Section 94 BNSS legal freeze notice generator for Indian Cyber Crime Law Enforcement.*

---

## 📌 Executive Summary

When crypto fraud occurs, criminals launder stolen funds across disposable burner wallets, peeling chains, fan-out smurfing splits, and DEX swaps before depositing into exchanges (VASPs like CoinDCX, WazirX, or Binance) to cash out into fiat currency. Criminals cash out within **~30 minutes**, whereas manual investigation currently takes hours or days.

**ChainSleuth** automates the entire investigation pipeline:
1. Ingests suspect wallet addresses or raw victim FIR complaint narratives via **Gemini AI NLP extraction**.
2. Executes **Value-Weighted BFS graph traversal** across blockchain ledgers.
3. Detects laundering typologies (**Peeling Chains**, **First-Funder Syndicate Attribution**, **Fan-Out Smurfing**).
4. Pinpoints the individual **KYC Deposit Address** (not the shared exchange hot wallet).
5. Auto-generates a court-admissible **Section 94 BNSS Legal Freeze Directive** stamped with a **Section 63 BSA SHA-256 Digital Evidence Certificate** in under 30 seconds.

---

## 💡 Core Domain Concepts & Heuristics

| Concept | Explanation | Algorithmic Importance |
| :--- | :--- | :--- |
| **Deposit Address vs. Hot Wallet** | Exchange deposit addresses belong to specific KYC users; hot wallets pool millions of deposits together. | **Load-bearing distinction:** Freezing a hot wallet is invalid. ChainSleuth steps back 1 hop prior to the sweep to isolate the actionable deposit account. |
| **First-Funder / Gas Attribution** | Burner wallets start with 0 native gas currency (TRX/ETH/SOL). | Tracing backwards to the wallet supplying gas fees links separate victim FIR complaints to the same crime syndicate. |
| **Peeling Chain Detection** | Laundering technique where an address repeatedly passes ~85–90% onward while peeling off <15%. | Detected via consecutive hop transfer split ratios. |
| **Fan-Out / Smurfing** | Splitting large sums across 10+ fresh addresses in a short window. | Detected by volume and outdegree burst transactions. |
| **Section 94 BNSS Directive** | Indian criminal procedure law for compelling asset freezes. | Formally addresses the VASP Nodal Officer with mandatory freeze directives. |
| **Section 63 BSA Certificate** | Indian digital evidence law requirement. | Stamps an immutable SHA-256 hash of the graph traversal snapshot on the generated order. |

---

## 🎨 Design Semantics & Color Palette

Built as a dark-mode-first, desktop-first SIEM crime-operations command center (`1366x768` to `1920x1080` optimized):

- ⚪ **Gray (`#475569`):** Neutral / intermediate transit wallets
- 🔴 **Coral / Red (`#ef4444`):** Suspicious burner wallets & detected laundering typologies
- 🟢 **Teal / Green (`#0d9488`):** Attributed VASP deposit target addresses (Actionable Freeze Target)

---

## ⚙️ Architecture & Features

```
  1. INTAKE            2. TRACING          3. PATTERN DETECTION      4. VASP TARGET         5. LEGAL FREEZE
┌──────────────┐     ┌──────────────┐     ┌────────────────────┐   ┌─────────────────┐    ┌─────────────────┐
│ Victim FIR   │ ──► │ Multi-hop    │ ──► │ Peeling Chains &   │ ──►│ Identifies      │ ──►│ Section 94 BNSS │
│ / Suspect    │     │ Tron/Solana  │     │ Syndicate Gas      │   │ Individual KYC  │    │ Freeze Notice + │
│ Address      │     │ Ledger Walk  │     │ Funder Link        │   │ Deposit Account │    │ SHA-256 Cert    │
└──────────────┘     └──────────────┘     └────────────────────┘   └─────────────────┘    └─────────────────┘
```

### 1. Internal Access Console (`/login`)
- Role-selection access screen with demo state persisted in Zustand & `localStorage`.
- **Three Roles:**
  - `Investigating Officer (IO)`: Initiate traces, inspect transaction graphs, flag suspect addresses.
  - `Supervisory Officer`: Review case files, approve & sign Section 94 BNSS notices, access audit logs.
  - `VASP Nodal Officer`: Read-only compliance officer interface for receiving freeze orders.

### 2. Case Management Dashboard (`/dashboard`)
- 4 SIEM metric cards: *Active Investigations*, *High Risk Cases ($\ge 75$)*, *Pending Approval*, *VASP Attributions*.
- Search bar (Case ID or wallet address) + Chain filters (All / TRON / Solana / Ethereum).
- **Supervisor Role Gate:** Extra *"Pending Approval"* filter tab for case sign-offs.
- Data table sorted by **Risk Score descending** with truncated addresses and inline copy buttons.

### 3. Investigation Intake Screen (`/trace/new`)
- **Tab 1 — Paste Address:** Direct input (`suspect_address`, `chain`, `max_hops`, `complaint_id`).
- **Tab 2 — Paste Complaint Text:** Raw victim FIR narrative text area + Gemini AI NLP parsing button.
- **Editable Parameter Review Panel:** Review & edit extracted parameters before launching investigation.
- **Progressive Loading Overlay:** 1.8-second simulated investigation loading sequence tracker.

### 4. Graph Investigation Workbench (`/case/[caseId]`)
- **Center Canvas:** Powered by **Cytoscape.js** with `breadthfirst` directional flow layout.
- **Graph Controls:** Zoom in/out, fit to view, re-layout, label toggle, and hop depth filter slider (1 to 10).
- **Interactive Edge Popovers:** Click any transaction arrow to inspect TX Hash, From, To, Value, Token, and Timestamp.
- **Right Panel (`WalletDetailPanel.tsx`):** Wallet balance, first seen date, risk score, typology badges with plain-English explanations, and transaction list.

### 5. Legal Freeze Directive & Evidence Certificate (`/case/[caseId]/notice`)
- **Payoff Card (`VaspAttributionCard.tsx`):** Highlights **ACTIONABLE DEPOSIT ADDRESS** (Teal border, `FREEZE TARGET` badge) vs. **EXCHANGE HOT WALLET** (`SHARED POOL — Do NOT freeze`).
- **Section 94 BNSS Order:** Document preview with `[ DEMO / DRAFT LEGAL DIRECTIVE ]` watermark.
- **Section 63 BSA Certificate:** SHA-256 cryptographic hash stamp (`e3b0c44298fc...`) with one-click copy and PDF download.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (SIEM Dark Console styling)
- **Graph Network Engine:** Cytoscape.js (`cytoscape` & `@types/cytoscape`)
- **State Management:** Zustand (Persisted role & active case state)
- **Form Validation:** React Hook Form
- **Iconography:** Lucide React

---

## 📂 Project Structure

```
TRACEX FRONT/
├── app/
│   ├── layout.tsx                # Root layout & dark mode metadata
│   ├── page.tsx                  # Redirects to /dashboard
│   ├── login/page.tsx            # Role selector (IO / Supervisor / VASP Nodal)
│   ├── dashboard/
│   │   ├── page.tsx              # Case management dashboard
│   │   └── audit/page.tsx        # Supervisory audit log
│   ├── trace/new/page.tsx        # New trace intake form
│   └── case/[caseId]/
│       ├── page.tsx              # Main Graph Workbench centerpiece
│       └── notice/page.tsx       # Section 94 BNSS Legal Freeze Directive
├── components/
│   ├── graph/
│   │   ├── GraphCanvas.tsx       # Cytoscape.js graph canvas wrapper
│   │   ├── GraphControls.tsx     # Zoom, fit, re-layout & hop slider
│   │   └── graphStyles.ts        # Cytoscape stylesheet (Gray / Red / Teal)
│   ├── panels/
│   │   ├── WalletDetailPanel.tsx # Wallet node inspector & transaction list
│   │   ├── VaspAttributionCard.tsx# Attributed VASP target payoff card
│   │   └── TypologyFlags.tsx     # Laundering typology badges with explanations
│   ├── intake/
│   │   ├── TraceForm.tsx         # Intake form & progressive loading sequence
│   │   └── FirParserPreview.tsx  # Gemini AI extracted parameters review panel
│   ├── legal/
│   │   ├── NoticeGeneratorButton.tsx # Role-gated action button (IO vs Supervisor)
│   │   └── NoticePreview.tsx     # BNSS §94 order & BSA §63 evidence hash stamp
│   ├── case/
│   │   ├── CaseTable.tsx         # Active case table sorted by risk score
│   │   └── RiskBadge.tsx         # 0-100 Fraud risk score badge
│   ├── layout/
│   │   ├── AppShell.tsx          # Top bar & sidebar wrapper
│   │   ├── Sidebar.tsx          # Desktop navigation & role indicator
│   │   └── RoleSwitcher.tsx      # Role toggle component
│   └── ui/
│       └── AddressBadge.tsx      # Truncated address display (0x3f4a...9c21) with copy feedback
└── lib/
    ├── api.ts                    # Typed API client & 12-node TRON mock dataset
    ├── store.ts                  # Zustand state store
    └── types.ts                  # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / pnpm / yarn

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/youareawizardabhi7-web/ChainSleuth.git
cd ChainSleuth

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification Commands

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Build production bundle
npm run build
```

---

## 📄 License

Developed for **Smart India Hackathon 2026 (SIH26183)** and **MLH Web3/Security Track**.
