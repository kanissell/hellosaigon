"use client";

import { useState } from "react";
import type { LearnedTrait, UserProfile } from "@/lib/types/userProfile";
import { LS_PROFILE_KEY } from "@/lib/types/userProfile";

type Props = {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  dietary: "Food & Diet",
  location: "Location",
  lifestyle: "Lifestyle",
  preferences: "Preferences",
  schedule: "Schedule",
};

const CATEGORY_ICONS: Record<string, string> = {
  dietary: "🍜",
  location: "📍",
  lifestyle: "🏃",
  preferences: "⭐",
  schedule: "🕐",
};

export default function LearnedTraitsPanel({ profile, onUpdate, onClose }: Props) {
  const traits = profile.learnedTraits || [];
  const [removing, setRemoving] = useState<string | null>(null);

  const grouped = new Map<string, LearnedTrait[]>();
  for (const t of traits) {
    const list = grouped.get(t.category) || [];
    list.push(t);
    grouped.set(t.category, list);
  }

  function removeTrait(key: string) {
    setRemoving(key);
    setTimeout(() => {
      const updated = traits.filter((t) => t.key !== key);
      const newProfile = { ...profile, learnedTraits: updated };
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(newProfile));
      onUpdate(newProfile);
      setRemoving(null);
    }, 300);
  }

  function clearAll() {
    const newProfile = { ...profile, learnedTraits: [] };
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(newProfile));
    onUpdate(newProfile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="card-reveal glass-card relative z-10 mx-4 mb-4 max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl sm:mb-0">
        {/* Header */}
        <div className="hud-border-bottom flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              What I&apos;ve Learned
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
              Memory Bank
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Traits list */}
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "60vh" }}>
          {traits.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-foreground/40">
                I haven&apos;t learned anything about you yet.
              </p>
              <p className="mt-1 font-mono text-[10px] text-cyan-500/30">
                Chat with me and I&apos;ll remember your preferences.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([cat, catTraits]) => (
                <div key={cat}>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-500/40">
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat] || cat}
                  </p>
                  <div className="space-y-1.5">
                    {catTraits.map((t) => (
                      <div
                        key={t.key}
                        className={`flex items-center justify-between rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-3 py-2 transition-all ${
                          removing === t.key ? "scale-95 opacity-0" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-foreground/80">
                            {t.value}
                          </span>
                          <span className="ml-2 text-[10px] text-foreground/30">
                            {new Date(t.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTrait(t.key)}
                          className="ml-2 shrink-0 rounded p-1 text-foreground/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remove: ${t.value}`}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {traits.length > 0 && (
          <div className="hud-border-top flex justify-end px-5 py-3">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              Clear all memories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
