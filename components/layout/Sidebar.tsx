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
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

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

  return (
    <aside className="w-56 shrink-0 bg-[#080808] border-r border-white/5 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-12 px-5 border-b border-white/5 flex items-center">
          <Link href="/dashboard" className="group">
            <BrandLogo size="md" />
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
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
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-xs">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-mono text-xs font-semibold shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-white truncate">
              {user?.name || "Amit Dey"}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 truncate">
              {user?.email || "deyamit0044l@gmail.com"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
