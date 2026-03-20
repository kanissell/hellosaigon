export type LearnedTrait = {
  key: string;
  value: string;
  source: string; // the user message that revealed this
  timestamp: string; // ISO
  category: "dietary" | "location" | "lifestyle" | "preferences" | "schedule";
};

export type UserProfile = {
  dietaryPrefs: string[];
  budget: "street" | "casual" | "mid" | "upscale" | "any";
  neighborhoods: string[];
  needsWifi: boolean;
  dogFriendly: boolean;
  tiredOfCuisines: string[];
  spiceLevel: "mild" | "medium" | "spicy" | "any";
  visitType: "visitor" | "resident";
  learnedTraits: LearnedTrait[];
};

export const DEFAULT_PROFILE: UserProfile = {
  dietaryPrefs: [],
  budget: "any",
  neighborhoods: [],
  needsWifi: false,
  dogFriendly: false,
  tiredOfCuisines: [],
  spiceLevel: "any",
  visitType: "visitor",
  learnedTraits: [],
};

export const LS_PROFILE_KEY = "hs_profile";
