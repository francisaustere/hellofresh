import type { NotesRepository } from "@/core/notes/NotesRepository";
import { RecipeNoteSchema, type NotesMap, type RecipeNote } from "@/core/notes/RecipeNote";

const STORAGE_KEY = "notes";

// Written by the Aider version papa ran in early November 2026: stars and counters are imported once, the rest dropped.
const LEGACY_FIELDS = { "recipe-star-overrides": "rating", "recipe-cooked-overrides": "cooked" } as const;
const LEGACY_LEFTOVERS = ["last-opened-recipe-id", "seasonIndex", "gallery-sort-criteria"];

/** Notes kept in this browser's localStorage. Syncs between tabs, not between devices. */
export default class LocalNotesRepository implements NotesRepository {

  readonly isShared = false;

  public subscribe(onChange: (notes: NotesMap) => void, _onError: (error: Error) => void): () => void {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === STORAGE_KEY) onChange(this._read());
    };
    window.addEventListener("storage", onStorage);
    this._importLegacy();
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

  private _importLegacy(): void {
    const notes = this._read();
    let isChanged = false;
    for (const [key, field] of Object.entries(LEGACY_FIELDS)) {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        const values: unknown = JSON.parse(raw);
        for (const [id, value] of Object.entries(values ?? {})) {
          // 0 meant "cleared" in that version
          if (typeof value !== "number" || value <= 0 || notes[id]?.[field] !== undefined) continue;
          notes[id] = { ...notes[id], [field]: value, updatedAt: new Date().toISOString() };
          isChanged = true;
        }
      } catch (error) {
        console.warn(`[LocalNotesRepository] unreadable ${key}, skipped`, error);
      }
    }
    try {
      if (isChanged) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      for (const key of [...Object.keys(LEGACY_FIELDS), ...LEGACY_LEFTOVERS]) localStorage.removeItem(key);
    } catch (error) {
      console.error("[LocalNotesRepository] legacy import failed", error);
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
