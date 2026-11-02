<template>
  <ul class="IngredientRows mb-3 grid">
    <li
      v-for="ingredient in ingredients"
      :key="ingredient.id"
      class="grid grid-cols-[40px_64px_1fr] items-center gap-2.5 border-b border-line py-1.5 last:border-b-0">
      <IngredientIcon :ingredient-id="ingredient.id" />
      <span class="text-sm font-bold tabular-nums">{{ quantityOf(ingredient.id) }}</span>
      <span class="min-w-0">
        <span
          :class="{ 'rounded-md bg-hi-soft px-1.5 py-px text-hi-ink': sharedKeys?.has(ingredientKey(ingredient.name)) }">
          {{ ingredient.name }}
        </span>
        <span
          v-if="swaps.get(ingredient.id)"
          class="block text-[13px] leading-tight text-warn">{{ t("heart.swapTo", { to: swaps.get(ingredient.id)!.to }) }}</span>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import IngredientIcon from "@/components/ui/IngredientIcon.vue";
import type { Ingredient, Recipe } from "@/engine/recipe.schema";
import { ingredientKey } from "@/engine/ingredient.utils";
import { formatQuantity, ingredientAmount, TO_TASTE_UNIT } from "@/engine/quantity.utils";

const props = defineProps<{
  recipe: Recipe,
  ingredients: Ingredient[],
  servings: number,
  sharedKeys?: Set<string>,
}>();

const { t } = useI18n();

const swaps = computed(() => new Map(props.recipe.heart.swaps.map((swap) => [swap.id, swap])));

function quantityOf(ingredientId: string): string {
  const amount = ingredientAmount(props.recipe, ingredientId, props.servings);
  if (!amount) return "";
  const [value, unit] = amount;
  if (unit === TO_TASTE_UNIT) return t("recipe.toTaste");
  return formatQuantity(value, unit);
}
</script>
