import { PLACES } from "@/lib/data/places";
import type { RecommendationRecord } from "./types";

export function extractRecommendations(
  assistantText: string
): RecommendationRecord[] {
  const lower = assistantText.toLowerCase();
  const now = new Date().toISOString();

  return PLACES.filter((place) => lower.includes(place.name.toLowerCase())).map(
    (place) => ({
      placeId: place.id,
      placeName: place.name,
      subcategory: place.subcategory,
      timestamp: now,
    })
  );
}
