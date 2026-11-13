"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  PlusCircle,
  Database,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  User,
} from "lucide-react";

const emptySubscribe = () => () => {};

export function Sidebar() {
  const pathname = usePathname();
  const { currentRole, user } = useAppStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isSupervisor = isClient && currentRole === "supervisory_officer";

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "New Trace",
      href: "/trace/new",
      icon: PlusCircle,
    },
    {
      label: "Incident Ingest",
      href: "/ncrp",
      icon: Database,
    },
  ];

  if (isSupervisor) {
    navItems.push({
      label: "Audit Trail",
      href: "/dashboard/audit",
      icon: Activity,
    });
  }

  const roleDisplayMap: Record<string, { label: string; accent: string }> = {
    investigating_officer: { label: "Forensic Investigator", accent: "text-violet-400" },
    supervisory_officer: { label: "Supervisory Lead", accent: "text-amber-400" },
    vasp_nodal_officer: { label: "VASP Compliance", accent: "text-cyan-400" },
  };

  const currentRoleDisplay = roleDisplayMap[currentRole] || roleDisplayMap.investigating_officer;

  return (
    <aside className="w-60 shrink-0 bg-[#080808] border-r border-white/5 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_8px_#8b5cf6]" />
            <span className="font-instrument text-xl font-medium tracking-tight text-white group-hover:text-violet-300 transition-colors">
              ChainSleuth
            </span>
          </Link>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-full bg-white/[0.02]">
            Console
          </span>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white font-semibold shadow-sm border border-white/10"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-neutral-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Portal Switch */}
        <div className="p-3 pt-1">
          <div className="px-3 pt-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            External
          </div>
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <span>Landing Page</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>
        </div>
      </div>

      {/* User Session & Role Profile Footer */}
      <div className="p-3 pb-7 border-t border-white/5 bg-white/[0.01]">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-300 font-mono text-xs font-semibold shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "FI"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {user?.name || "Investigator"}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 truncate">
                {user?.email || "investigator@chainsleuth.io"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
            <span className="text-neutral-500">Active Role</span>
            <span className={`font-medium ${currentRoleDisplay.accent}`}>
              {currentRoleDisplay.label}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
