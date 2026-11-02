<template>
  <aside
    class="ShoppingSheet fixed inset-y-0 right-0 z-[36] flex w-full max-w-[440px] flex-col border-l border-line bg-bg"
    :aria-label="t('cart.label')">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-2xl">{{ t("cart.title") }}</h2>
      <button
        type="button"
        class="Close"
        :aria-label="t('cart.close')"
        @click="app.send({ type: 'CLOSE_SHEET' })">{{ t("common.closeGlyph") }}</button>
    </div>

    <div class="grid flex-1 content-start gap-[22px] overflow-auto pt-3.5">
      <template v-if="selected.length">
        <div>
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="Label">{{ t("cart.recipes", { count: selected.length }, selected.length) }}</span>
            <ServingsPicker
              v-model="servings"
              :options="ALL_SERVINGS" />
          </div>
          <ul class="grid gap-2">
            <li
              v-for="recipe in selected"
              :key="recipe.id"
              class="grid grid-cols-[48px_1fr_auto] items-center gap-2.5">
              <SpriteImage
                class="size-12 rounded-lg"
                :cell="recipe.thumb" />
              <button
                type="button"
                class="text-left leading-tight font-semibold"
                @click="app.send({ type: 'OPEN_RECIPE', id: recipe.id })">
                {{ recipe.name }}
              </button>
              <button
                type="button"
                class="text-[13px] text-muted underline"
                @click="removeFromCart(recipe.id)">
                {{ t("cart.remove") }}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div class="Label mb-1">{{ t("cart.toBuy", { count: list.buy.length }) }}</div>
          <ShoppingLines :lines="list.buy" />
        </div>

        <div v-if="list.pantry.length">
          <div class="Label mb-1">{{ t("cart.checkPantry") }}</div>
          <ShoppingLines :lines="list.pantry" />
        </div>

        <div
          v-if="suggestions.length"
          class="grid gap-2.5">
          <div class="Label">{{ t("cart.suggestions") }}</div>
          <RelatedCard
            v-for="overlap in suggestions"
            :key="overlap.recipe.id"
            :overlap="overlap" />
        </div>
      </template>
      <p
        v-else
        class="text-sm text-muted">{{ t("cart.empty") }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { onKeyStroke } from "@vueuse/core";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import ServingsPicker from "@/components/ui/ServingsPicker.vue";
import RelatedCard from "@/components/ui/RelatedCard.vue";
import ShoppingLines from "@/components/overlays/ShoppingLines.vue";
import { useAppActor, useCatalog } from "@/composables/useAppActor";
import { useNotes } from "@/composables/useNotes";
import { usePreferences } from "@/composables/usePreferences";
import type { Recipe } from "@/engine/recipe.schema";
import { MAX_SERVINGS } from "@/engine/quantity.utils";
import { buildShoppingList } from "@/engine/shopping.utils";

const ALL_SERVINGS = Array.from({ length: MAX_SERVINGS }, (_, index) => index + 1);
const SUGGESTION_LIMIT = 4;

const { t } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
const { isHidden } = useNotes();
const { cart, servings, removeFromCart } = usePreferences();

const selected = computed(() => cart.value
  .map((id) => catalog.value.get(id))
  .filter((recipe): recipe is Recipe => recipe !== null));

const list = computed(() => buildShoppingList(selected.value, servings.value));

// Recipes that reuse what is already in the basket
const suggestions = computed(() => {
  if (!selected.value.length) return [];
  const keys = new Set(selected.value.flatMap((recipe) => [...catalog.value.keysOf(recipe)]));
  return catalog.value.related(keys, (recipe) => cart.value.includes(recipe.id) || isHidden(recipe.id), SUGGESTION_LIMIT);
});

onKeyStroke("Escape", () => app.send({ type: "CLOSE_SHEET" }));
</script>

<style scoped>
.ShoppingSheet {
  padding:
    calc(var(--safe-top) + 16px)
    var(--gutter-right)
    calc(var(--safe-bottom) + 16px)
    16px;
}
</style>
