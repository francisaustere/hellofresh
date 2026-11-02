import type { NotesRepository } from "@/core/notes/NotesRepository";
import { RecipeNoteSchema, type NotesMap, type RecipeNote } from "@/core/notes/RecipeNote";

const STORAGE_KEY = "notes";

/** Notes kept in this browser's localStorage. Syncs between tabs, not between devices. */
export default class LocalNotesRepository implements NotesRepository {

  readonly isShared = false;

  public subscribe(onChange: (notes: NotesMap) => void, _onError: (error: Error) => void): () => void {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === STORAGE_KEY) onChange(this._read());
    };
    window.addEventListener("storage", onStorage);
    onChange(this._read());
    return () => window.removeEventListener("storage", onStorage);
  }

  public async save(recipeId: string, note: RecipeNote): Promise<void> {
    const notes = { ...this._read(), [recipeId]: note };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("[LocalNotesRepository] save failed", error);
      throw error;
    }
  }

  private _read(): NotesMap {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (!raw || typeof raw !== "object") return {};
      const notes: NotesMap = {};
      for (const [id, value] of Object.entries(raw)) {
        const parsed = RecipeNoteSchema.safeParse(value);
        if (parsed.success) notes[id] = parsed.data;
      }
      return notes;
    } catch (error) {
      console.warn("[LocalNotesRepository] unreadable notes, starting empty", error);
      return {};
    }
  }

}
