"use client";

import React, { use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NoticePreview } from "@/components/legal/NoticePreview";
import { NoticeGeneratorButton } from "@/components/legal/NoticeGeneratorButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NoticeGeneratorPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/case/${caseId}`}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Back to Graph Workbench"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-sans text-slate-100 uppercase tracking-wider">
                Section 94 BNSS Legal Freeze Notice Generator
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Target VASP Notice & Section 63 BSA Digital Evidence Certificate
              </p>
            </div>
          </div>
          <NoticeGeneratorButton />
        </div>

        <div className="flex justify-center">
          <NoticePreview caseId={caseId} />
        </div>
      </div>
    </AppShell>
  );
}
