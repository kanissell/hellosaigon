import type { Place } from "@/lib/data/places";
import type { UserProfile } from "@/lib/types/userProfile";
import type { RecommendationRecord } from "@/lib/memory/types";

type TimePhase = "morning" | "lunch" | "afternoon" | "dinner" | "late_night";

function getTimePhase(hour: number): TimePhase {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "dinner";
  return "late_night";
}

export function generateSmartCards(
  places: Place[],
  profile: UserProfile | null,
  history: RecommendationRecord[]
): Place[] {
  const now = new Date();
  const phase = getTimePhase(now.getHours());

  // Places recommended in last 7 days — avoid repeats
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const recentIds = new Set(
    history
      .filter((r) => new Date(r.timestamp).getTime() >= sevenDaysAgo)
      .map((r) => r.placeId)
  );

  const candidates = places.filter((p) => p.verifiedByYou && !recentIds.has(p.id));

  // Score each place
  const scored = candidates.map((place) => {
    let score = place.personalRating * 0.4;

    // Time-of-day match
    if (place.bestTime?.includes(phase)) {
      score += 3;
    }

    // Profile fit
    if (profile) {
      if (profile.budget !== "any" && place.priceRange === profile.budget) {
        score += 1;
      }
      if (profile.neighborhoods.length > 0) {
        if (profile.neighborhoods.some((n) => place.district.toLowerCase() === n.toLowerCase())) {
          score += 1.5;
        }
      }
      if (profile.dogFriendly && !place.dogFriendly) {
        score -= 10; // hard penalty
      }
      if (profile.needsWifi && place.vibes.includes("work")) {
        score += 1;
      }
      // Penalize tired-of cuisines
      const tags = `${place.subcategory} ${place.signatureItem}`.toLowerCase();
      for (const c of profile.tiredOfCuisines) {
        if (tags.includes(c)) {
          score -= 3;
          break;
        }
      }

      // Boost from learned traits
      for (const trait of profile.learnedTraits || []) {
        const val = trait.value.toLowerCase();
        if (trait.category === "dietary" && val.includes("spicy") && tags.includes("spicy")) {
          score += 2;
        }
        if (trait.category === "preferences" && tags.includes(val.replace("loves ", ""))) {
          score += 2;
        }
        if (trait.category === "location") {
          const district = val.match(/district (\d+)/i)?.[1];
          if (district && place.district.toLowerCase().includes(district)) {
            score += 1.5;
          }
        }
      }
    }

    return { place, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Pick top 3 with category diversity
  const picked: Place[] = [];
  const usedSubcategories = new Set<string>();

  for (const { place } of scored) {
    if (picked.length >= 3) break;
    // If we already have this subcategory and there are more candidates, skip
    if (usedSubcategories.has(place.subcategory) && picked.length < 2) {
      continue;
    }
    picked.push(place);
    usedSubcategories.add(place.subcategory);
  }

  // If diversity filtering was too aggressive, fill remaining slots
  if (picked.length < 3) {
    for (const { place } of scored) {
      if (picked.length >= 3) break;
      if (!picked.includes(place)) {
        picked.push(place);
      }
    }
  }

  return picked;
}
