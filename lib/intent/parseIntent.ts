export type IntentCategory = "coffee" | "restaurant" | "bar" | "attraction";

export type IntentUseCase = "work" | "romantic" | "chill" | "local";

export function parseIntent(message: string): {
  category?: IntentCategory;
  useCase?: IntentUseCase;
  keywords: string[];
} {
  const lower = message.toLowerCase();
  const keywords = lower
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  let category: IntentCategory | undefined;
  let useCase: IntentUseCase | undefined;

  if (keywords.some((word) => ["coffee", "cafe"].includes(word))) {
    category = "coffee";
  } else if (
    keywords.some((word) => ["food", "eat", "restaurant"].includes(word))
  ) {
    category = "restaurant";
  } else if (
    keywords.some((word) => ["bar", "drink", "beer"].includes(word))
  ) {
    category = "bar";
  }

  if (
    keywords.some((word) => ["work", "laptop", "wifi"].includes(word))
  ) {
    useCase = "work";
  } else if (keywords.some((word) => ["romantic", "date"].includes(word))) {
    useCase = "romantic";
  } else if (keywords.some((word) => ["chill", "relax"].includes(word))) {
    useCase = "chill";
  } else if (
    keywords.some((word) => ["local", "authentic"].includes(word))
  ) {
    useCase = "local";
  }

  return { category, useCase, keywords };
}
