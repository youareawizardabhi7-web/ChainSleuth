"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { Send, CheckCircle2 } from "lucide-react";

interface NoticeGeneratorButtonProps {
  onGenerate?: () => void;
}

export function NoticeGeneratorButton({ onGenerate }: NoticeGeneratorButtonProps) {
  const { role } = useAppStore();

  if (role === "supervisory_officer") {
    return (
      <button
        type="button"
        onClick={onGenerate}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-sans font-bold text-xs rounded transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Approve & Sign Section 94 BNSS Notice
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onGenerate}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-semibold text-xs rounded transition-colors"
    >
      <Send className="w-4 h-4 text-teal-400" />
      Send for Supervisory Approval
    </button>
  );
}
