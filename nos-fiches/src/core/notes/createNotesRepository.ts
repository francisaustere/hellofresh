import type { NotesRepository } from "@/core/notes/NotesRepository";
import LocalNotesRepository from "@/core/notes/LocalNotesRepository";

/** Picks the notes backend from VITE_NOTES_BACKEND. */
export function createNotesRepository(): NotesRepository {
  const backend = import.meta.env.VITE_NOTES_BACKEND ?? "local";
  // TODO: "supabase" → SupabaseNotesRepository (docs/database.md, supabase/migrations/0001_recipe_notes.sql)
  if (backend !== "local") console.warn(`[createNotesRepository] backend "${backend}" not implemented, using local storage`);
  return new LocalNotesRepository();
}
