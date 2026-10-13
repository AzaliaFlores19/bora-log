"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { themeOptions } from "@/lib/constants";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Theme</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-surface border border-border shadow-xl animate-scale-in overflow-hidden">
            <div className="px-3 py-2 text-xs font-semibold text-text-subtle uppercase tracking-wide">
              Color Theme
            </div>
            <div className="py-1">
              {themeOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => {
                    setTheme(opt.name);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors ${
                    theme === opt.name ? "bg-surface-hover" : ""
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"
                    style={{ background: opt.swatch }}
                  />
                  <span className="flex-1 text-left text-sm text-text">{opt.label}</span>
                  {theme === opt.name && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
