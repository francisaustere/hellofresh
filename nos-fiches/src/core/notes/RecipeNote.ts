import { z } from "zod";

/** What the parents keep about one recipe. One document per recipe id. */
export const RecipeNoteSchema = z.object({
  comment: z.string().optional(),
  hidden: z.boolean().optional(),
  // Loose on purpose: a note that fails to parse is dropped whole, comment included.
  // "Note perso": the parents' own stars, 1 to 5. 0 or missing: the card shows the stars drawn from the orders.
  rating: z.number().optional(),
  // "Reproduite": how many times they cooked it at home. Weighs in the "Les plus réalisées" order, never in the stars.
  cooked: z.number().optional(),
  updatedAt: z.string(),
});

export type RecipeNote = z.infer<typeof RecipeNoteSchema>;
export type RecipeNotePatch = Partial<Omit<RecipeNote, "updatedAt">>;
export type NotesMap = Record<string, RecipeNote>;
