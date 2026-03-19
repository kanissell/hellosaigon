import type { RecommendationRecord } from "@/lib/memory/types";
import type { Place } from "@/lib/data/places";
import { checkAvailability } from "./checkAvailability";

const TIME_LABELS: Record<string, [number, number]> = {
  morning: [5, 11],
  lunch: [11, 14],
  afternoon: [14, 17],
  evening: [17, 21],
  "late night": [21, 5],
};

function getTimeLabel(hour: number): string {
  for (const [label, [start, end]] of Object.entries(TIME_LABELS)) {
    if (start < end) {
      if (hour >= start && hour < end) return label;
    } else {
      if (hour >= start || hour < end) return label;
    }
  }
  return "morning";
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function buildUserContext(
  history: RecommendationRecord[],
  now: Date,
  places: Place[]
): string {
  const lines: string[] = [];

  // Current time context
  const dayName = DAYS[now.getDay()];
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const timeLabel = getTimeLabel(now.getHours());
  lines.push(
    `## Current Context\nIt's ${dayName} ${timeStr} (${timeLabel} in Saigon).`
  );

  if (!history || history.length === 0) return lines.join("\n\n");

  // Recent recommendations (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = history.filter((r) => new Date(r.timestamp) >= sevenDaysAgo);

  if (recent.length > 0) {
    const recLines = recent.map((r) => {
      const d = new Date(r.timestamp);
      const day = DAYS[d.getDay()];
      return `- ${r.placeName} (${r.subcategory}) on ${day}`;
    });
    lines.push(
      `## Recent Recommendations (last 7 days)\n${recLines.join("\n")}`
    );
  }

  // Repetition alerts (same subcategory 3+ times in 14 days)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twoWeeks = history.filter(
    (r) => new Date(r.timestamp) >= fourteenDaysAgo
  );
  const subcategoryCounts = new Map<string, number>();
  for (const r of twoWeeks) {
    subcategoryCounts.set(
      r.subcategory,
      (subcategoryCounts.get(r.subcategory) || 0) + 1
    );
  }
  const repeated = [...subcategoryCounts.entries()].filter(
    ([, count]) => count >= 3
  );
  if (repeated.length > 0) {
    const alerts = repeated.map(
      ([sub, count]) =>
        `- User has been recommended "${sub}" ${count} times in 2 weeks — consider suggesting variety`
    );
    lines.push(`## Repetition Alerts\n${alerts.join("\n")}`);
  }

  // Unavailable places from recent recs
  const recentPlaceIds = new Set(recent.map((r) => r.placeId));
  const unavailable: string[] = [];
  for (const pid of recentPlaceIds) {
    const place = places.find((p) => p.id === pid);
    if (!place) continue;
    const status = checkAvailability(place, now);
    if (!status.available) {
      unavailable.push(`- ${place.name}: ${status.reason}`);
    }
  }
  if (unavailable.length > 0) {
    lines.push(
      `## Unavailable Right Now (from their recent favorites)\n${unavailable.join("\n")}`
    );
  }

  return lines.join("\n\n");
}
