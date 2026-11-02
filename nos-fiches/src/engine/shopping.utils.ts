import type { Recipe } from "@/engine/recipe.schema";
import { ingredientKey } from "@/engine/ingredient.utils";
import { formatQuantity, resolveServings, ingredientAmount, TO_TASTE_UNIT } from "@/engine/quantity.utils";

// Pantry items are listed apart from the same ingredient delivered in the box
const PANTRY_SUFFIX = "|placard";

export type ShoppingLine = {
  key: string,
  name: string,
  ingredientId: string,
  isShipped: boolean,
  quantity: string,
  recipeCount: number,
};

export type ShoppingList = { buy: ShoppingLine[], pantry: ShoppingLine[] };

type Accumulator = Omit<ShoppingLine, "quantity" | "recipeCount"> & {
  amounts: Map<string, number>,
  recipeIds: Set<string>,
};

/** Merges the ingredients of the chosen recipes, adding amounts that share a unit. */
export function buildShoppingList(recipes: Recipe[], servings: number): ShoppingList {
  const lines = new Map<string, Accumulator>();
  for (const recipe of recipes) {
    const recipeServings = resolveServings(recipe, servings);
    for (const ingredient of recipe.ingredients) {
      const key = ingredientKey(ingredient.name) + (ingredient.shipped ? "" : PANTRY_SUFFIX);
      const line = lines.get(key) ?? {
        key,
        name: ingredient.name,
        ingredientId: ingredient.id,
        isShipped: ingredient.shipped,
        amounts: new Map<string, number>(),
        recipeIds: new Set<string>(),
      };
      const [amount, unit] = ingredientAmount(recipe, ingredient.id, recipeServings) ?? [null, ""];
      if (amount && unit !== TO_TASTE_UNIT) line.amounts.set(unit, (line.amounts.get(unit) ?? 0) + amount);
      line.recipeIds.add(recipe.id);
      lines.set(key, line);
    }
  }

  const all: ShoppingLine[] = [...lines.values()].map(({ amounts, recipeIds, ...line }) => ({
    ...line,
    quantity: [...amounts].map(([unit, amount]) => formatQuantity(amount, unit)).join(" + "),
    recipeCount: recipeIds.size,
  }));
  const byUse = (a: ShoppingLine, b: ShoppingLine): number => b.recipeCount - a.recipeCount || a.name.localeCompare(b.name, "fr");
  return {
    buy: all.filter((line) => line.isShipped).sort(byUse),
    pantry: all.filter((line) => !line.isShipped).sort(byUse),
  };
}
