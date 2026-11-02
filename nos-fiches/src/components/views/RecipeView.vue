<template>
  <article class="RecipeView pt-4 pb-16">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 py-1.5 font-semibold text-muted"
      @click="app.send({ type: 'GO_HOME' })">
      {{ t("recipe.back") }}
    </button>

    <section class="RecipeView__Hero grid items-end gap-6 pt-3 pb-6">
      <SpriteImage
        class="aspect-[3/2] w-full rounded-card"
        :cell="recipe.hero"
        :label="recipe.name" />
      <div class="grid min-w-0 gap-4">
        <div>
          <div class="mb-1.5">
            <OrderLine
              :stars="recipe.orders.stars"
              :count="recipe.orders.count" />
          </div>
          <h1 class="text-[clamp(28px,4vw,44px)] leading-[1.05] font-extrabold">{{ recipe.name }}</h1>
          <div class="mt-1.5 text-lg text-muted">{{ recipe.headline }}</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="fact in facts"
            :key="fact.label"
            class="min-w-[84px] rounded-[10px] bg-chip px-3 py-2">
            <b class="block text-lg tabular-nums">{{ fact.value }}</b>
            <small class="text-xs text-muted">{{ fact.label }}</small>
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <button
            type="button"
            class="Btn"
            @click="app.send({ type: 'START_COOK' })">
            {{ t("recipe.cook") }}
          </button>
          <button
            type="button"
            class="Btn Btn--ghost"
            :class="{ 'Btn--on': isInCart(recipe.id) }"
            @click="toggleCart(recipe.id)">
            {{ isInCart(recipe.id) ? t("cart.inCart") : t("cart.add") }}
          </button>
          <a
            v-if="recipe.url"
            class="self-center text-sm text-muted"
            :href="recipe.url"
            target="_blank"
            rel="noopener">{{ t("recipe.external") }}</a>
          <span
            v-else
            class="self-center text-sm text-muted">{{ recipe.source ?? t("recipe.paper") }}</span>
        </div>
      </div>
    </section>

    <HeartPanel :heart="recipe.heart" />

    <NotePanel
      :key="recipe.id"
      :recipe-id="recipe.id"
      @hide="hideRecipe" />

    <div class="RecipeView__Columns grid items-start gap-8">
      <IngredientPanel
        :recipe="recipe"
        :shared-keys="sharedKeys" />
      <StepList :recipe="recipe" />
    </div>

    <RelatedSection :overlaps="related" />
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import OrderLine from "@/components/ui/OrderLine.vue";
import HeartPanel from "@/components/recipe/HeartPanel.vue";
import NotePanel from "@/components/recipe/NotePanel.vue";
import IngredientPanel from "@/components/recipe/IngredientPanel.vue";
import StepList from "@/components/recipe/StepList.vue";
import RelatedSection from "@/components/recipe/RelatedSection.vue";
import { useAppActor, useCatalog } from "@/composables/useAppActor";
import { useNotes } from "@/composables/useNotes";
import { usePreferences } from "@/composables/usePreferences";
import { useToast } from "@/composables/useToast";
import type { Recipe } from "@/engine/recipe.schema";

const RELATED_LIMIT = 6;

const props = defineProps<{ recipe: Recipe }>();

const { t } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
const { isHidden, saveNote } = useNotes();
const { isInCart, toggleCart, removeFromCart } = usePreferences();
const { showToast } = useToast();

const facts = computed(() => {
  const { totalTime, prepTime, difficulty, kcal } = props.recipe;
  const list: { value: string, label: string }[] = [];
  if (totalTime) list.push({ value: t("units.minutes", { count: totalTime }), label: t("recipe.fact.total") });
  if (prepTime) list.push({ value: t("units.minutes", { count: prepTime }), label: t("recipe.fact.prep") });
  if (difficulty) list.push({ value: t(`recipe.difficulty.${difficulty}`), label: t("recipe.fact.difficulty") });
  if (kcal) list.push({ value: String(kcal), label: t("recipe.fact.kcal") });
  return list;
});

const related = computed(() => catalog.value.related(
  catalog.value.keysOf(props.recipe),
  (recipe) => recipe.id === props.recipe.id || isHidden(recipe.id),
  RELATED_LIMIT,
));
const sharedKeys = computed(() => new Set(related.value.flatMap((overlap) => overlap.shared)));

function hideRecipe(): void {
  const id = props.recipe.id;
  saveNote(id, { hidden: true });
  removeFromCart(id);
  showToast(t("note.hidden"), () => saveNote(id, { hidden: false }));
  app.send({ type: "GO_HOME" });
}
</script>

<style scoped>
.RecipeView__Hero { grid-template-columns: 1.1fr 1fr; }
.RecipeView__Columns { grid-template-columns: minmax(260px, 340px) 1fr; }

@media (max-width: 860px) {
  .RecipeView__Columns { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .RecipeView__Hero { grid-template-columns: 1fr; }
}
</style>
