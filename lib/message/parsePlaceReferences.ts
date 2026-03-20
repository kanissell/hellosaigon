import type { Place } from "@/lib/data/places";

export function parsePlaceReferences(text: string, places: Place[]): Place[] {
  const lower = text.toLowerCase();
  return places.filter((place) => lower.includes(place.name.toLowerCase()));
}
