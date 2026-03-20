import type { UserProfile } from "@/lib/types/userProfile";

export function profileToContext(profile: UserProfile): string {
  const lines: string[] = ["## User Profile"];

  if (profile.visitType === "visitor") {
    lines.push("- Visiting Saigon (short-term). Prioritize iconic spots and easy-to-find locations.");
  } else {
    lines.push("- Lives in Saigon. Open to neighborhood gems and repeat-visit spots.");
  }

  if (profile.dietaryPrefs.length > 0) {
    lines.push(`- Dietary: ${profile.dietaryPrefs.join(", ")}. NEVER recommend places that conflict.`);
  }

  if (profile.budget !== "any") {
    lines.push(`- Budget preference: ${profile.budget}. Prioritize this price range.`);
  }

  if (profile.neighborhoods.length > 0) {
    lines.push(`- Preferred areas: ${profile.neighborhoods.join(", ")}. Favor these districts.`);
  }

  if (profile.needsWifi) {
    lines.push("- Needs wifi for working. Prioritize cafes/spots with good wifi.");
  }

  if (profile.dogFriendly) {
    lines.push("- Has a dog. Only suggest dog-friendly places unless asked otherwise.");
  }

  if (profile.tiredOfCuisines.length > 0) {
    lines.push(`- Tired of: ${profile.tiredOfCuisines.join(", ")}. Avoid unless specifically asked.`);
  }

  if (profile.spiceLevel !== "any") {
    lines.push(`- Spice preference: ${profile.spiceLevel}.`);
  }

  return lines.join("\n");
}
