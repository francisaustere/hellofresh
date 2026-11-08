<template>
  <div
    class="RatingStars grid gap-0.5"
    role="group"
    :aria-label="t('rating.label')">
    <div class="flex flex-wrap items-center gap-x-2">
      <span class="text-[15px] font-semibold">{{ t("rating.label") }}</span>
      <span class="flex">
        <button
          v-for="star in MAX_STARS"
          :key="star"
          type="button"
          class="grid size-10 place-items-center rounded-full text-2xl leading-none text-hi hover:bg-surface"
          :aria-label="isPersonal && star === stars ? t('rating.clear') : t('rating.star', { count: star }, star)"
          :aria-pressed="isPersonal && star <= stars"
          @click="rate(star)">{{ star <= stars ? t("orders.starOn") : t("orders.starOff") }}</button>
      </span>
    </div>
    <span
      v-if="!isPersonal"
      class="text-[13px] text-muted">{{ t("rating.fromOrders") }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNotes } from "@/composables/useNotes";
import { MAX_STARS, shownStars } from "@/engine/orders.utils";
import type { Recipe } from "@/engine/recipe.schema";

const props = defineProps<{ recipe: Recipe }>();

const { t } = useI18n();
const { noteOf, saveNote } = useNotes();

const rating = computed(() => noteOf(props.recipe.id).rating);
const isPersonal = computed(() => !!rating.value);
const stars = computed(() => shownStars(props.recipe, rating.value));

// Tapping their own current star again goes back to the stars drawn from the orders (0 = no note perso).
function rate(star: number): void {
  saveNote(props.recipe.id, { rating: isPersonal.value && star === stars.value ? 0 : star });
}
</script>
