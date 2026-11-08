import type { Recipe, RecipeData } from "@/engine/recipe.schema";
import { ingredientKey, shippedKeys } from "@/engine/ingredient.utils";
import { recipeSeason, type Season } from "@/engine/season.utils";

export type Overlap = {
  recipe: Recipe,
  shared: string[],
  extra: string[],
  score: number,
};

// A shared ingredient counts a little even when it is common, so ties still rank.
const SHARED_BONUS = 0.3;
const MIN_SCORE = 0.2;
/** Below this rarity an ingredient (garlic, onion) is shown as a minor tag. */
export const RARE_THRESHOLD = 0.9;

/**
 * Recipe lookups and "same shopping" ranking. Each delivered ingredient gets a rarity
 * (inverse document frequency): sharing ginger is worth more than sharing an onion.
 */
export default class RecipeCatalog {

  readonly recipes: Recipe[];
  readonly icons: RecipeData["icons"];

  private readonly _byId: Map<string, Recipe>;
  private readonly _keys = new Map<string, Set<string>>();
  private readonly _rarity = new Map<string, number>();
  private readonly _labels = new Map<string, string>();
  private readonly _seasons = new Map<string, Season | null>();

  constructor(data: RecipeData) {
    this.recipes = data.recipes;
    this.icons = data.icons;
    this._byId = new Map(data.recipes.map((recipe) => [recipe.id, recipe]));

    const frequency = new Map<string, number>();
    for (const recipe of data.recipes) {
      const keys = shippedKeys(recipe);
      this._keys.set(recipe.id, keys);
      this._seasons.set(recipe.id, recipeSeason(recipe));
      for (const key of keys) frequency.set(key, (frequency.get(key) ?? 0) + 1);
      for (const ingredient of recipe.ingredients) {
        const key = ingredientKey(ingredient.name);
        if (!this._labels.has(key)) this._labels.set(key, ingredient.name);
      }
    }
    const total = data.recipes.length;
    for (const [key, count] of frequency) this._rarity.set(key, Math.log((total + 1) / count));
  }

  public get(id: string): Recipe | null {
    return this._byId.get(id) ?? null;
  }

  public has(id: string): boolean {
    return this._byId.has(id);
  }

  /** Season read from the fresh produce; `null` for a dish that works all year. */
  public seasonOf(recipe: Recipe): Season | null {
    return this._seasons.get(recipe.id) ?? null;
  }

  public keysOf(recipe: Recipe): Set<string> {
    return this._keys.get(recipe.id) ?? shippedKeys(recipe);
  }

  public rarity(key: string): number {
    return this._rarity.get(key) ?? 0;
  }

  /** A readable ingredient name for a key. */
  public labelFor(key: string): string {
    return this._labels.get(key) ?? key;
  }

  /** Recipes that reuse the most (and the rarest) of these ingredients. */
  public related(baseKeys: Set<string>, exclude: (recipe: Recipe) => boolean, limit: number): Overlap[] {
    return this.recipes
      .filter((recipe) => !exclude(recipe))
      .map((recipe) => this._overlap(baseKeys, recipe))
      .filter((overlap) => overlap.shared.length && overlap.score > MIN_SCORE)
      .sort((a, b) => b.score - a.score || a.extra.length - b.extra.length)
      .slice(0, limit);
  }

  private _overlap(baseKeys: Set<string>, recipe: Recipe): Overlap {
    const keys = [...this.keysOf(recipe)];
    const shared = keys.filter((key) => baseKeys.has(key));
    const extra = keys.filter((key) => !baseKeys.has(key));
    const score = shared.reduce((sum, key) => sum + this.rarity(key), 0) + SHARED_BONUS * shared.length;
    return { recipe, shared, extra, score };
  }

}
