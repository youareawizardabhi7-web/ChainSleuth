"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedStepper, Step } from "@/components/ui/AnimatedStepper";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  Search,
  ArrowRight,
  GitBranch,
  Zap,
  Building2,
  BrainCircuit,
  Sparkles,
  Scale,
  ShieldCheck,
  Activity,
  ShieldAlert,
  ChevronRight,
  Lock,
  Layers,
  FileCheck2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function SynapseLandingPage() {
  const router = useRouter();
  const [quickAddress, setQuickAddress] = useState("");

  const handleQuickTrace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddress.trim()) {
      router.push("/trace/new");
      return;
    }
    router.push(`/trace/new?address=${encodeURIComponent(quickAddress.trim())}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-neutral-100 overflow-x-hidden font-inter selection:bg-violet-900/50 selection:text-violet-200">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FLOATING AMBIENT ORBS & BACKGROUND GRADIENTS
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Center Violet Glow */}
        <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-[rgba(139,92,246,0.38)] rounded-full blur-[110px] animate-float-orb-1 opacity-70" />

        {/* Left-Center Cyan Glow */}
        <div className="absolute top-[35%] -left-[160px] w-[550px] h-[550px] bg-[rgba(6,182,212,0.18)] rounded-full blur-[130px] animate-float-orb-2 opacity-60" />

        {/* Bottom-Right Violet Glow */}
        <div className="absolute bottom-[10%] -right-[120px] w-[600px] h-[600px] bg-[rgba(139,92,246,0.22)] rounded-full blur-[140px] animate-float-orb-1 opacity-50" />

        {/* Micro-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FIXED NAVIGATION PILL
      ───────────────────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[672px] z-50 rounded-full bg-[#0a0a0a]/70 backdrop-blur-[16px] border border-white/10 px-5 py-2.5 flex items-center justify-between shadow-[0_10px_35px_-10px_rgba(0,0,0,0.8)]">
        {/* Left Logo */}
        <Link href="/" className="group">
          <BrandLogo size="md" />
        </Link>

        {/* Center Links (In-page scroll) */}
        <div className="hidden sm:flex items-center gap-7 text-[12px] uppercase font-inter tracking-[0.08em] text-neutral-400">
          <a
            href="#workflow"
            className="hover:text-white transition-colors duration-200"
          >
            Workflow
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#about"
            className="hover:text-white transition-colors duration-200"
          >
            About
          </a>
        </div>

        {/* Right CTA */}
        <Link
          href="/dashboard"
          className="bg-white text-black text-[12px] font-semibold px-5 py-1.5 rounded-full hover:bg-neutral-200 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
        >
          Login
        </Link>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. HERO SECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-4 flex flex-col items-center justify-center text-center z-10 max-w-6xl mx-auto">
        {/* Massive Editorial Heading */}
        <h1 className="font-instrument text-5xl sm:text-7xl md:text-8xl lg:text-[104px] font-normal tracking-[-0.035em] leading-[0.92] text-white max-w-5xl mb-7">
          Cryptocurrency Forensics & Asset{" "}
          <span className="text-shimmer italic font-normal">Intelligence</span>
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl text-neutral-400 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-10">
          Multi-chain transaction graph traversal, gas funder attribution, exchange deposit identification, and formal compliance freeze notices.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md mb-12">
          {/* Primary Shiny Border Button */}
          <Link href="/trace/new" className="shiny-border-btn w-full sm:w-auto">
            <span className="relative z-10 bg-[#0a0a0a] text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-full flex items-center justify-center gap-2.5 hover:bg-neutral-900 transition-colors">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </span>
          </Link>

          {/* Secondary Link */}
          <Link
            href="/dashboard"
            className="text-neutral-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 py-2 px-4"
          >
            <span>Open Case Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Direct Address Investigation Bar */}
        <form
          onSubmit={handleQuickTrace}
          className="w-full max-w-xl relative rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-1.5 flex items-center shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] focus-within:border-violet-500/60 transition-all duration-300"
        >
          <div className="pl-3.5 pr-2 text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={quickAddress}
            onChange={(e) => setQuickAddress(e.target.value)}
            placeholder="Search wallet address (TRON, Base, Ethereum, Solana, Bitcoin)..."
            className="w-full bg-transparent text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 font-mono outline-none py-1.5 pr-2"
          />
          <button
            type="submit"
            className="bg-white/10 hover:bg-white text-neutral-200 hover:text-black font-semibold text-xs px-4 py-2 rounded-full transition-all duration-200 shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. METRICS TICKER (40s Infinite Loop)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-y border-white/5 bg-black/40 py-3.5 backdrop-blur-sm z-10">
        <div className="animate-ticker flex items-center gap-14 whitespace-nowrap">
          {/* Loop Set 1 */}
          <div className="flex items-center gap-14">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                CHAINS MONITORED
              </span>
              <span className="text-sm font-mono text-cyan-400 font-medium">
                TRON • ETH • SOL • BTC • BASE
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                CASHOUT SLA
              </span>
              <span className="text-sm font-mono text-emerald-400 font-medium">
                ~28.4 MINS
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                GRAPH HOP LATENCY
              </span>
              <span className="text-sm font-mono text-white font-medium">
                &lt; 850 MS
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                ML RISK ENSEMBLE
              </span>
              <span className="text-sm font-mono text-violet-400 font-medium">
                GRAPHSAGE GNN + ISOFOREST
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                COMPLIANCE STATUS
              </span>
              <span className="text-sm font-mono text-white font-medium">
                INSTANT FREEZE DIRECTIVES
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                VASP RECOGNITION
              </span>
              <span className="text-sm font-mono text-cyan-400 font-medium">
                BINANCE • COINDCX • WAZIRX
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                EVIDENCE TAMPER SEAL
              </span>
              <span className="text-sm font-mono text-emerald-400 font-medium">
                SHA-256 CANONICAL HASH
              </span>
            </div>
          </div>

          {/* Loop Set 2 (Identical for seamless infinite scroll) */}
          <div className="flex items-center gap-14">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                CHAINS MONITORED
              </span>
              <span className="text-sm font-mono text-cyan-400 font-medium">
                TRON • ETH • SOL • BTC • BASE
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                CASHOUT SLA
              </span>
              <span className="text-sm font-mono text-emerald-400 font-medium">
                ~28.4 MINS
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                GRAPH HOP LATENCY
              </span>
              <span className="text-sm font-mono text-white font-medium">
                &lt; 850 MS
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                ML RISK ENSEMBLE
              </span>
              <span className="text-sm font-mono text-violet-400 font-medium">
                GRAPHSAGE GNN + ISOFOREST
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                COMPLIANCE STATUS
              </span>
              <span className="text-sm font-mono text-white font-medium">
                INSTANT FREEZE DIRECTIVES
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                VASP RECOGNITION
              </span>
              <span className="text-sm font-mono text-cyan-400 font-medium">
                BINANCE • COINDCX • WAZIRX
              </span>
            </div>
            <span className="text-white/10">•</span>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500">
                EVIDENCE TAMPER SEAL
              </span>
              <span className="text-sm font-mono text-emerald-400 font-medium">
                SHA-256 CANONICAL HASH
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4B. INTERACTIVE INVESTIGATION PIPELINE (ANIMATED STEPPER)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="workflow" className="relative z-10 max-w-4xl mx-auto px-4 py-20 sm:py-28 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-instrument text-4xl sm:text-5xl text-white font-normal tracking-tight">
            Investigation Workflow
          </h2>
          <p className="text-neutral-400 text-sm mt-3 font-light leading-relaxed">
            From complaint ingestion to multi-hop graph traversal, exchange attribution, and compliance notice generation.
          </p>
        </div>

        <AnimatedStepper
          initialStep={1}
          onFinalStepCompleted={() => router.push("/trace/new")}
          backButtonText="← Previous Stage"
          nextButtonText="Next Stage →"
        >
          {/* Step 1: Intake & NLP Entity Parsing */}
          <Step
            title="Stage 1: Complaint Intake & Entity Extraction"
            subtitle="STRUCTURED EXTRACTION OF REPORTED CRYPTO TRANSACTIONS"
          >
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                Incident reports often arrive as unstructured text. The extraction pipeline parses the narrative to identify suspect addresses, transaction hashes, destination blockchains, and reported loss amounts.
              </p>

              {/* Simulated Raw Incident Dossier Card */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-neutral-300 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-2 border-b border-white/5">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    INGESTED COMPLAINT NARRATIVE
                  </span>
                  <span className="text-emerald-400 font-semibold">NLP PARSER</span>
                </div>
                <p className="text-neutral-400 italic font-sans text-xs leading-relaxed">
                  &quot;Transferred 15,000 USDT on TRON network to wallet
                  TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9 promising 25% returns in an investment pool.&quot;
                </p>

                {/* Extracted Entity Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/30">
                    <div className="text-[10px] text-cyan-400 font-mono">TARGET WALLET</div>
                    <div className="text-[11px] text-white truncate font-mono">TN3W4H6rK...oxb3m9</div>
                  </div>
                  <div className="p-2 rounded-lg bg-violet-950/30 border border-violet-800/30">
                    <div className="text-[10px] text-violet-400 font-mono">CHAIN DETECTED</div>
                    <div className="text-[11px] text-white font-mono">TRON (TRC-20)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                    <div className="text-[10px] text-emerald-400 font-mono">REPORTED LOSS</div>
                    <div className="text-[11px] text-white font-mono">15,000 USDT</div>
                  </div>
                </div>
              </div>
            </div>
          </Step>

          {/* Step 2: Multi-Hop Graph Traversal */}
          <Step
            title="Stage 2: Multi-Hop Graph Traversal"
            subtitle="BREADTH-FIRST SEARCH LEDGER WALKING & PATTERN DETECTION"
          >
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                The engine runs breadth-first search (BFS) across blockchain explorer APIs, filtering sub-threshold dust transactions and classifying peeling chains and funding hubs.
              </p>

              {/* Hop Breakdown Table */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-2 border-b border-white/5">
                  <span>DISCOVERED GRAPH HOPS (5 HOPS)</span>
                  <span className="text-violet-400 font-semibold">RISK SCORE: 39/100</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                        0
                      </span>
                      <span className="text-neutral-300">Root Suspect Wallet</span>
                    </div>
                    <span className="text-neutral-400 font-mono">163,549.38 USDT Balance</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span className="text-neutral-300">Peeling Chain Transfer (90% Forward)</span>
                    </div>
                    <span className="text-violet-300 font-mono">FLAG: peeling_chain</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span className="text-neutral-300">Gas Funder Address</span>
                    </div>
                    <span className="text-emerald-400 font-mono">Linked Wallets: 12</span>
                  </div>
                </div>
              </div>
            </div>
          </Step>

          {/* Step 3: VASP Attribution & KYC Step-Back */}
          <Step
            title="Stage 3: Exchange Deposit Attribution"
            subtitle="IDENTIFYING USER DEPOSIT ADDRESSES FROM EXCHANGE SWEEPS"
          >
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                Centralized exchanges pool user deposits into consolidated hot wallets. The step-back algorithm identifies the transaction immediately prior to the sweep, isolating the specific user-assigned deposit address.
              </p>

              {/* Step-Back Comparison Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-950/20">
                  <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Exchange Hot Wallet</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mb-2 truncate">
                    TCOINDCXHOTSWEEP000000000000
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                    Shared liquidity pool address holding commingled exchange funds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Actionable Deposit Address</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-200 mb-2 truncate">
                    TCOINDCXDEPOSIT998877665544
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                    Specific KYC deposit address linked to the recipient at CoinDCX.
                  </p>
                </div>
              </div>
            </div>
          </Step>

          {/* Step 4: Asset Freeze Notices */}
          <Step
            title="Stage 4: Compliance Notice Generation"
            subtitle="AUTOMATED FREEZE NOTICES WITH CANONICAL EVIDENCE CHECKSUMS"
          >
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                Generates formal asset freeze requests directed to exchange compliance departments, accompanied by a SHA-256 evidence certificate verifying graph state.
              </p>

              {/* Statutory Certificate Box */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    DIGITAL EVIDENCE SEAL
                  </span>
                  <span className="text-emerald-400 font-semibold">VERIFIED</span>
                </div>

                <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[10px] text-neutral-500">SHA-256 EVIDENCE HASH</div>
                  <div className="text-[11px] text-cyan-300 font-mono break-all">
                    c188301585fe33cb1c07621bac19a36ba0fde01d7a057e0bf0e7e6c9bf036c87
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-neutral-400">
                    Compliance Contact: <strong className="text-white">compliance@coindcx.com</strong>
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Step>
        </AnimatedStepper>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. FEATURE GRID (3-Column Interactive Cards)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-24 sm:py-32 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight">
            Core Forensic Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Hop Traversal */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-6 synapse-icon">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                Multi-Hop Graph Traversal
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Breadth-first search (BFS) traversal across TRON, Base, Ethereum, Solana, and Bitcoin.
                Filters sub-threshold dust transactions and traces peeling chains to map transaction paths.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>THRESHOLD FILTER</span>
              <span className="text-cyan-400 font-semibold">2.0% TRANSFER CUTOFF</span>
            </div>
          </div>

          {/* Card 2: Gas Funder Identification */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-6 synapse-icon">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                Gas Funder Identification
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Traces initial gas funding transactions for unseeded wallets to identify parent sponsor
                accounts and establish links between related suspect addresses across investigations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>PARENT SPONSOR</span>
              <span className="text-violet-400 font-semibold">FIRST-FUNDER TRACING</span>
            </div>
          </div>

          {/* Card 3: VASP Deposit Attribution */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-6 synapse-icon">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                VASP Deposit Attribution
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Detects exchange hot-wallet sweeps and steps back 1 hop to isolate the user-specific
                deposit account, separating individual accounts from pooled exchange liquidity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>TARGET RESOLUTION</span>
              <span className="text-emerald-400 font-semibold">SPECIFIC DEPOSIT ID</span>
            </div>
          </div>

          {/* Card 4: ML Risk Scoring */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-6 synapse-icon">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                ML-Based Risk Scoring
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Evaluates network topology, velocity patterns, and transaction structures using GraphSAGE
                GNN and anomaly detection models to calculate a standardized 0–100 risk score.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>SCORING MODEL</span>
              <span className="text-violet-400 font-semibold">GNN + TYPOLOGY CLASSIFIERS</span>
            </div>
          </div>

          {/* Card 5: Complaint Parsing */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-6 synapse-icon">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                Complaint Text Parsing
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Parses unstructured complaint narratives and incident reports to extract suspect
                wallet addresses, blockchain networks, and reported loss amounts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>PARSER ENGINE</span>
              <span className="text-cyan-400 font-semibold">NLP ENTITY EXTRACTION</span>
            </div>
          </div>

          {/* Card 6: Asset Freeze Notices */}
          <div className="synapse-card rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-6 synapse-icon">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl font-medium text-white mb-3">
                Asset Freeze Notices
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Generates formal compliance notices formatted for exchange legal desks, with SHA-256
                checksums to verify evidence integrity and trace history.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>VERIFICATION</span>
              <span className="text-emerald-400 font-semibold">SHA-256 CHECKSUM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. ABOUT SECTION (Project Vision & Core Team)
      ───────────────────────────────────────────────────────────────────────────── */}
      <section id="about" className="relative z-10 max-w-5xl mx-auto px-4 py-24 sm:py-32 scroll-mt-24">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight mb-4">
            About ChainSleuth
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed">
            ChainSleuth is a multi-chain cryptocurrency forensics platform built for investigating
            financial fraud. The system traces multi-hop transaction graphs across major blockchains,
            identifies exchange deposit accounts, and generates verified compliance documentation.
          </p>
        </div>

        {/* 2 Developers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Developer 1: Amit Dey */}
          <div className="rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all" />

            <div>
              <div className="mb-6">
                <h3 className="font-instrument text-3xl sm:text-4xl font-normal text-white">
                  Amit Dey
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-violet-400 mt-1.5 font-semibold">
                  Backend & Machine Learning
                </p>

                {/* Social & Contact Actions */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <a
                    href="https://www.linkedin.com/in/amit-dey-261927328/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-violet-950/70 hover:bg-violet-900 border border-violet-700/60 text-violet-300 hover:text-white text-[11px] font-mono transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href="mailto:deyamit0044l@gmail.com"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-[11px] font-mono transition-colors"
                  >
                    deyamit0044l@gmail.com
                  </a>
                </div>
              </div>

              <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                Engineered the core high-throughput forensic backend and intelligence architecture:
              </p>

              <ul className="space-y-2.5 text-xs text-neutral-300 font-light mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span><strong>Ledger Traversal Engine:</strong> Built asynchronous multi-hop BFS graph walking across TRON, EVM, Solana, and Bitcoin nodes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span><strong>AI & Machine Learning:</strong> Integrated GraphSAGE GNN ONNX models and unsupervised Isolation Forest anomaly detection for calibrated node risk scoring.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span><strong>Graph Infrastructure:</strong> Designed Neo4j Aura schema, high-efficiency Cypher relationship querying, and FastAPI service endpoints.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                FastAPI / Python
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                Neo4j & Cypher
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                GraphSAGE GNN
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                EVM & TronGrid RPC
              </span>
            </div>
          </div>

          {/* Developer 2: Abhigyan Paswan */}
          <div className="rounded-3xl p-8 sm:p-10 border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all" />

            <div>
              <div className="mb-6">
                <h3 className="font-instrument text-3xl sm:text-4xl font-normal text-white">
                  Abhigyan Paswan
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 mt-1.5 font-semibold">
                  Frontend & Research
                </p>

                {/* Social & Contact Actions */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <a
                    href="https://www.linkedin.com/in/abhigyan-paswan-8595663bb/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-[11px] font-mono transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href="mailto:universalabhigyan7@gmail.com"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-[11px] font-mono transition-colors"
                  >
                    universalabhigyan7@gmail.com
                  </a>
                </div>
              </div>

              <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                Architected the interactive forensic user experience and led domain research:
              </p>

              <ul className="space-y-2.5 text-xs text-neutral-300 font-light mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Graph Workbench:</strong> Built the 2D Cytoscape.js & Three.js 3D interactive topological graph canvases with dynamic node inspection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Typology Research:</strong> Researched and operationalized on-chain laundering heuristics (peeling chains, zero-gas burners, fan-out smurfing).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong>Evidence & Legal Workflow:</strong> Created the automated asset freeze directive system and cryptographic SHA-256 evidence certificate stamping.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                Next.js / React
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                Cytoscape.js
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                Forensic UX Design
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300">
                Laundering Research
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. FOOTER (Simple & Minimal)
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-[#050505] border-t border-white/5 py-10 px-4 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <span className="text-neutral-400 font-sans text-xs">
              Developed by Amit Dey & Abhigyan Paswan
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wider">
                All Systems Operational
              </span>
            </div>
            <span className="text-neutral-500 text-[11px]">
              © 2026 ChainSleuth. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
