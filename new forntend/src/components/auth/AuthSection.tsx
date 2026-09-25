import { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthSectionProps {
  currentRole: string;
  onSelectRole: (role: string) => void;
  onNavigate: (section: string) => void;
}

export function AuthSection({ currentRole, onSelectRole, onNavigate }: AuthSectionProps) {
  const [email, setEmail] = useState("rajesh.sharma@cybercrime.gov.in");
  const [badgeNumber, setBadgeNumber] = useState("CYBER-MH-4402");
  const [password, setPassword] = useState("••••••••••••");
  const [signedIn, setSignedIn] = useState(true);

  const roles = [
    {
      name: "Investigating Officer",
      code: "ROLE_IO_LEO",
      desc: "Execute multi-hop traces, inspect transaction graphs, flag suspect burner addresses.",
      icon: UserCheck,
    },
    {
      name: "Supervisor",
      code: "ROLE_SUPERVISOR",
      desc: "Review investigation case files, approve & sign Section 94 BNSS legal freeze notices, inspect system audit logs.",
      icon: ShieldCheck,
    },
    {
      name: "VASP Nodal",
      code: "ROLE_VASP_NODAL",
      desc: "Review incoming Section 94 BNSS legal orders, confirm asset freeze execution, liaison with LEAs.",
      icon: Building2,
    },
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignedIn(true);
    setTimeout(() => {
      onNavigate("dashboard");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="workspace-in text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <ShieldAlert className="size-3.5" />
          <span>Restricted Law Enforcement & Compliance Portal</span>
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
          Officer Authentication & Role Management
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm max-w-xl mx-auto">
          Multi-tiered role-based access control under the Bharatiya Nagarik Suraksha Sanhita (BNSS) & Digital Personal Data Protection Act.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="glass-panel workspace-in p-5 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          Select Operational Authorization Profile
        </span>
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = currentRole === r.name;

            return (
              <button
                key={r.name}
                type="button"
                onClick={() => onSelectRole(r.name)}
                className={cn(
                  "flex flex-col text-left p-4 rounded-2xl border transition-all text-xs space-y-2 group cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-white/50 bg-white/40 hover:bg-white hover:border-primary/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("grid size-8 place-items-center rounded-xl", isSelected ? "bg-primary text-primary-foreground" : "bg-white text-foreground")}>
                    <Icon className="size-4" />
                  </div>
                  {isSelected && (
                    <span className="size-2 rounded-full bg-primary ring-2 ring-primary/30" />
                  )}
                </div>
                <div>
                  <div className={cn("font-display font-bold text-xs", isSelected ? "text-primary" : "text-foreground")}>
                    {r.name}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">{r.code}</div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {r.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Officer Credentials Form */}
      <form onSubmit={handleSignIn} className="glass-panel workspace-in p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <span className="font-display font-bold text-sm text-foreground">
            Current Session Credentials ({currentRole})
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 font-bold text-[10px]">
            <CheckCircle2 className="size-3" />
            Active Session
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-xs">
            <span className="font-bold uppercase text-[10px] text-muted-foreground">Officer Email *</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field font-mono"
            />
          </label>

          <label className="block space-y-1.5 text-xs">
            <span className="font-bold uppercase text-[10px] text-muted-foreground">Service Badge Number *</span>
            <input
              required
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="field font-mono"
            />
          </label>
        </div>

        <label className="block space-y-1.5 text-xs">
          <span className="font-bold uppercase text-[10px] text-muted-foreground">Security PIN / Digital Token *</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field font-mono"
          />
        </label>

        <div className="pt-2">
          <Button type="submit" size="wide">
            <ShieldCheck className="size-4" />
            <span>Confirm Profile Authorization & Enter Command Center</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
