"use client";

import type { Place } from "@/lib/data/places";

type Props = {
  place: Place;
  compact?: boolean;
  onClick?: () => void;
  onNavigate?: () => void;
  onCall?: () => void;
  animationDelay?: number;
};

const PRICE_LABELS: Record<string, string> = {
  street: "Street",
  casual: "Casual",
  mid: "Mid-range",
  upscale: "Upscale",
};

export default function PlaceCard({ place, compact, onClick, onNavigate, onCall, animationDelay }: Props) {
  const mapsUrl =
    place.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;

  return (
    <div
      onClick={onClick}
      className={`glass-card card-reveal rounded-xl ${
        onClick ? "cursor-pointer" : ""
      } ${compact ? "p-3" : "p-4"}`}
      style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
    >
      {/* Border trace SVG overlay */}
      {!compact && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            x="0.5"
            y="0.5"
            width="99"
            height="99"
            rx="6"
            ry="6"
            fill="none"
            stroke="rgba(6,182,212,0.15)"
            strokeWidth="0.5"
            className="border-trace"
            strokeDasharray="400"
          />
        </svg>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : "text-base"}`}>
            {place.name}
          </h3>
          <p className="text-xs text-cyan-600 dark:text-cyan-500/50">
            {place.subcategory} &middot; {place.district}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">
          {place.personalRating}/10
        </span>
      </div>

      {!compact && place.signatureItem && (
        <p className="mt-2 text-sm text-foreground/80">
          <span className="font-medium text-cyan-400">
            {place.category === "eat_drink" ? "Order:" : "Known for:"}
          </span>{" "}
          {place.signatureItem}
        </p>
      )}

      {!compact && place.insiderTip && place.insiderTip.length > 5 && (
        <p className="mt-1 text-sm italic text-foreground/40">
          {place.insiderTip}
        </p>
      )}

      {!compact && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-foreground/40">
          <span>{PRICE_LABELS[place.priceRange] || place.priceRange}</span>
          {place.bestTime && <span>&middot; {place.bestTime.join(", ")}</span>}
          {place.dogFriendly && <span>&middot; Dog-friendly</span>}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.();
          }}
          className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Navigate
        </a>
        {place.phoneNumber && (
          <a
            href={`tel:${place.phoneNumber}`}
            onClick={(e) => {
              e.stopPropagation();
              onCall?.();
            }}
            className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Call
          </a>
        )}
      </div>
    </div>
  );
}
