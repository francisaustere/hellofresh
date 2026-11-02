import { z } from "zod";

/** What the parents keep about one recipe. One document per recipe id. */
export const RecipeNoteSchema = z.object({
  comment: z.string().optional(),
  hidden: z.boolean().optional(),
  // Kept from the artifact version for imports; no longer shown.
  rating: z.number().optional(),
  updatedAt: z.string(),
});

export type RecipeNote = z.infer<typeof RecipeNoteSchema>;
export type RecipeNotePatch = Partial<Omit<RecipeNote, "updatedAt">>;
export type NotesMap = Record<string, RecipeNote>;
