"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { Shield, UserCheck, Building2, Terminal, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { currentRole, setCurrentRole } = useAppStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chainsleuth_role") as UserRole | null;
      if (saved) {
        setCurrentRole(saved);
      }
    }
  }, [setCurrentRole]);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    router.push("/dashboard");
  };

  const rolesConfig: {
    id: UserRole;
    title: string;
    code: string;
    description: string;
    icon: React.ElementType;
    badgeColor: string;
    borderColor: string;
  }[] = [
    {
      id: "investigating_officer",
      title: "Investigating Officer",
      code: "ROLE_IO_LEO",
      description:
        "Execute automated TRON / EVM money-flow traces, inspect transaction graph nodes, flag suspect burner addresses.",
      icon: UserCheck,
      badgeColor: "bg-teal-950/80 text-teal-400 border-teal-800",
      borderColor: "hover:border-teal-500/80",
    },
    {
      id: "supervisory_officer",
      title: "Supervisory Officer",
      code: "ROLE_SUPERVISOR",
      description:
        "Review investigation case files, approve & sign Section 94 BNSS legal freeze notices, inspect system audit logs.",
      icon: Shield,
      badgeColor: "bg-amber-950/80 text-amber-400 border-amber-800",
      borderColor: "hover:border-amber-500/80",
    },
    {
      id: "vasp_nodal_officer",
      title: "VASP Nodal Compliance Officer",
      code: "ROLE_VASP_NODAL",
      description:
        "Exchange compliance interface for receiving court-ordered freeze directives & verifying Section 63 BSA evidence certificates.",
      icon: Building2,
      badgeColor: "bg-slate-900 text-slate-300 border-slate-700",
      borderColor: "hover:border-slate-500",
    },
  ];

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-teal-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider uppercase font-sans text-slate-100">
                CHAINSLEUTH // CONSOLE ACCESS
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                Crypto Fraud Investigation System • Law Enforcement Access
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded">
            SECURE ACCESS
          </span>
        </div>

        {/* Console Prompt */}
        <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 p-2.5 rounded font-mono">
          <span className="text-teal-400 font-bold">$</span> SELECT OPERATIONAL ROLE TO INITIALIZE CONSOLE SESSION:
        </div>

        {/* Role Options */}
        <div className="space-y-3 font-sans text-xs">
          {rolesConfig.map((roleItem) => {
            const Icon = roleItem.icon;
            const isSelected = currentRole === roleItem.id;
            return (
              <button
                key={roleItem.id}
                type="button"
                onClick={() => handleRoleSelect(roleItem.id)}
                className={`w-full text-left p-3.5 rounded bg-slate-900/80 border transition-all duration-150 flex items-start justify-between gap-4 group cursor-pointer ${
                  isSelected
                    ? "border-teal-500 ring-1 ring-teal-500/50 bg-slate-900"
                    : `border-slate-800 ${roleItem.borderColor} hover:bg-slate-900`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-slate-300 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs">
                        {roleItem.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider ${roleItem.badgeColor}`}
                      >
                        {roleItem.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-mono">
                      {roleItem.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-4 font-mono">
          <div>SIH26183 • BNSS §94 & BSA §63 COMPLIANT</div>
          <div>BUILD 2026.09.20</div>
        </div>
      </div>
    </div>
  );
}
