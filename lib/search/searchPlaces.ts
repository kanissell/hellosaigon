import type { Place } from "@/lib/data/places";

export type SearchContext = {
  category?: string;
  vibes?: string[];
  district?: string;
  dogFriendly?: boolean;
  timeOfDay?: "morning" | "lunch" | "afternoon" | "dinner" | "late_night";
  mood?: "quick" | "sitdown" | "special" | "street";
  keywords?: string[];
};

// Approximate center coordinates for Saigon districts
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "district 1": { lat: 10.776, lng: 106.700 },
  "district 3": { lat: 10.783, lng: 106.683 },
  "district 4": { lat: 10.758, lng: 106.706 },
  "district 5": { lat: 10.754, lng: 106.664 },
  "district 7": { lat: 10.735, lng: 106.722 },
  "district 10": { lat: 10.773, lng: 106.660 },
  "district 11": { lat: 10.766, lng: 106.650 },
  "district 12": { lat: 10.867, lng: 106.654 },
  "binh thanh": { lat: 10.802, lng: 106.710 },
  "phu nhuan": { lat: 10.800, lng: 106.680 },
  "go vap": { lat: 10.838, lng: 106.667 },
  "tan binh": { lat: 10.802, lng: 106.652 },
  "tan phu": { lat: 10.792, lng: 106.632 },
  "thu duc city": { lat: 10.830, lng: 106.760 },
};

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

// Strip Vietnamese diacritics for fuzzy matching (user types "bun bo", data has "bún bò")
function stripDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

export type ScoredPlace = Place & { _distanceKm?: number; _inRequestedDistrict?: boolean };

function calculateScore(place: Place, context: SearchContext, dist?: number): number {
  let score = 0;

  // Personal rating is king — this is Kai's score (1-10, weight 40%)
  score += place.personalRating * 0.4;

  // Specialization (1-10, weight 20%)
  score += place.specializationScore * 0.2;

  // Longevity (capped at 10 years, weight 15%)
  if (place.yearsOpen) {
    score += Math.min(place.yearsOpen, 10) * 0.15;
  }

  // Menu focus (small=1.0, medium=0.6, large=0.3)
  if (place.menuSize) {
    score += place.menuSize === "small" ? 1.0 : place.menuSize === "medium" ? 0.6 : 0.3;
  }

  // Verified bonus
  if (place.verifiedByYou) {
    score += 1.5;
  }

  // Vibe match
  if (context.vibes) {
    const vibeMatches = context.vibes.filter((v) =>
      place.vibes.includes(v.toLowerCase())
    ).length;
    score += vibeMatches * 0.5;
  }

  // Time-of-day match
  if (context.timeOfDay && place.bestTime?.includes(context.timeOfDay)) {
    score += 0.5;
  }

  // Dog-friendly match
  if (context.dogFriendly && place.dogFriendly) {
    score += 1;
  }

  // Distance scoring — mood-dependent
  // "quick" mood: distance matters a lot. "special" mood: quality matters more.
  if (dist !== undefined) {
    const isQuick = context.mood === "quick" || context.mood === "street";
    if (isQuick) {
      // Quick: heavily favor closer places
      if (dist <= 2) score += 2;
      else if (dist <= 5) score += 0.5;
      else score -= 1;
    } else {
      // Default/special: quality wins, mild distance factor
      if (dist <= 2) score += 1;
      else if (dist <= 5) score += 0.5;
      else if (dist > 10) score -= 0.5;
    }
  }

  // Mood → price range matching
  if (context.mood === "street" && place.priceRange === "street") score += 1;
  if (context.mood === "quick" && (place.priceRange === "street" || place.priceRange === "casual")) score += 0.5;
  if (context.mood === "special" && (place.priceRange === "upscale" || place.priceRange === "mid")) score += 1;
  if (context.mood === "sitdown" && place.priceRange !== "street") score += 0.5;

  return score;
}

export function searchPlaces(context: SearchContext, places: Place[]): ScoredPlace[] {
  let results = places.filter((place) => place.verifiedByYou);

  // Filter by category
  if (context.category) {
    const cat = context.category.toLowerCase();
    results = results.filter(
      (place) =>
        place.category === cat ||
        place.subcategory.toLowerCase().includes(cat)
    );
  }

  // Narrow by keywords: try the full phrase first, then individual words
  if (context.keywords && context.keywords.length > 0) {
    const fullPhrase = context.keywords.join(" ");
    // Remove common filler words for matching
    const fillers = new Set([
      "near", "in", "at", "the", "a", "i", "want", "to", "eat", "find", "me", "some", "good", "best",
      "quick", "fast", "grab", "nice", "fancy", "cheap", "local", "street",
      // District keywords — not food terms
      "d1", "d2", "d3", "d4", "d5", "d7", "d10", "d11", "d12",
      "district", "1", "2", "3", "4", "5", "7", "10", "11", "12",
      "downtown", "center", "thao", "dien", "thu", "duc", "binh", "thanh",
      "phu", "nhuan", "go", "vap", "tan", "hung",
    ]);
    const foodWords = context.keywords.filter((kw) => !fillers.has(kw)).map(stripDiacritics);
    const foodPhrase = foodWords.join(" ");

    const haystack = (place: Place) =>
      stripDiacritics(`${place.name} ${place.subcategory} ${place.signatureItem} ${place.personalNotes}`.toLowerCase());

    // First try: match the full food phrase (e.g. "bun bo")
    if (foodPhrase.length > 1) {
      const phraseFiltered = results.filter((place) => haystack(place).includes(foodPhrase));
      if (phraseFiltered.length > 0) {
        results = phraseFiltered;
      } else {
        // Fallback: match individual food words, prefer places matching more words
        const scored = results.map((place) => {
          const h = haystack(place);
          const matches = foodWords.filter((kw) => h.includes(kw)).length;
          return { place, matches };
        }).filter((s) => s.matches > 0);

        if (scored.length > 0) {
          scored.sort((a, b) => b.matches - a.matches);
          results = scored.map((s) => s.place);
        }
      }
    }
  }

  // Filter by dog-friendly
  if (context.dogFriendly) {
    results = results.filter((place) => place.dogFriendly);
  }

  // Calculate distance from requested district (don't filter — let score decide)
  const distCenter = context.district
    ? DISTRICT_COORDS[context.district.toLowerCase()]
    : undefined;

  const scored = results.map((place) => {
    const dist = distCenter ? distanceKm(distCenter, place.coordinates) : undefined;
    const score = calculateScore(place, context, dist);
    const enriched: ScoredPlace = {
      ...place,
      _distanceKm: dist !== undefined ? Math.round(dist * 10) / 10 : undefined,
      _inRequestedDistrict: context.district
        ? place.district.toLowerCase() === context.district.toLowerCase()
        : undefined,
    };
    return { enriched, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.enriched);
}

// Get all places (for general queries)
export function getAllPlaces(places: Place[]): ScoredPlace[] {
  return places.filter((place) => place.verifiedByYou);
}
