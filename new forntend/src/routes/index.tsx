import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  Database,
  FileText,
  FolderSearch,
  Info,
  LayoutDashboard,
  Menu,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  UserRoundCog,
  X,
  Building2,
  Lock,
} from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { NewInvestigationSection } from "@/components/investigation/NewInvestigationSection";
import { CaseWorkbenchSection } from "@/components/investigation/CaseWorkbenchSection";
import { LegalNoticesSection } from "@/components/legal/LegalNoticesSection";
import { NcrpIngestionSection } from "@/components/ncrp/NcrpIngestionSection";
import { VaspDirectorySection } from "@/components/vasp/VaspDirectorySection";
import { AuditLogSection } from "@/components/audit/AuditLogSection";
import { AuthSection } from "@/components/auth/AuthSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chainsleuth — Cybercrime Asset Investigation Workspace" },
      {
        name: "description",
        content:
          "Multi-hop blockchain asset traversal, Section 94 BNSS legal freeze directives, and NCRP intelligence correlation platform.",
      },
      { property: "og:title", content: "Chainsleuth — Investigation Workspace" },
      {
        property: "og:description",
        content: "Multi-hop blockchain asset traversal and legal freeze directives.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type SectionId =
  | "dashboard"
  | "new-investigation"
  | "investigations"
  | "legal-notices"
  | "ncrp"
  | "vasp"
  | "audit"
  | "auth";

const navItems: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "new-investigation", label: "New Investigation", icon: Plus },
  { id: "investigations", label: "Investigations", icon: FolderSearch },
  { id: "legal-notices", label: "Legal Notices", icon: FileText },
  { id: "ncrp", label: "NCRP Ingestion", icon: Database },
  { id: "vasp", label: "VASP Directory", icon: Building2 },
  { id: "audit", label: "Supervisory Audit", icon: Lock },
];

const roles = ["Investigating Officer", "Supervisor", "VASP Nodal"];

const waveLayers = [
  { y: 30, amp: 48, phase: 0.0 },
  { y: 100, amp: 60, phase: 1.1 },
  { y: 180, amp: 44, phase: 2.2 },
  { y: 260, amp: 66, phase: 0.7 },
  { y: 340, amp: 50, phase: 1.9 },
  { y: 420, amp: 62, phase: 2.8 },
  { y: 500, amp: 46, phase: 1.4 },
  { y: 580, amp: 58, phase: 3.1 },
  { y: 660, amp: 48, phase: 0.9 },
  { y: 740, amp: 60, phase: 2.5 },
  { y: 820, amp: 44, phase: 1.6 },
];

function ridgePath(y: number, amp: number, phase: number): string {
  const width = 1440;
  const segments = 8;
  let d = "";
  let px = 0;
  let py = 0;
  let lx = 0;
  for (let i = 0; i <= segments; i++) {
    const x = Math.round((width / segments) * i);
    const yy = Math.round((y + Math.sin((i / segments) * Math.PI * 2 + phase) * amp) * 10) / 10;
    if (i === 0) {
      d = `M ${x} ${yy}`;
    } else {
      d += ` Q ${px} ${py} ${(px + x) / 2} ${(py + yy) / 2}`;
    }
    px = x;
    py = yy;
    lx = x;
  }
  d += ` L ${lx} ${py} L ${lx + 60} 960 L -60 960 Z`;
  return d;
}

type Opacity = {
  panel: number;
  field: number;
  tabs: number;
  sidebar: number;
  waves: number;
  blur: number;
};

const defaultOpacity: Opacity = {
  panel: 23,
  field: 12,
  tabs: 10,
  sidebar: 100,
  waves: 100,
  blur: 8,
};

const opacityControls: { key: keyof Opacity; label: string; max: number; unit: string }[] = [
  { key: "panel", label: "Form panel", max: 100, unit: "%" },
  { key: "field", label: "Input fields", max: 100, unit: "%" },
  { key: "tabs", label: "Tab strip", max: 100, unit: "%" },
  { key: "sidebar", label: "Sidebar", max: 100, unit: "%" },
  { key: "waves", label: "Background waves", max: 100, unit: "%" },
  { key: "blur", label: "Glass blur", max: 40, unit: "px" },
];

