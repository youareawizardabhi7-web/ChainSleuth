"use client";

import React, { useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { Shield, UserCheck, Building2 } from "lucide-react";

const emptySubscribe = () => () => {};

interface RoleSwitcherProps {
  orientation?: "horizontal" | "vertical";
}

export function RoleSwitcher({ orientation = "horizontal" }: RoleSwitcherProps) {
  const { currentRole, setCurrentRole } = useAppStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isVertical = orientation === "vertical";

  if (!isClient) {
    return (
      <div
        className={`${
          isVertical ? "flex flex-col h-24 w-full" : "flex items-center h-8 w-60"
        } gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-full animate-pulse`}
      />
    );
  }

  const rolesConfig: {
    id: UserRole;
    label: string;
    fullLabel: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "investigating_officer",
      label: "Investigator",
      fullLabel: "Forensic Investigator",
      icon: UserCheck,
    },
    {
      id: "supervisory_officer",
      label: "Lead",
      fullLabel: "Supervisory Lead",
      icon: Shield,
    },
    {
      id: "vasp_nodal_officer",
      label: "Compliance",
      fullLabel: "VASP Compliance",
      icon: Building2,
    },
  ];

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col w-full gap-1 p-1 rounded-2xl" : "flex-row items-center gap-1 p-1 rounded-full"
      } bg-white/[0.04] border border-white/10 text-xs select-none`}
    >
      {rolesConfig.map((r) => {
        const Icon = r.icon;
        const isActive = currentRole === r.id;

        return (
          <button
            key={r.id}
            type="button"
            onClick={() => setCurrentRole(r.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer text-xs ${
              isActive
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
            title={r.fullLabel}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
