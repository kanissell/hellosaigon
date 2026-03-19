import { SearchContext } from "@/lib/search/searchPlaces";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  eat_drink: [
    "food", "eat", "hungry", "restaurant", "dinner", "lunch", "breakfast",
    "pho", "banh mi", "noodle", "rice", "com tam", "bun",
    "coffee", "cafe", "work", "laptop", "wifi",
    "bar", "drink", "beer", "cocktail", "wine", "rooftop",
    "dessert", "sweet", "ice cream", "che", "bakery",
    "brunch", "snack", "street food",
  ],
  self_care: [
    "spa", "massage", "relax", "wellness",
    "hair", "haircut", "barber", "salon",
    "nails", "manicure", "pedicure",
    "dentist", "doctor", "clinic", "health", "dermatologist",
    "yoga", "meditation",
  ],
  daily_life: [
    "cleaning", "cleaner", "maid", "laundry",
    "repair", "fix", "mechanic", "bike", "motorbike",
    "tailor", "alteration", "sewing",
    "pet", "vet", "veterinarian", "grooming",
    "gym", "fitness", "swimming", "pool",
    "sim card", "phone plan", "internet",
    "visa", "immigration",
  ],
  experiences: [
    "see", "visit", "tourist", "sightseeing", "temple", "museum",
    "nightlife", "club", "dancing",
    "day trip", "daytrip", "cu chi", "mekong",
    "class", "cooking class", "pottery", "workshop",
    "tour", "walking tour",
    "live music", "concert", "show",
  ],
};

const VIBE_KEYWORDS: Record<string, string[]> = {
  work: ["work", "laptop", "wifi", "productive", "quiet"],
  chill: ["chill", "relax", "casual", "hang"],
  date: ["date", "romantic", "girlfriend", "boyfriend", "special"],
  authentic: ["authentic", "local", "real", "street"],
  upscale: ["nice", "fancy", "upscale", "special occasion"],
  quick: ["quick", "fast", "grab"],
  trusted: ["trusted", "reliable", "recommend", "good"],
  english: ["english", "english-speaking", "speaks english"],
};

const DISTRICT_KEYWORDS: Record<string, string[]> = {
  "District 1": ["district 1", "d1", "downtown", "center", "nguyen hue", "ben thanh"],
  "District 3": ["district 3", "d3"],
  "Thu Duc City": ["thao dien", "district 2", "d2", "thu duc"],
  "District 7": ["district 7", "d7", "phu my hung"],
  "Binh Thanh": ["binh thanh"],
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  quick: ["quick", "fast", "grab", "on the way", "rush", "hurry", "snack", "bite"],
  sitdown: ["sit down", "sit-down", "proper", "dinner", "lunch spot", "nice meal", "dine"],
  special: ["special", "celebrate", "anniversary", "birthday", "impress", "fancy", "date night"],
  street: ["street food", "street", "cheap", "local", "sidewalk"],
};

const TIME_KEYWORDS: Record<string, string[]> = {
  morning: ["morning", "breakfast", "early"],
  lunch: ["lunch", "noon", "midday"],
  afternoon: ["afternoon", "tea time"],
  dinner: ["dinner", "evening"],
  late_night: ["late", "night", "midnight", "after hours"],
};

export function parseIntent(message: string): SearchContext {
  const lower = message.toLowerCase();
  const context: SearchContext = {
    keywords: lower.split(/\s+/).filter(Boolean),
  };

  // Detect category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      context.category = category;
      break;
    }
  }

  // Detect vibes
  const detectedVibes: string[] = [];
  for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detectedVibes.push(vibe);
    }
  }
  if (detectedVibes.length > 0) {
    context.vibes = detectedVibes;
  }

  // Detect district
  for (const [district, keywords] of Object.entries(DISTRICT_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      context.district = district;
      break;
    }
  }

  // Detect time of day
  for (const [time, keywords] of Object.entries(TIME_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      context.timeOfDay = time as SearchContext["timeOfDay"];
      break;
    }
  }

  // Detect mood
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      context.mood = mood as SearchContext["mood"];
      break;
    }
  }

  // Detect dog-friendly request
  if (lower.includes("dog") || lower.includes("pet")) {
    context.dogFriendly = true;
  }

  return context;
}
