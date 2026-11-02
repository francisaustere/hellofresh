import { z } from "zod";

// Shape of public/data.json, produced by ../scripts/build-parents.mjs.

/** A photo inside a sprite sheet: [file, columns, rows, column, row]. */
export const SpriteCellSchema = z.tuple([z.string(), z.number(), z.number(), z.number(), z.number()]);

/** Step photos of one recipe share a row of a sheet: [file, columns, rows, row]; the step gives the column. */
export const StepSheetSchema = z.tuple([z.string(), z.number(), z.number(), z.number()]);

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  shipped: z.boolean(),
});

export const HeartLevelSchema = z.enum(["green", "orange", "red"]);

export const SwapSchema = z.object({
  id: z.string(),
  ingredient: z.string(),
  to: z.string(),
  why: z.string(),
});

export const StepSchema = z.object({
  items: z.array(z.string()),
  tips: z.array(z.string()),
  sprite: z.number().nullable().optional(),
});

/** Amount per ingredient id for a number of servings: [amount, unit]. */
export const YieldSchema = z.record(z.string(), z.tuple([z.number().nullable(), z.string()]));

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  headline: z.string(),
  url: z.string().nullable().optional(),
  source: z.string().optional(),
  totalTime: z.number().nullable().optional(),
  prepTime: z.number().nullable().optional(),
  difficulty: z.number().nullable().optional(),
  tags: z.array(z.string()),
  kcal: z.number().nullable().optional(),
  allergens: z.array(z.string()),
  utensils: z.array(z.string()),
  ingredients: z.array(IngredientSchema),
  yields: z.record(z.string(), YieldSchema),
  steps: z.array(StepSchema),
  orders: z.object({
    count: z.number(),
    stars: z.number(),
    last: z.string().nullable().optional(),
  }),
  heart: z.object({
    level: HeartLevelSchema,
    summary: z.string(),
    goods: z.array(z.string()),
    swaps: z.array(SwapSchema),
  }),
  stepSheet: StepSheetSchema.nullable().optional(),
  thumb: SpriteCellSchema.nullable().optional(),
  hero: SpriteCellSchema.nullable().optional(),
});

export const RecipeDataSchema = z.object({
  icons: z.object({
    index: z.record(z.string(), z.number()),
    size: z.number(),
    cols: z.number(),
  }),
  recipes: z.array(RecipeSchema),
});

export type SpriteCell = z.infer<typeof SpriteCellSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type HeartLevel = z.infer<typeof HeartLevelSchema>;
export type Swap = z.infer<typeof SwapSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeData = z.infer<typeof RecipeDataSchema>;
