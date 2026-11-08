<template>
  <span class="OrderLine inline-flex flex-wrap items-center gap-x-2.5">
    <span
      class="OrderLine__Stars text-sm tracking-[1px] text-hi"
      :aria-label="starsLabel">{{ starsText }}</span>
    <span class="flex flex-wrap gap-x-1.5 text-[13px] text-muted">
      <span>{{ t("orders.count", { count: recipe.orders.count }, recipe.orders.count) }}</span>
      <template v-if="cooked">
        <span aria-hidden="true">{{ t("common.separator") }}</span>
        <span>{{ t("orders.cooked", { count: cooked }, cooked) }}</span>
      </template>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNotes } from "@/composables/useNotes";
import { MAX_STARS, shownStars } from "@/engine/orders.utils";
import type { Recipe } from "@/engine/recipe.schema";

// Read-only summary; the stars and the counter are changed on the recipe page (NotePanel).
const props = defineProps<{ recipe: Recipe }>();

const { t } = useI18n();
const { noteOf } = useNotes();

const rating = computed(() => noteOf(props.recipe.id).rating);
const cooked = computed(() => noteOf(props.recipe.id).cooked ?? 0);
const stars = computed(() => shownStars(props.recipe, rating.value));
const starsText = computed(() => t("orders.starOn").repeat(stars.value) + t("orders.starOff").repeat(MAX_STARS - stars.value));
const starsLabel = computed(() => (rating.value
  ? t("orders.starsPersonal", { stars: stars.value })
  : t("orders.starsLabel", { stars: stars.value })));
</script>
