import type { Recipe } from "@/engine/recipe.schema";

export const MAX_STARS = 5;

/**
 * Stars shown for a recipe: the parents' own note (1 to 5) once they gave one, otherwise the
 * stars drawn from their HelloFresh orders (computed by ../scripts/build-parents.mjs into data.json).
 */
export function shownStars(recipe: Recipe, rating: number | undefined): number {
  return rating || recipe.orders.stars;
}

/** Weight of the "Les plus réalisées" order: deliveries plus times cooked again at home. Never changes the stars. */
export function timesMade(recipe: Recipe, cooked: number): number {
  return recipe.orders.count + cooked;
}
