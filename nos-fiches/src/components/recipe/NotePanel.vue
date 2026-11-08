<template>
  <div class="NotePanel mt-4 mb-7 grid gap-2.5 rounded-card bg-chip p-3.5">
    <RatingStars :recipe="recipe" />
    <CookedCounter :recipe-id="recipe.id" />
    <label
      class="Label mt-2"
      :for="fieldId">{{ t("note.label") }}</label>
    <textarea
      :id="fieldId"
      v-model="draft"
      class="NotePanel__Field min-h-16 w-full resize-y rounded-[10px] border-[1.5px] border-line bg-surface px-2.5 py-2 text-[15px]"
      :placeholder="t('note.placeholder')"
      @focus="isEditing = true"
      @blur="onBlur"></textarea>
    <span class="text-[13px] text-muted">
      {{ isShared ? t("note.shared") : t("note.localOnly") }}
    </span>
    <button
      type="button"
      class="justify-self-start py-1 text-sm text-muted underline"
      @click="emit('hide')">
      {{ t("note.hide") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useDebounceFn } from "@vueuse/core";
import RatingStars from "@/components/ui/RatingStars.vue";
import CookedCounter from "@/components/ui/CookedCounter.vue";
import { useNotes } from "@/composables/useNotes";
import type { Recipe } from "@/engine/recipe.schema";

// "Notre avis": note perso, "reproduite" counter, and the comment.
// The comment is saved after a pause in typing, on blur, and when leaving the recipe.
const SAVE_DELAY_MS = 800;

const props = defineProps<{ recipe: Recipe }>();
const emit = defineEmits<{ hide: [] }>();

const { t } = useI18n();
const { noteOf, saveNote, isShared } = useNotes();

const recipeId = computed(() => props.recipe.id);
const fieldId = computed(() => `note-${recipeId.value}`);
const savedComment = computed(() => noteOf(recipeId.value).comment ?? "");
const draft = ref(savedComment.value);
const isEditing = ref(false);

// Follow changes from another device, unless the field is being edited here.
watch(savedComment, (comment) => {
  if (!isEditing.value) draft.value = comment;
});

const saveLater = useDebounceFn(save, SAVE_DELAY_MS);

watch(draft, () => {
  if (isEditing.value) void saveLater();
});

function save(): void {
  const comment = draft.value.trim();
  if (comment !== savedComment.value) saveNote(recipeId.value, { comment });
}

function onBlur(): void {
  isEditing.value = false;
  save();
}

onBeforeUnmount(save);
</script>

<style scoped>
.NotePanel__Field:focus {
  border-color: var(--accent);
  outline: none;
}
</style>
