import type { RecommendationRecord } from "./types";

export type HistoryAnalysis = {
  recentPlaceIds: Set<string>; // recommended in last 24h
  yesterdaySubcategories: Set<string>; // subcategories from yesterday
  favorites: Map<string, number>; // placeId → days since last seen (only 2+ recs & engaged)
};

export function analyzeHistory(
  history: RecommendationRecord[],
  now: Date
): HistoryAnalysis {
  const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
  const twoDaysAgo = now.getTime() - 2 * 24 * 60 * 60 * 1000;

  const recentPlaceIds = new Set<string>();
  const yesterdaySubcategories = new Set<string>();
  const favorites = new Map<string, number>();

  // Count engagements per place
  const engagementCount = new Map<string, number>();
  const lastSeen = new Map<string, number>();

  for (const rec of history) {
    const ts = new Date(rec.timestamp).getTime();

    // Last 24h
    if (ts >= oneDayAgo) {
      recentPlaceIds.add(rec.placeId);
    }

    // Yesterday (24h-48h ago)
    if (ts >= twoDaysAgo && ts < oneDayAgo) {
      yesterdaySubcategories.add(rec.subcategory);
    }

    // Track engaged recommendations
    if (rec.engaged) {
      engagementCount.set(rec.placeId, (engagementCount.get(rec.placeId) || 0) + 1);
    }

    // Track last seen
    const prev = lastSeen.get(rec.placeId) || 0;
    if (ts > prev) lastSeen.set(rec.placeId, ts);
  }

  // Favorites: 2+ engaged recommendations
  for (const [placeId, count] of engagementCount) {
    if (count >= 2) {
      const last = lastSeen.get(placeId) || now.getTime();
      const daysSince = Math.floor((now.getTime() - last) / (24 * 60 * 60 * 1000));
      favorites.set(placeId, daysSince);
    }
  }

  return { recentPlaceIds, yesterdaySubcategories, favorites };
}
