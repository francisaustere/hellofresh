import type { Recipe } from "@/engine/recipe.schema";
import { normalize } from "@/engine/text.utils";

export type SearchMatch = { isMatch: boolean, ingredients: string[] };

/** Every word must appear in the title, headline, a tag, or an ingredient (listed so the card can say why). */
export function matchRecipe(recipe: Recipe, words: string[]): SearchMatch {
  if (!words.length) return { isMatch: true, ingredients: [] };

  const head = normalize(`${recipe.name} ${recipe.headline} ${recipe.tags.join(" ")}`);
  const ingredients: string[] = [];
  for (const word of words) {
    if (head.includes(word)) continue;
    const hits = recipe.ingredients.filter((ingredient) => normalize(ingredient.name).includes(word));
    if (!hits.length) return { isMatch: false, ingredients: [] };
    ingredients.push(...hits.map((ingredient) => ingredient.name));
  }
  return { isMatch: true, ingredients: [...new Set(ingredients)] };
}
