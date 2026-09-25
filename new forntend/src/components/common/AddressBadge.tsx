import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressBadgeProps {
  address: string;
  truncateLength?: number;
  className?: string;
  showCopy?: boolean;
}

export function AddressBadge({
  address,
  truncateLength = 6,
  className,
  showCopy = true,
}: AddressBadgeProps) {
  const [copied, setCopied] = useState(false);

  const truncated =
    address.length > truncateLength * 2 + 3
      ? `${address.slice(0, truncateLength)}…${address.slice(-truncateLength)}`
      : address;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/40 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-white/60",
        className
      )}
      title={address}
    >
      <span className="select-all">{truncated}</span>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy full address"}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          {copied ? (
            <Check className="size-3 text-primary animate-in zoom-in-50" strokeWidth={2.5} />
          ) : (
            <Copy className="size-3" />
          )}
        </button>
      )}
    </span>
  );
}
