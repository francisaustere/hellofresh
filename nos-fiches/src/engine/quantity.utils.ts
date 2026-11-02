import type { Recipe } from "@/engine/recipe.schema";

// Unit keys as they appear in data.json
export const TO_TASTE_UNIT = "selon le goût";
const PIECE_UNIT = "pièce(s)";

export const DEFAULT_SERVINGS = 2;
export const MAX_SERVINGS = 4;

const ROUND_ABOVE = 20;
const FRACTION_TOLERANCE = 0.04;
const FRACTIONS: [number, string][] = [[0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.67, "⅔"], [0.75, "¾"]];
// Absorbs float error so 2.9999 counts as 3
const EPSILON = 1e-6;

export function formatAmount(amount: number | null): string {
  if (!amount) return "";
  if (amount >= ROUND_ABOVE) return String(Math.round(amount));

  const whole = Math.floor(amount + EPSILON);
  const rest = amount - whole;
  if (rest < FRACTION_TOLERANCE) return String(whole);

  const fraction = FRACTIONS.find(([value]) => Math.abs(rest - value) < FRACTION_TOLERANCE);
  if (fraction) return `${whole || ""}${fraction[1]}`;
  return amount.toFixed(1).replace(".", ",");
}

export function formatUnit(unit: string, amount: number | null): string {
  if (unit === TO_TASTE_UNIT) return unit;
  if (unit === PIECE_UNIT) return "";
  return unit.replace("(s)", (amount ?? 0) > 1 ? "s" : "");
}

export function formatQuantity(amount: number | null, unit: string): string {
  return [formatAmount(amount), formatUnit(unit, amount)].filter(Boolean).join(" ");
}

/** Servings this recipe has amounts for, up to four people. */
export function servingOptions(recipe: Recipe): number[] {
  return Object.keys(recipe.yields)
    .map(Number)
    .filter((servings) => servings <= MAX_SERVINGS)
    .sort((a, b) => a - b);
}

/** Closest available servings: the wanted one, else the default, else the smallest. */
export function resolveServings(recipe: Recipe, wanted: number): number {
  const options = servingOptions(recipe);
  if (options.includes(wanted)) return wanted;
  if (options.includes(DEFAULT_SERVINGS)) return DEFAULT_SERVINGS;
  return options[0] ?? wanted;
}

/** Amount and unit of one ingredient, or null when the recipe gives none. */
export function ingredientAmount(recipe: Recipe, ingredientId: string, servings: number): [number | null, string] | null {
  const amounts = recipe.yields[String(servings)] ?? recipe.yields[String(DEFAULT_SERVINGS)] ?? Object.values(recipe.yields)[0];
  return amounts?.[ingredientId] ?? null;
}
