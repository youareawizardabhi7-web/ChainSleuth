"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/lib/store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAppStore();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/trace")) return "New Trace";
    if (path.startsWith("/ncrp")) return "Incident Intelligence";
    if (path.startsWith("/case")) return "Forensic Dossier";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen w-screen bg-[#040404] text-neutral-100 overflow-hidden font-inter selection:bg-violet-900/40 selection:text-violet-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar - Minimal & Clean */}
        <header className="h-12 px-6 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Console</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-200 font-medium">{getPageTitle(pathname)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <span className="text-neutral-300 font-medium hidden sm:inline text-xs">
                {user?.name || "Amit Dey"}
              </span>
            </div>
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
