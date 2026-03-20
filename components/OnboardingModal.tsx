"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types/userProfile";
import { DEFAULT_PROFILE, LS_PROFILE_KEY } from "@/lib/types/userProfile";

type Props = {
  onComplete: (profile: UserProfile) => void;
};

const DISTRICTS = [
  "District 1", "District 3", "District 4", "District 5",
  "District 7", "District 10", "Binh Thanh", "Phu Nhuan",
  "Go Vap", "Tan Binh", "Thu Duc City",
];

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "no-pork", label: "No pork" },
  { value: "no-shellfish", label: "No shellfish" },
  { value: "gluten-free", label: "Gluten-free" },
];

const CUISINE_OPTIONS = [
  "Pho", "Banh mi", "Coffee", "Pizza", "Sushi",
  "Hotpot", "BBQ", "Ramen", "Bun bo", "Dim sum",
];

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE });

  const totalSteps = 6;

  function toggle<K extends keyof UserProfile>(key: K, value: string) {
    setProfile((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: next };
    });
  }

  function next() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
      onComplete(profile);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function skip() {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
    onComplete(profile);
  }

  const chipClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm cursor-pointer transition-all ${
      active
        ? "chip-active"
        : "chip text-foreground/70 hover:text-cyan-400"
    }`;

  const optionClass = (active: boolean) =>
    `rounded-xl p-3 text-left transition-all ${
      active
        ? "glass-card border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.08)]"
        : "glass-card"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.08)]">
        {/* Progress */}
        <div className="mb-6 flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step
                  ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
                  : "bg-foreground/10"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome / Visit Type */}
        {step === 0 && (
          <div>
            <h2 className="mb-1 text-xl font-semibold text-cyan-400">
              Welcome to HelloSaigon
            </h2>
            <p className="mb-5 text-sm text-foreground/50">
              Quick setup so I can give you better recommendations. Takes 30 seconds.
            </p>
            <p className="mb-3 text-sm font-medium text-foreground/70">
              What describes you best?
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setProfile((p) => ({ ...p, visitType: "visitor" }))} className={optionClass(profile.visitType === "visitor")}>
                <span className="text-sm font-medium text-foreground">Visiting Saigon</span>
                <span className="block text-xs text-foreground/40">Here for a trip — show me the highlights</span>
              </button>
              <button type="button" onClick={() => setProfile((p) => ({ ...p, visitType: "resident" }))} className={optionClass(profile.visitType === "resident")}>
                <span className="text-sm font-medium text-foreground">Living here / expat</span>
                <span className="block text-xs text-foreground/40">I need everyday spots and hidden gems</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Budget */}
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">What&apos;s your budget vibe?</h2>
            <p className="mb-4 text-sm text-foreground/50">I&apos;ll prioritize places in your range.</p>
            <div className="flex flex-col gap-2">
              {([
                { value: "street", label: "Street food", desc: "20-50k VND" },
                { value: "casual", label: "Casual", desc: "50-150k VND" },
                { value: "mid", label: "Mid-range", desc: "150-400k VND" },
                { value: "upscale", label: "Upscale", desc: "400k+ VND" },
                { value: "any", label: "Mix it up", desc: "Show me everything" },
              ] as const).map((opt) => (
                <button key={opt.value} type="button" onClick={() => setProfile((p) => ({ ...p, budget: opt.value }))} className={optionClass(profile.budget === opt.value)}>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="ml-2 text-xs text-foreground/40">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Neighborhoods */}
        {step === 2 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Where do you hang out?</h2>
            <p className="mb-4 text-sm text-foreground/50">Pick your usual neighborhoods. Skip if no preference.</p>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <button key={d} type="button" onClick={() => toggle("neighborhoods", d)} className={chipClass(profile.neighborhoods.includes(d))}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Dietary */}
        {step === 3 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Any dietary needs?</h2>
            <p className="mb-4 text-sm text-foreground/50">I&apos;ll filter out places that don&apos;t work for you.</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => toggle("dietaryPrefs", opt.value)} className={chipClass(profile.dietaryPrefs.includes(opt.value))}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Needs */}
        {step === 4 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Quick extras</h2>
            <p className="mb-4 text-sm text-foreground/50">Toggle what matters to you.</p>
            <div className="flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center gap-3 ${optionClass(profile.needsWifi)}`}>
                <input type="checkbox" checked={profile.needsWifi} onChange={(e) => setProfile((p) => ({ ...p, needsWifi: e.target.checked }))} className="h-4 w-4 accent-cyan-400" />
                <div>
                  <span className="text-sm font-medium text-foreground">I work from cafes</span>
                  <span className="block text-xs text-foreground/40">Prioritize spots with wifi & outlets</span>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 ${optionClass(profile.dogFriendly)}`}>
                <input type="checkbox" checked={profile.dogFriendly} onChange={(e) => setProfile((p) => ({ ...p, dogFriendly: e.target.checked }))} className="h-4 w-4 accent-cyan-400" />
                <div>
                  <span className="text-sm font-medium text-foreground">I bring my dog</span>
                  <span className="block text-xs text-foreground/40">Only show dog-friendly places</span>
                </div>
              </label>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground/70">Spice tolerance</p>
                <div className="flex gap-2">
                  {(["mild", "medium", "spicy", "any"] as const).map((level) => (
                    <button key={level} type="button" onClick={() => setProfile((p) => ({ ...p, spiceLevel: level }))} className={chipClass(profile.spiceLevel === level)}>
                      {level === "any" ? "Any" : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Tired-of cuisines */}
        {step === 5 && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Anything you&apos;re tired of?</h2>
            <p className="mb-4 text-sm text-foreground/50">I&apos;ll deprioritize these unless you ask. Skip if none.</p>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((c) => (
                <button key={c} type="button" onClick={() => toggle("tiredOfCuisines", c.toLowerCase())} className={chipClass(profile.tiredOfCuisines.includes(c.toLowerCase()))}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <button type="button" onClick={back} className="text-sm text-foreground/40 hover:text-cyan-400 transition-colors">
                Back
              </button>
            ) : (
              <button type="button" onClick={skip} className="text-sm text-foreground/40 hover:text-cyan-400 transition-colors">
                Skip setup
              </button>
            )}
          </div>
          <button type="button" onClick={next} className="btn-accent rounded-xl px-5 py-2.5 text-sm">
            {step === totalSteps - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
