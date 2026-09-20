"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { ShieldCheck, Activity } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { setCurrentRole } = useAppStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chainsleuth_role") as UserRole | null;
      if (saved) {
        setCurrentRole(saved);
      }
    }
  }, [setCurrentRole]);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-teal-900 selection:text-teal-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-12 px-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate">
              POLICE CYBER CRIME INVESTIGATION CONSOLE
            </span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="text-slate-500 hidden md:inline truncate">
              BNSS §94 & BSA §63 COMPLIANT
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>TRON RPC: MOCK ENGINE</span>
            </div>
            <RoleSwitcher />
          </div>
        </header>

        {/* Main Operational Window */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
