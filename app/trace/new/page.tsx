"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TraceForm } from "@/components/intake/TraceForm";

export default function NewTracePage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="pb-3 border-b border-white/5">
          <h1 className="font-instrument text-3xl sm:text-4xl font-normal text-white tracking-tight">
            New Investigation Intake
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Initiate multi-hop asset tracing via direct wallet address or unstructured incident narrative extraction.
          </p>
        </div>

        {/* Centered Form */}
        <div className="flex justify-center pt-2">
          <TraceForm />
        </div>
      </div>
    </AppShell>
  );
}
