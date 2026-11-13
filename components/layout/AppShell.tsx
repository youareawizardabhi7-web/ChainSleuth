"use client";

import React from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAppStore } from "@/lib/store";
import { Home } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAppStore();

  return (
    <div className="flex h-screen w-screen bg-[#040404] text-neutral-100 overflow-hidden font-inter selection:bg-violet-900/40 selection:text-violet-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 px-6 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Live Ledger Engine Active
            </span>
            <span className="text-neutral-700 hidden sm:inline">•</span>
            <span className="text-xs text-neutral-500 hidden sm:inline font-mono">
              TRON • ETH • SOL • BTC
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Single Role Context Switcher */}
            <RoleSwitcher orientation="horizontal" />

            {/* Quick Link to Landing Page */}
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Return to Landing Page"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Main Operational View */}
        <main className="flex-1 overflow-y-auto bg-[#040404] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
