<template>
  <div class="CookedCounter flex flex-wrap items-center gap-2 text-[15px] tabular-nums">
    {{ t("note.cooked", { count: cooked }, cooked) }}
    <span class="flex gap-1.5">
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full border-[1.5px] border-line bg-surface text-lg font-bold disabled:opacity-40"
        :aria-label="t('orders.cookedLess')"
        :disabled="cooked === 0"
        @click="addCooked(recipeId, -1)">{{ t("common.minusGlyph") }}</button>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full border-[1.5px] border-line bg-surface text-lg font-bold"
        :aria-label="t('orders.cookedMore')"
        @click="addCooked(recipeId, 1)">{{ t("common.plusGlyph") }}</button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNotes } from "@/composables/useNotes";

const props = defineProps<{ recipeId: string }>();

const { t } = useI18n();
const { noteOf, addCooked } = useNotes();

const cooked = computed(() => noteOf(props.recipeId).cooked ?? 0);
</script>
