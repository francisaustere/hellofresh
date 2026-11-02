import { computed, shallowRef, type ComputedRef, type ShallowRef } from "vue";
import { createNotesRepository } from "@/core/notes/createNotesRepository";
import type { NotesMap, RecipeNote, RecipeNotePatch } from "@/core/notes/RecipeNote";
import { useToast } from "@/composables/useToast";
import { i18n } from "@/i18n";

const LOAD_TIMEOUT_MS = 10_000;

const repository = createNotesRepository();
const notes = shallowRef<NotesMap>({});
// One write at a time per recipe; local edits win over snapshots while they are in flight.
const pending = new Map<string, Promise<void>>();
let isStarted = false;

// The subscription lives as long as the app (single page, never torn down), so it is not stored for disposal.
function start(): void {
  if (isStarted) return;
  isStarted = true;

  const { showToast } = useToast();
  const { t } = i18n.global;
  const timeout = setTimeout(() => showToast(t("notes.slow")), LOAD_TIMEOUT_MS);
  repository.subscribe(
    (remote) => {
      clearTimeout(timeout);
      const next = { ...remote };
      for (const id of pending.keys()) {
        const local = notes.value[id];
        if (local) next[id] = local;
      }
      notes.value = next;
    },
    (error) => {
      clearTimeout(timeout);
      console.error("[useNotes] subscription failed", error);
      showToast(t("notes.unavailable"));
    },
  );
}

export type UseNotesReturn = {
  notes: ShallowRef<NotesMap>,
  isShared: ComputedRef<boolean>,
  noteOf: (id: string) => Partial<RecipeNote>,
  isHidden: (id: string) => boolean,
  saveNote: (id: string, patch: RecipeNotePatch) => void,
};

export function useNotes(): UseNotesReturn {
  start();
  const { showToast } = useToast();
  const { t } = i18n.global;

  const noteOf = (id: string): Partial<RecipeNote> => notes.value[id] ?? {};
  const isHidden = (id: string): boolean => !!notes.value[id]?.hidden;

  const saveNote = (id: string, patch: RecipeNotePatch): void => {
    const note: RecipeNote = { ...notes.value[id], ...patch, updatedAt: new Date().toISOString() };
    notes.value = { ...notes.value, [id]: note };

    const previous = pending.get(id) ?? Promise.resolve();
    const write = previous
      .then(() => repository.save(id, note))
      .catch((error: unknown) => {
        console.error("[useNotes] save failed", error);
        showToast(t("notes.saveFailed"));
      });
    pending.set(id, write);
    void write.finally(() => {
      if (pending.get(id) === write) pending.delete(id);
    });
  };

  return {
    notes,
    isShared: computed(() => repository.isShared),
    noteOf,
    isHidden,
    saveNote,
  };
}
