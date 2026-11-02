import type { Recipe } from "@/engine/recipe.schema";
import { normalize } from "@/engine/text.utils";

// "Tête d'ail" and "Ail" are the same purchase: one key per thing to buy.
const ALIASES: [RegExp, string][] = [
  [/^(fromage rape a l italienne|parmigiano reggiano|parmesan|grana padano|copeaux de grana padano|pecorino)/, "fromage italien rapé"],
  [/^salade/, "salade"],
  [/^bouillon.*legume/, "bouillon de légumes"],
];

const NOISE_WORDS = /\b(aop|igp|bio|rape?e?s?|fraiche?s?|concassee?s?|decortiquee?s?|grillee?s?|en sachet|tete d|copeaux de|surgelee?s?)\b/g;

export function ingredientKey(name: string): string {
  const normalized = normalize(name);
  for (const [pattern, key] of ALIASES) {
    if (pattern.test(normalized)) return key;
  }
  const key = normalized.replace(NOISE_WORDS, " ").replace(/\s+/g, " ").trim();
  return key || normalized;
}

/** Keys of the ingredients delivered in the box (pantry items do not count for shared shopping). */
export function shippedKeys(recipe: Recipe): Set<string> {
  return new Set(recipe.ingredients.filter((ingredient) => ingredient.shipped).map((ingredient) => ingredientKey(ingredient.name)));
}
