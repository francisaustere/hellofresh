import type { Recipe } from "@/engine/recipe.schema";
import { normalize } from "@/engine/text.utils";

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export type Season = typeof SEASONS[number];

// Fresh produce at its peak in France. `null` marks produce sold all year, listed so that a
// longer name wins over a shorter one ("pomme de terre" is not a "pomme").
const PRODUCE: Record<string, Season | null> = {
  "asperge": "spring",
  "petit pois": "spring",
  "radis": "spring",
  "oignon nouveau": "spring",
  "epinard": "spring",
  "rhubarbe": "spring",
  "tomate": "summer",
  "courgette": "summer",
  "aubergine": "summer",
  "poivron": "summer",
  "concombre": "summer",
  "melon": "summer",
  "nectarine": "summer",
  "peche": "summer",
  "abricot": "summer",
  "fraise": "summer",
  "framboise": "summer",
  "cerise": "summer",
  "fenouil": "summer",
  "mais": "summer",
  "haricot vert": "summer",
  "legumes d ete": "summer",
  "courge": "autumn",
  "butternut": "autumn",
  "potimarron": "autumn",
  "potiron": "autumn",
  "citrouille": "autumn",
  "patate douce": "autumn",
  "champignon": "autumn",
  "portobello": "autumn",
  "brocoli": "autumn",
  "broccolini": "autumn",
  "chou fleur": "autumn",
  "poire": "autumn",
  "pomme": "autumn",
  "raisin": "autumn",
  "figue": "autumn",
  "betterave": "autumn",
  "poireau": "winter",
  "chou": "winter",
  "endive": "winter",
  "navet": "winter",
  "panais": "winter",
  "celeri rave": "winter",
  "mache": "winter",
  "kiwi": "winter",
  "orange": "winter",
  "clementine": "winter",
  "mandarine": "winter",
  "pamplemousse": "winter",
  "grenade": "winter",
  "pomme de terre": null,
  "chair de tomate": null,
};

// Ingredients that are no longer fresh produce: tins, dried, sauces, spices, seeds…
const PROCESSED = /\b(conserve|boite|seche|seches|semi|concentre|concasse|concassees|chutney|confiture|pesto|creme de|sauce|graines|poudre|moulu|puree|dip|frits)\b/;

// Whole words, each one possibly plural ("pommes de terre"). Longest names first, so "chou fleur" wins over "chou".
const PRODUCE_PATTERNS = Object.keys(PRODUCE)
  .sort((a, b) => b.length - a.length)
  .map((name) => ({ name, pattern: new RegExp(`\\b${name.split(" ").join("[sx]? ")}[sx]?\\b`) }));

function produceSeason(ingredientName: string): Season | null {
  const name = normalize(ingredientName).replace(/-/g, " ");
  if (PROCESSED.test(name)) return null;
  const match = PRODUCE_PATTERNS.find(({ pattern }) => pattern.test(name));
  return match ? PRODUCE[match.name] ?? null : null;
}

/**
 * The season of a recipe, read from its fresh produce: the season most of them belong to.
 * `null` when nothing is seasonal or two seasons tie (the dish works all year).
 */
export function recipeSeason(recipe: Recipe): Season | null {
  const votes = new Map<Season, number>();
  for (const ingredient of recipe.ingredients) {
    const season = produceSeason(ingredient.name);
    if (season) votes.set(season, (votes.get(season) ?? 0) + 1);
  }
  const [first, second] = [...votes].sort((a, b) => b[1] - a[1]);
  if (!first || first[1] === second?.[1]) return null;
  return first[0];
}

/** A season from a form value; anything else (the empty "all seasons" option) reads `null`. */
export function parseSeason(value: string): Season | null {
  return SEASONS.find((season) => season === value) ?? null;
}

/** Key of the season's name in the locale file; `null` reads "Toutes saisons". */
export function seasonMessageKey(season: Season | null): string {
  return `season.${season ?? "all"}`;
}

/** Meteorological seasons: spring is March to May, and so on. */
export function currentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}
