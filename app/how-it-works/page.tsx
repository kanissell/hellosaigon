import Link from "next/link";
import { getPlaces } from "@/lib/data/getPlaces";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — HelloSaigon",
  description: "How HelloSaigon sources, rates, and recommends places in Ho Chi Minh City.",
};

/* ── helpers ── */

function computeStats(places: ReturnType<typeof getPlaces>) {
  const verified = places.filter((p) => p.verifiedByYou);
  const categories: Record<string, number> = {};
  const districts: Record<string, number> = {};
  const subcategories = new Set<string>();

  for (const p of verified) {
    categories[p.category] = (categories[p.category] || 0) + 1;
    districts[p.district] = (districts[p.district] || 0) + 1;
    subcategories.add(p.subcategory);
  }

  const topDistricts = Object.entries(districts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return {
    total: places.length,
    verified: verified.length,
    categories,
    topDistricts,
    subcategoryCount: subcategories.size,
    avgRating: verified.length
      ? (verified.reduce((s, p) => s + p.personalRating, 0) / verified.length).toFixed(1)
      : "0",
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  eat_drink: "Eat & Drink",
  self_care: "Self-Care",
  daily_life: "Daily Life",
  experiences: "Experiences",
};

const SCORING_WEIGHTS = [
  { label: "Personal Rating (Kai's Score)", pct: 40, desc: "How much I personally enjoy this place" },
  { label: "Specialization Score", pct: 20, desc: "Does one thing really well vs. tries everything" },
  { label: "Longevity", pct: 15, desc: "Years open — survived = legit" },
  { label: "Menu Focus", pct: 2.5, desc: "Smaller menu = more mastery" },
  { label: "Verified Bonus", pct: 7.5, desc: "Flat +1.5 pts for personally verified places" },
  { label: "Context Match", pct: 15, desc: "Vibes, time-of-day, distance, mood, dog-friendly" },
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Intent Parsing",
    desc: "Extract category, district, vibes, mood, and time-of-day from the user's message using keyword patterns.",
    example: '"bun bo near D1" → category: eat_drink, district: District 1, mood: null',
  },
  {
    step: "02",
    title: "Filter Verified",
    desc: "Only places Kai has personally visited and verified make it through. Unverified entries are excluded.",
    example: "175 total → ~120 verified candidates",
  },
  {
    step: "03",
    title: "Keyword Match",
    desc: "Full phrase match first (diacritic-stripped), then individual word fallback weighted by match count.",
    example: '"bun bo" matches subcategory, name, signatureItem fields',
  },
  {
    step: "04",
    title: "Score & Rank",
    desc: "Apply scoring weights: rating (40%) + specialization (20%) + longevity (15%) + context bonuses. Profile adjustments for budget, neighborhood, dietary needs.",
    example: "Each place gets a composite score 0-10+",
  },
  {
    step: "05",
    title: "History Adjustment",
    desc: "Penalize recently recommended places (-5 if last 24h), avoid yesterday's subcategory (-2), boost favorites not seen in 14+ days (+3).",
    example: "Prevents repetitive recommendations",
  },
  {
    step: "06",
    title: "Top 5 Delivered",
    desc: "Sorted by final score. The AI uses these as context to craft a natural, conversational response with insider tips.",
    example: "Best matches → LLM → personalized recommendation",
  },
];

const DATA_FIELDS = [
  {
    group: "Identity",
    color: "cyan",
    fields: ["name", "category", "subcategory", "district", "address", "coordinates"],
  },
  {
    group: "Assessment",
    color: "emerald",
    fields: ["personalRating (1-10)", "specializationScore", "signatureItem", "insiderTip", "personalNotes", "timesVisited"],
  },
  {
    group: "Context",
    color: "violet",
    fields: ["vibes[]", "bestTime[]", "priceRange", "dogFriendly", "acOrOutdoor", "bestFor[]"],
  },
  {
    group: "Practical",
    color: "amber",
    fields: ["cashOnly", "operatingHours", "phoneNumber", "googleMapsUrl", "acceptsMomo", "sellsOutBy"],
  },
];

/* ── page ── */

export default function HowItWorksPage() {
  const places = getPlaces();
  const stats = computeStats(places);

  return (
    <div className="relative min-h-screen" style={{ zIndex: 1 }}>
      {/* Header */}
      <header className="hud-border-bottom px-4 py-3" style={{ zIndex: 10 }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 transition-colors hover:bg-cyan-500/20"
              aria-label="Back to chat"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                How It Works
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
                Data Pipeline
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">

        {/* ═══ Section 1: Data Source ═══ */}
        <section className="card-reveal glass-card rounded-2xl p-6">
          <SectionHeader number="01" title="Data Source" subtitle="Personal Curation, Not Crowdsourced" />

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Every single place in HelloSaigon is personally visited and verified by one person (Kai).
            No scraped data, no user reviews, no algorithms deciding what&apos;s good.
            If it&apos;s in the database, someone actually went there and rated it.
          </p>

          {/* Curation flow */}
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:gap-0">
            <FlowStep icon="🏃" label="Visit & Verify" />
            <FlowArrow />
            <FlowStep icon="⭐" label="Rate 1-10" />
            <FlowArrow />
            <FlowStep icon="💾" label="Add to Database" />
          </div>

          {/* Live stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={stats.total.toString()} label="Total Places" />
            <StatCard value={stats.verified.toString()} label="Verified" />
            <StatCard value={stats.subcategoryCount.toString()} label="Subcategories" />
            <StatCard value={stats.avgRating} label="Avg Rating" />
          </div>

          {/* Category breakdown */}
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
              Category Breakdown
            </p>
            <div className="space-y-2">
              {Object.entries(stats.categories)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-foreground/60">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-cyan-500/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                        style={{ width: `${(count / stats.verified) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-cyan-400">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top districts */}
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
              Top Districts
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.topDistricts.map(([district, count]) => (
                <span
                  key={district}
                  className="chip rounded-full px-3 py-1 text-xs text-foreground/70"
                >
                  {district} <span className="ml-1 text-cyan-400">{count}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 2: Data Model ═══ */}
        <section className="card-reveal glass-card rounded-2xl p-6" style={{ animationDelay: "0.1s" }}>
          <SectionHeader number="02" title="What We Capture" subtitle="Per-Place Data Model" />

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Each place captures 30+ fields across four categories.
            This rich context is what lets the AI make smart, situational recommendations.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DATA_FIELDS.map((group) => (
              <div
                key={group.group}
                className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4"
              >
                <p className={`mb-2 text-xs font-semibold uppercase tracking-wider text-${group.color}-400`}>
                  {group.group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.fields.map((f) => (
                    <code
                      key={f}
                      className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[11px] text-foreground/60"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Section 3: Scoring Engine ═══ */}
        <section className="card-reveal glass-card rounded-2xl p-6" style={{ animationDelay: "0.2s" }}>
          <SectionHeader number="03" title="The Scoring Engine" subtitle="How Places Are Ranked" />

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            When you ask for a recommendation, every matching place gets a composite score.
            Kai&apos;s personal rating is the dominant signal — the algorithm amplifies taste, not popularity.
          </p>

          <div className="mt-6 space-y-3">
            {SCORING_WEIGHTS.map((w) => (
              <div key={w.label}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-foreground/80">{w.label}</span>
                  <span className="font-mono text-xs text-cyan-400">
                    {w.pct % 1 === 0 ? `${w.pct}%` : `${w.pct}%`}
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-cyan-500/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
                    style={{ width: `${(w.pct / 40) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-foreground/40">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Section 4: Recommendation Pipeline ═══ */}
        <section className="card-reveal glass-card rounded-2xl p-6" style={{ animationDelay: "0.3s" }}>
          <SectionHeader number="04" title="The Pipeline" subtitle="From Question to Recommendation" />

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Every user message goes through a 6-step pipeline before the AI responds.
            No places are invented — every recommendation comes from the verified database.
          </p>

          <div className="mt-6 space-y-0">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.step} className="relative flex gap-4">
                {/* Vertical connector line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-400">
                    {step.step}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-cyan-500/30 to-cyan-500/5" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6">
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/60">{step.desc}</p>
                  <p className="mt-1 font-mono text-[10px] text-cyan-500/40">{step.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Section 5: Personalization ═══ */}
        <section className="card-reveal glass-card rounded-2xl p-6" style={{ animationDelay: "0.4s" }}>
          <SectionHeader number="05" title="Personalization" subtitle="How It Learns & Adapts" />

          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            Three data sources make each recommendation more personal over time.
            The system never re-asks what it already knows.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <PersonalizationCard
              title="Profile"
              subtitle="From onboarding"
              items={[
                "Budget preference match",
                "Neighborhood proximity",
                "WiFi/workspace need",
                "\"Tired of\" cuisine penalty",
                "Dog-friendly filter",
              ]}
            />
            <PersonalizationCard
              title="Learned Traits"
              subtitle="Extracted from chat"
              items={[
                "\"I love spicy\" → boost spicy spots",
                "\"I live near D3\" → distance aware",
                "Dietary prefs auto-detected",
                "Pattern-matched, zero cost",
                "Never asks what it knows",
              ]}
            />
            <PersonalizationCard
              title="History"
              subtitle="Recommendation memory"
              items={[
                "Last 24h: -5 penalty",
                "Yesterday subcategory: -2",
                "Favorite not seen 14d: +3",
                "7-day repeat avoidance",
                "Engagement tracking",
              ]}
            />
          </div>
        </section>

        {/* Back to chat */}
        <div className="pb-8 text-center">
          <Link
            href="/"
            className="btn-accent inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
            </svg>
            Back to Chat
          </Link>
        </div>
      </main>
    </div>
  );
}

/* ── sub-components ── */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 font-mono text-sm font-bold text-cyan-400">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-500/40">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-3 text-center">
      <p className="font-mono text-2xl font-bold text-cyan-400">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-foreground/40">{label}</p>
    </div>
  );
}

function FlowStep({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-5 py-3 sm:flex-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-foreground/70">{label}</span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-1 sm:px-2 sm:py-0">
      {/* Vertical arrow (mobile) */}
      <svg className="h-5 w-5 text-cyan-500/30 sm:hidden" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      {/* Horizontal arrow (desktop) */}
      <svg className="hidden h-5 w-5 text-cyan-500/30 sm:block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

function PersonalizationCard({ title, subtitle, items }: { title: string; subtitle: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-cyan-500/40">{subtitle}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-xs text-foreground/60">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
