import type { NotesMap, RecipeNote } from "@/core/notes/RecipeNote";

/**
 * Storage for the recipe notes. The app only talks to this contract, so the backend
 * (browser storage today, a shared database later) can change without touching the UI.
 * See docs/database.md.
 */
export interface NotesRepository {
  /** True when notes are shared across the parents' devices, false when they stay in this browser. */
  readonly isShared: boolean;

  /** Calls onChange with the full map now and on every later change. Returns an unsubscribe function. */
  subscribe(onChange: (notes: NotesMap) => void, onError: (error: Error) => void): () => void;

  /** Replaces the note of one recipe. */
  save(recipeId: string, note: RecipeNote): Promise<void>;
}
