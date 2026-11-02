<template>
  <button
    type="button"
    class="RecipeCard relative flex flex-col overflow-hidden rounded-card bg-surface text-left shadow-card"
    @click="app.send({ type: 'OPEN_RECIPE', id: recipe.id })">
    <SpriteImage
      class="aspect-[4/3] w-full"
      :cell="recipe.thumb" />
    <span
      v-if="isInCart(recipe.id)"
      class="absolute top-2.5 left-2.5 rounded-full bg-hi px-2.5 py-[3px] text-xs font-bold text-hi-on">
      {{ t("cart.inCart") }}
    </span>
    <div class="grid flex-1 content-start gap-1.5 px-3.5 pt-3 pb-3.5">
      <OrderLine
        :stars="recipe.orders.stars"
        :count="recipe.orders.count" />
      <h3 class="text-lg leading-tight font-semibold">
        <HighlightText
          :text="recipe.name"
          :words="words" />
      </h3>
      <div class="text-sm leading-snug text-muted">
        <HighlightText
          :text="recipe.headline"
          :words="words" />
      </div>
      <div
        v-if="matchedIngredients.length"
        class="justify-self-start rounded-lg bg-hi-soft px-2 py-1 text-[13px] text-hi-ink">
        {{ t("gallery.contains", { list: matchedIngredients.slice(0, MAX_MATCHES).join(", ") }) }}
      </div>
      <div><HeartBadge :level="recipe.heart.level" /></div>
      <div
        v-if="comment"
        class="RecipeCard__Note text-[13px] text-muted italic">{{ comment }}</div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted tabular-nums">
        <span v-if="recipe.totalTime">{{ t("units.minutes", { count: recipe.totalTime }) }}</span>
        <span v-if="recipe.kcal">{{ t("units.kcal", { count: recipe.kcal }) }}</span>
        <span
          v-for="tag in recipe.tags.slice(0, MAX_TAGS)"
          :key="tag">{{ tag }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import OrderLine from "@/components/ui/OrderLine.vue";
import HeartBadge from "@/components/ui/HeartBadge.vue";
import HighlightText from "@/components/ui/HighlightText.vue";
import { useAppActor } from "@/composables/useAppActor";
import { useNotes } from "@/composables/useNotes";
import { usePreferences } from "@/composables/usePreferences";
import type { Recipe } from "@/engine/recipe.schema";

const MAX_MATCHES = 3;
const MAX_TAGS = 2;

const props = defineProps<{ recipe: Recipe, words: string[], matchedIngredients: string[] }>();

const { t } = useI18n();
const app = useAppActor();
const { noteOf } = useNotes();
const { isInCart } = usePreferences();

const comment = computed(() => noteOf(props.recipe.id).comment);
</script>

<style scoped>
.RecipeCard {
  transition: transform .18s ease;
}

.RecipeCard:hover {
  transform: translateY(-2px);
}

.RecipeCard__Note {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
