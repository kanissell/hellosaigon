import { PLACES } from "@/lib/data/places";
import type { IntentCategory, IntentUseCase } from "@/lib/intent/parseIntent";
import { USER_LOCATION } from "@/lib/location/userLocation";
import { calculateDistanceKm } from "@/lib/location/calculateDistanceKm";

export type PlaceIntent = {
  category?: IntentCategory;
  useCase?: IntentUseCase;
  keywords: string[];
};

export function searchPlaces(intent: PlaceIntent) {
  // 1) Start from all PLACES and 5) only keep open places
  let results = PLACES.filter((place) => place.isOpen);

  // 2) Filter by category if provided
  if (intent.category) {
    results = results.filter((place) => place.category === intent.category);
  }

  // Build a simple, deterministic scoring system
  const scored = results.map((place) => {
    let score = 0;

    // 3) If intent.useCase === "work", prefer coffee places
    if (intent.useCase === "work" && place.category === "coffee") {
      score += 2;
    }

    // 4) Prefer District 1
    if (place.district === "District 1") {
      score += 1;
    }

    return { place, score };
  });

  // Deterministic ordering: sort by score (desc), then by name (asc)
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.place.name.localeCompare(b.place.name);
  });

  // 6) Return the top 3 places (enriched with distance and maps URL)
  return scored.slice(0, 3).map(({ place }) => {
    const distanceKm = calculateDistanceKm(
      USER_LOCATION.lat,
      USER_LOCATION.lng,
      place.lat,
      place.lng
    );

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

    return {
      ...place,
      distanceKm,
      mapsUrl,
    };
  });
}
