<template>
  <aside class="IngredientPanel min-w-0 rounded-card bg-surface p-[18px] shadow-card">
    <div class="mb-3 flex items-center justify-between gap-2">
      <h2 class="text-xl">{{ t("recipe.ingredients") }}</h2>
      <ServingsPicker
        v-model="servings"
        :options="options" />
    </div>

    <div class="Label mb-1">{{ t("recipe.inBox", { count: currentServings }) }}</div>
    <IngredientRows
      :recipe="recipe"
      :ingredients="shipped"
      :servings="currentServings"
      :shared-keys="sharedKeys" />

    <template v-if="pantry.length">
      <div class="Label mb-1">{{ t("recipe.pantry") }}</div>
      <IngredientRows
        :recipe="recipe"
        :ingredients="pantry"
        :servings="currentServings" />
    </template>

    <div
      v-if="recipe.utensils.length"
      class="text-sm text-muted">
      <b>{{ t("recipe.utensils") }}</b> {{ recipe.utensils.join(", ") }}
    </div>
    <div
      v-if="recipe.allergens.length"
      class="mt-2 text-[13px] text-muted">
      {{ t("recipe.allergens", { list: recipe.allergens.map((allergen) => allergen.trim()).join(", ") }) }}
    </div>
    <p
      v-if="sharedKeys.size"
      class="mt-2.5 text-sm text-muted">{{ t("recipe.sharedHint") }}</p>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ServingsPicker from "@/components/ui/ServingsPicker.vue";
import IngredientRows from "@/components/recipe/IngredientRows.vue";
import { usePreferences } from "@/composables/usePreferences";
import type { Recipe } from "@/engine/recipe.schema";
import { resolveServings, servingOptions } from "@/engine/quantity.utils";

const props = defineProps<{ recipe: Recipe, sharedKeys: Set<string> }>();

const { t } = useI18n();
const { servings } = usePreferences();

const options = computed(() => servingOptions(props.recipe));
const currentServings = computed(() => resolveServings(props.recipe, servings.value));
const shipped = computed(() => props.recipe.ingredients.filter((ingredient) => ingredient.shipped));
const pantry = computed(() => props.recipe.ingredients.filter((ingredient) => !ingredient.shipped));
</script>

<style scoped>
@media (min-width: 861px) {
  .IngredientPanel {
    position: sticky;
    top: calc(var(--safe-top) + 80px);
    max-height: calc(100vh - 100px);
    overflow: auto;
  }
}
</style>