function Index() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("CASE-2026-TRON-8891");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState(roles[0]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [opacity, setOpacity] = useState<Opacity>(defaultOpacity);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cs-opacity");
      if (saved) setOpacity({ ...defaultOpacity, ...JSON.parse(saved) });
    } catch {}

    // Check hash on load
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (
        [
          "dashboard",
          "new-investigation",
          "investigations",
          "legal-notices",
          "ncrp",
          "vasp",
          "audit",
          "auth",
        ].includes(hash)
      ) {
        setActiveSection(hash);
      }
    }
  }, []);

  function updateOpacity(next: Opacity) {
    setOpacity(next);
    try {
      localStorage.setItem("cs-opacity", JSON.stringify(next));
    } catch {}
  }

  function handleNavigate(section: string, caseId?: string) {
    if (caseId) {
      setSelectedCaseId(caseId);
    }
    setActiveSection(section as SectionId);
    if (typeof window !== "undefined") {
      window.location.hash = section;
    }
    setMobileOpen(false);
  }

  const vars = {
    "--panel-alpha": `${opacity.panel / 100}`,
    "--field-alpha": `${opacity.field}%`,
    "--panel-blur": `${opacity.blur}px`,
  } as CSSProperties;

  return (
    <div style={vars} className="flex min-h-screen bg-background text-foreground">
      {/* Floating Settings Button */}
      <div className="fixed right-4 top-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="glass-panel cursor-pointer"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label="Settings"
          aria-expanded={settingsOpen}
        >
          <Settings
            className={cn("size-4 transition-transform duration-300", settingsOpen && "rotate-90")}
          />
        </Button>
        {settingsOpen && (
          <div className="glass-panel workspace-in absolute right-0 mt-2 w-72 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-sm font-bold">Transparency & Blur</p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold text-primary cursor-pointer"
                onClick={() => updateOpacity(defaultOpacity)}
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>
            <div className="space-y-4">
              {opacityControls.map(({ key, label, max, unit }) => (
                <label key={key} className="block space-y-1.5">
                  <span className="flex justify-between text-xs font-semibold text-muted-foreground">
                    {label}
                    <span className="font-mono text-foreground">
                      {opacity[key]}
                      {unit}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={max}
                    value={opacity[key]}
                    onChange={(e) => updateOpacity({ ...opacity, [key]: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </label>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Adjust frosted glass visibility and depth.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <aside
        style={{
          backgroundColor: `color-mix(in oklab, var(--surface) ${opacity.sidebar}%, transparent)`,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border backdrop-blur-md transition-[transform,width] duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          !sidebarOpen && "md:w-16"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div
            onClick={() => handleNavigate("dashboard")}
            className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground cursor-pointer"
          >
            <ShieldCheck className="size-5" />
          </div>
          {sidebarOpen && (
            <div
              onClick={() => handleNavigate("dashboard")}
              className="min-w-0 cursor-pointer"
            >
              <p className="truncate font-display text-base font-bold uppercase tracking-tight">
                Chainsleuth
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">Fraud Ops Platform</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden size-8 md:inline-flex cursor-pointer"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
          >
            <ChevronLeft className={cn("size-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {sidebarOpen && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Forensic Command
            </p>
          )}
          <div className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNavigate(id)}
                  title={!sidebarOpen ? label : undefined}
                  className={cn(
                    "nav-fill group relative flex w-full h-10 items-center gap-3 overflow-hidden rounded-md px-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer",
                    active && "border-l-2 border-primary bg-primary/5 font-semibold text-primary",
                    !sidebarOpen && "justify-center px-0"
                  )}
                >
                  <Icon className="nav-reveal-icon size-4 shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Operational Role Switcher in Sidebar Footer */}
        <div className="relative border-t border-border bg-background/50 p-3">
          {roleMenuOpen && (
            <button
              aria-label="Close role menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setRoleMenuOpen(false)}
            />
          )}
          <div className="flex items-center gap-2">
            <Button
              variant={roleMenuOpen ? "outline" : "ghost"}
              size="icon"
              className="size-8 shrink-0 cursor-pointer"
              onClick={() => setRoleMenuOpen((value) => !value)}
              aria-label="Switch operational role"
              aria-expanded={roleMenuOpen}
              title="Operational role"
            >
              <Info className={cn("size-4 transition-colors", roleMenuOpen && "text-primary")} />
            </Button>
            {sidebarOpen && (
              <div
                onClick={() => handleNavigate("auth")}
                className="min-w-0 flex-1 cursor-pointer"
              >
                <p className="truncate text-xs font-semibold text-foreground">{role}</p>
                <p className="truncate text-[10px] text-muted-foreground">Click to manage profile</p>
              </div>
            )}
          </div>

          {roleMenuOpen && (
            <div
              className="glass-panel absolute bottom-full left-3 z-50 mb-2 w-56 animate-select-pop rounded-2xl p-1.5"
              style={{
                backgroundColor: "color-mix(in oklab, white 95%, transparent)",
                boxShadow: "0 12px 32px color-mix(in oklab, var(--primary) 18%, transparent)",
              }}
            >
              <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase text-muted-foreground">
                Operational role
              </p>
              <div className="space-y-0.5">
                {roles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRole(item);
                      setRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground cursor-pointer"
                  >
                    <UserRoundCog className="size-4 shrink-0" />
                    <span className={cn("truncate", role === item && "font-semibold text-primary")}>
                      {item}
                    </span>
                    {role === item && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main App Content View */}
      <main
        className={cn(
          "min-w-0 flex-1 transition-[margin] duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <section className="relative min-h-screen overflow-hidden p-5 sm:p-8 lg:p-10">
          {/* Animated Background Wave Canvas */}
          <div
            aria-hidden
            style={{ opacity: opacity.waves / 100 }}
            className="absolute -inset-[10%] motion-safe:animate-bg-drift pointer-events-none"
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              role="presentation"
            >
              <defs>
                <linearGradient id="wave-a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2EBDD" />
                </linearGradient>
                <linearGradient id="wave-b" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F8F3" />
                  <stop offset="100%" stopColor="#D9E5D0" />
                </linearGradient>
              </defs>
              {waveLayers.map((layer, index) => (
                <path
                  key={index}
                  d={ridgePath(layer.y, layer.amp, layer.phase)}
                  fill={index % 2 ? "url(#wave-a)" : "url(#wave-b)"}
                  stroke="#FFFFFF"
                  strokeOpacity={0.85}
                  strokeWidth={2}
                />
              ))}
            </svg>
          </div>

          {/* Top Mobile Menu Toggle */}
          <div className="relative z-10 mb-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
          </div>

          {/* Section Dynamic View Container */}
          <div className="relative z-10">
            {activeSection === "dashboard" && (
              <DashboardSection onNavigate={handleNavigate} userRole={role} />
            )}

            {activeSection === "new-investigation" && (
              <NewInvestigationSection
                tabsOpacity={opacity.tabs}
                onInvestigationCreated={(newCaseId) => handleNavigate("investigations", newCaseId)}
              />
            )}

            {activeSection === "investigations" && (
              <CaseWorkbenchSection
                initialCaseId={selectedCaseId}
                onNavigateNotice={(cid) => handleNavigate("legal-notices", cid)}
              />
            )}

            {activeSection === "legal-notices" && (
              <LegalNoticesSection initialCaseId={selectedCaseId} />
            )}

            {activeSection === "ncrp" && <NcrpIngestionSection />}

            {activeSection === "vasp" && <VaspDirectorySection />}

            {activeSection === "audit" && <AuditLogSection />}

            {activeSection === "auth" && (
              <AuthSection
                currentRole={role}
                onSelectRole={(r) => setRole(r)}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}