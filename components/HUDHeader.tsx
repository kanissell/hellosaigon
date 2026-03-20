"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
  onSettingsClick?: () => void;
};

export default function HUDHeader({ onSettingsClick }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hud-border-bottom px-4 py-3" style={{ zIndex: 10 }}>
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {/* Left: branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Rotating arc behind logo */}
            <svg
              className="hud-arc absolute -inset-1.5 h-10 w-10"
              viewBox="0 0 40 40"
              fill="none"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="rgba(6,182,212,0.15)"
                strokeWidth="1"
                strokeDasharray="8 12"
              />
            </svg>
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
              <span className="text-xs font-bold text-cyan-400">HS</span>
            </div>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              HelloSaigon
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
              Local Concierge
            </p>
          </div>
        </div>

        {/* Right: HUD readouts */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs tabular-nums text-cyan-500/50">
            {time}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="status-ring h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/70">
              Online
            </span>
          </div>

          <Link
            href="/how-it-works"
            aria-label="How it works"
            className="rounded-lg p-1.5 text-cyan-500/40 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </Link>

          {onSettingsClick && (
            <button
              type="button"
              onClick={onSettingsClick}
              aria-label="Settings"
              className="rounded-lg p-1.5 text-cyan-500/40 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
