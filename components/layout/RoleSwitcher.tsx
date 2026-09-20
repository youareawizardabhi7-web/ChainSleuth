"use client";

import React, { useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";
import { Shield, UserCheck, Building2 } from "lucide-react";

const emptySubscribe = () => () => {};

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useAppStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-[11px] h-7 w-44 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-[11px] select-none">
      <button
        type="button"
        onClick={() => setCurrentRole("investigating_officer")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
          currentRole === "investigating_officer"
            ? "bg-slate-800 text-teal-400 font-bold border border-slate-700"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Investigating Officer (IO)"
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>IO</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentRole("supervisory_officer")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
          currentRole === "supervisory_officer"
            ? "bg-slate-800 text-amber-400 font-bold border border-slate-700"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Supervisory Officer"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Supervisor</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentRole("vasp_nodal_officer")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer ${
          currentRole === "vasp_nodal_officer"
            ? "bg-slate-800 text-teal-300 font-bold border border-slate-700"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="VASP Nodal Officer"
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>VASP Nodal</span>
      </button>
    </div>
  );
}
