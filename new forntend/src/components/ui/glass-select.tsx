import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassSelectProps {
  options: string[];
  defaultValue?: string;
  ariaLabel?: string;
}

export function GlassSelect({ options, defaultValue, ariaLabel }: GlassSelectProps) {
  const [value, setValue] = useState(defaultValue ?? options[0] ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openMenu = () => {
    setOpen(true);
    setActive(options.indexOf(value));
  };

  const commit = (index: number) => {
    setValue(options[index] ?? value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (open) {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min((i + 1) % options.length, options.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i <= 0 ? options.length - 1 : i - 1)); return; }
      if (e.key === "Enter" && active >= 0) { e.preventDefault(); commit(active); return; }
      if (e.key === "Tab") setOpen(false);
      return;
    }
    if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  };

  return (
    <div ref={rootRef} className="group relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cn(
          "field cursor-pointer appearance-none pr-12 text-left font-medium hover:border-primary/30",
          open && "border-primary [box-shadow:0_0_0_3px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
        )}
      >
        <span className="block truncate">{value}</span>
      </button>
      <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center transition-transform duration-300 group-hover:translate-y-0.5">
        <ChevronDown className={cn("size-4 text-primary transition-transform duration-200", open && "-rotate-180")} strokeWidth={2.5} />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40" />

      {open && (
        <ul
          role="listbox"
          className="glass-panel animate-select-pop absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl p-1.5"
          style={{ backgroundColor: "color-mix(in oklab, white 96%, transparent)", boxShadow: "0 12px 32px -12px color-mix(in oklab, var(--primary) 28%, transparent)" }}
        >
          {options.map((option, i) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                  option === value ? "text-primary" : "text-foreground",
                  active === i && "bg-primary/10"
                )}
              >
                <span className="truncate">{option}</span>
                {option === value && <Check className="size-4 shrink-0" strokeWidth={2.5} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
