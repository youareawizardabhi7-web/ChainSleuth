import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, Flame } from "lucide-react";

interface RiskBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function RiskBadge({ score, size = "md", className, showIcon = true }: RiskBadgeProps) {
  let colorStyle = "";
  let label = "Low Risk";
  let Icon = ShieldCheck;

  if (score >= 75) {
    colorStyle = "bg-rose-500/10 text-rose-700 border-rose-300/60";
    label = "Critical";
    Icon = Flame;
  } else if (score >= 40) {
    colorStyle = "bg-amber-500/10 text-amber-700 border-amber-300/60";
    label = "Medium";
    Icon = AlertTriangle;
  } else {
    colorStyle = "bg-primary/10 text-primary border-primary/25";
    label = "Low";
    Icon = ShieldCheck;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-bold tracking-tight shadow-2xs backdrop-blur-xs transition-transform",
        colorStyle,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="size-3 shrink-0" />}
      <span>{score}/100</span>
      <span className="opacity-75 font-sans font-semibold text-[10px] uppercase">({label})</span>
    </span>
  );
}
