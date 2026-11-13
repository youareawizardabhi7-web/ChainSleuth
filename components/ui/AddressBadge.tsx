"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface AddressBadgeProps {
  address: string;
  className?: string;
  truncateLength?: number;
}

export function AddressBadge({
  address,
  className = "",
  truncateLength = 4,
}: AddressBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const truncated =
    address.length > truncateLength * 2 + 4
      ? `${address.slice(0, truncateLength)}...${address.slice(-truncateLength)}`
      : address;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300 hover:border-white/20 transition-colors select-none group ${className}`}
      title={address}
    >
      <span className="font-medium text-neutral-200">{truncated}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-neutral-500 hover:text-white transition-colors p-0.5 rounded relative cursor-pointer"
        aria-label="Copy full address"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <Copy className="w-3 h-3 text-neutral-400 group-hover:text-white" />
        )}
        {copied && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neutral-900 border border-white/20 text-emerald-400 font-mono text-[10px] rounded-full whitespace-nowrap shadow-lg">
            Copied!
          </span>
        )}
      </button>
    </span>
  );
}
