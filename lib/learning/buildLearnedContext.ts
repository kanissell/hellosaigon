import type { LearnedTrait } from "@/lib/types/userProfile";

export function buildLearnedContext(traits: LearnedTrait[]): string {
  if (!traits || traits.length === 0) return "";

  const grouped = new Map<string, LearnedTrait[]>();
  for (const t of traits) {
    const list = grouped.get(t.category) || [];
    list.push(t);
    grouped.set(t.category, list);
  }

  const lines: string[] = ["## What You've Learned About This User"];

  const categoryLabels: Record<string, string> = {
    dietary: "Food & Diet",
    location: "Location",
    lifestyle: "Lifestyle",
    preferences: "Preferences",
    schedule: "Schedule",
  };

  for (const [cat, catTraits] of grouped) {
    lines.push(`**${categoryLabels[cat] || cat}:**`);
    for (const t of catTraits) {
      const date = new Date(t.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      lines.push(`- ${t.value} (learned ${date})`);
    }
  }

  lines.push("");
  lines.push("IMPORTANT: You already know these things from past conversations. Do NOT ask about them again. Reference them naturally when relevant.");

  return lines.join("\n");
}
