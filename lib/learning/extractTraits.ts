import type { LearnedTrait } from "@/lib/types/userProfile";

type Pattern = {
  regex: RegExp;
  key: string;
  category: LearnedTrait["category"];
  extract: (match: RegExpMatchArray) => string;
};

const PATTERNS: Pattern[] = [
  // Dietary
  { regex: /i(?:'m| am) (vegetarian|vegan|pescatarian|gluten[- ]free|lactose[- ]intolerant)/i, key: "diet", category: "dietary", extract: (m) => m[1] },
  { regex: /i (?:love|really like|enjoy|can't get enough of) (spicy (?:food|stuff)|spice)/i, key: "spice_love", category: "dietary", extract: () => "loves spicy food" },
  { regex: /i (?:don't like|hate|can't eat|avoid|am allergic to) (\w[\w\s]{1,20})/i, key: "food_avoid", category: "dietary", extract: (m) => `avoids ${m[1].trim()}` },
  { regex: /no (?:more )?(\w[\w\s]{1,15})(?:for me|please|anymore)/i, key: "tired_of", category: "dietary", extract: (m) => `tired of ${m[1].trim()}` },
  { regex: /i(?:'m| am) (?:tired of|sick of|over) (\w[\w\s]{1,20})/i, key: "tired_of", category: "dietary", extract: (m) => `tired of ${m[1].trim()}` },

  // Location
  { regex: /i (?:live|stay|am) (?:in|near|around|close to) (?:district |d)(\d+)/i, key: "location", category: "location", extract: (m) => `near District ${m[1]}` },
  { regex: /i (?:live|stay|am) (?:in|near|around) (binh thanh|phu nhuan|go vap|tan binh|thu duc|thao dien)/i, key: "location", category: "location", extract: (m) => `near ${m[1]}` },
  { regex: /i(?:'m| am) (?:staying|based) (?:in|at|near) (.{3,25})/i, key: "location", category: "location", extract: (m) => `staying near ${m[1].trim()}` },

  // Lifestyle
  { regex: /i (?:have|got) a (?:dog|puppy)/i, key: "has_dog", category: "lifestyle", extract: () => "has a dog" },
  { regex: /i (?:have|got) (?:a )?(?:cat|kitten)/i, key: "has_cat", category: "lifestyle", extract: () => "has a cat" },
  { regex: /i (?:work|am working) (?:from|at) (?:home|cafes?|remotely)/i, key: "remote_work", category: "lifestyle", extract: (m) => `works ${m[0].includes("cafe") ? "from cafes" : "remotely"}` },
  { regex: /i(?:'m| am) (?:on )?a (?:tight )?budget/i, key: "budget", category: "lifestyle", extract: () => "on a budget" },

  // Preferences
  { regex: /i (?:love|really like|prefer|enjoy) (\w[\w\s]{2,25}?)(?:\.|,|!|$)/i, key: "loves", category: "preferences", extract: (m) => `loves ${m[1].trim()}` },
  { regex: /i (?:prefer|like) (indoor|outdoor|ac|air[- ]con)/i, key: "seating_pref", category: "preferences", extract: (m) => `prefers ${m[1].toLowerCase().includes("ac") || m[1].toLowerCase().includes("air") ? "AC" : m[1]}` },
  { regex: /(?:my )?fav(?:ourite|orite)? (?:is|place is|spot is) (.{3,30})/i, key: "favorite", category: "preferences", extract: (m) => `favorite: ${m[1].trim()}` },

  // Schedule
  { regex: /i usually (?:eat|have) (?:lunch|dinner|breakfast) (?:around|at) (\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i, key: "meal_time", category: "schedule", extract: (m) => `usual meal time: ${m[1]}` },
  { regex: /i(?:'m| am) (?:usually |often )?(?:free|available|off) on ((?:mon|tue|wed|thu|fri|sat|sun)\w*)/i, key: "free_day", category: "schedule", extract: (m) => `free on ${m[1]}` },
];

export function extractTraits(
  message: string,
  existingTraits: LearnedTrait[]
): LearnedTrait[] {
  const now = new Date().toISOString();
  const newTraits: LearnedTrait[] = [];
  const existingKeys = new Set(existingTraits.map((t) => t.key));

  for (const pattern of PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) {
      const value = pattern.extract(match);
      // Update existing trait or add new one
      if (existingKeys.has(pattern.key)) {
        // Only update if the value changed
        const existing = existingTraits.find((t) => t.key === pattern.key);
        if (existing && existing.value !== value) {
          newTraits.push({
            key: pattern.key,
            value,
            source: message.slice(0, 100),
            timestamp: now,
            category: pattern.category,
          });
        }
      } else {
        newTraits.push({
          key: pattern.key,
          value,
          source: message.slice(0, 100),
          timestamp: now,
          category: pattern.category,
        });
      }
    }
  }

  return newTraits;
}

export function mergeTraits(
  existing: LearnedTrait[],
  newTraits: LearnedTrait[]
): LearnedTrait[] {
  const merged = [...existing];
  for (const trait of newTraits) {
    const idx = merged.findIndex((t) => t.key === trait.key);
    if (idx >= 0) {
      merged[idx] = trait; // Update in place
    } else {
      merged.push(trait);
    }
  }
  return merged;
}
