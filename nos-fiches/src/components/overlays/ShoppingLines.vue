<template>
  <ul class="ShoppingLines">
    <li
      v-for="line in lines"
      :key="line.key">
      <label class="ShoppingLines__Line grid cursor-pointer grid-cols-[24px_36px_1fr_auto] items-center gap-2.5 border-b border-line py-[7px]">
        <input
          type="checkbox"
          class="size-5 accent-accent"
          :checked="checked[line.key] ?? false"
          @change="setChecked(line.key, ($event.target as HTMLInputElement).checked)">
        <IngredientIcon
          :ingredient-id="line.ingredientId"
          :size="36" />
        <span class="ShoppingLines__Text">
          {{ line.name }}
          <span
            v-if="line.recipeCount > 1"
            class="block text-xs text-muted">{{ t("cart.inRecipes", { count: line.recipeCount }) }}</span>
        </span>
        <span class="ShoppingLines__Text text-right text-sm font-bold tabular-nums">{{ line.quantity }}</span>
      </label>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import IngredientIcon from "@/components/ui/IngredientIcon.vue";
import { usePreferences } from "@/composables/usePreferences";
import type { ShoppingLine } from "@/engine/shopping.utils";

defineProps<{ lines: ShoppingLine[] }>();

const { t } = useI18n();
const { checked, setChecked } = usePreferences();
</script>

<style scoped>
.ShoppingLines__Line:has(input:checked) .ShoppingLines__Text {
  color: var(--muted);
  text-decoration: line-through;
}
</style>
