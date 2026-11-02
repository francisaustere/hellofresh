<template>
  <div class="GalleryView">
    <section class="grid gap-3.5 pt-7 pb-2">
      <h1 class="text-[clamp(30px,5vw,46px)] leading-[1.05] font-extrabold">
        {{ t("gallery.title", { count: visible.length }) }}
      </h1>
      <p class="max-w-[60ch] text-muted">{{ t("gallery.intro") }}</p>
      <div
        class="flex flex-wrap gap-2"
        role="group"
        :aria-label="t('gallery.filtersLabel')">
        <button
          v-for="filter in filters"
          :key="filter.id ?? 'all'"
          type="button"
          class="Chip"
          :aria-pressed="filter.id === tag"
          @click="app.send({ type: 'SET_TAG', tag: filter.id })">
          {{ filter.label }}
        </button>
      </div>
      <div class="text-sm text-muted tabular-nums">
        {{ t("gallery.count", { count: results.length }, results.length) }}
        <template v-if="words.length">{{ t("gallery.forQuery", { query: query.trim() }) }}</template>
      </div>
    </section>

    <section
      v-if="results.length"
      class="GalleryView__Grid grid gap-5 pt-4 pb-12">
      <RecipeCard
        v-for="result in results"
        :key="result.recipe.id"
        :recipe="result.recipe"
        :words="words"
        :matched-ingredients="result.ingredients" />
    </section>
    <p
      v-else
      class="py-12 text-muted">
      {{ words.length ? t("gallery.noMatch", { query: query.trim() }) : t("gallery.emptyFilter") }}
    </p>

    <details class="grid max-w-[70ch] gap-2 pt-2 pb-12 text-sm text-muted">
      <summary class="cursor-pointer font-semibold">{{ t("about.title") }}</summary>
      <p class="mt-2">{{ t("about.method") }}</p>
      <p class="mt-2">{{ t("about.disclaimer") }}</p>
    </details>

    <details
      v-if="removed.length"
      class="grid gap-2 pb-12">
      <summary class="cursor-pointer font-semibold text-muted">
        {{ t("gallery.removed", { count: removed.length }) }}
      </summary>
      <ul class="mt-2 grid gap-1.5">
        <li
          v-for="recipe in removed"
          :key="recipe.id"
          class="flex items-center justify-between gap-3 border-b border-line py-1.5">
          <span>{{ recipe.name }}</span>
          <button
            type="button"
            class="Btn Btn--ghost"
            @click="saveNote(recipe.id, { hidden: false })">
            {{ t("gallery.restore") }}
          </button>
        </li>
      </ul>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSelector } from "@xstate/vue";
import RecipeCard from "@/components/gallery/RecipeCard.vue";
import { useAppActor, useCatalog } from "@/composables/useAppActor";
import { useNotes } from "@/composables/useNotes";
import type { Recipe } from "@/engine/recipe.schema";
import { matchRecipe } from "@/engine/search.utils";
import { splitWords } from "@/engine/text.utils";

const FAVOURITE_STARS = 4;
const TOP_TAGS = 6;

// Filters that are not data tags
type SpecialFilter = "favourites" | "heartFriendly" | "toAdjust";

const SPECIAL_FILTERS: Record<SpecialFilter, (recipe: Recipe) => boolean> = {
  favourites: (recipe) => recipe.orders.stars >= FAVOURITE_STARS,
  heartFriendly: (recipe) => recipe.heart.level === "green",
  toAdjust: (recipe) => recipe.heart.level !== "green",
};

const { t } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
const { isHidden, saveNote } = useNotes();

const query = useSelector(app, (snapshot) => snapshot.context.query);
const tag = useSelector(app, (snapshot) => snapshot.context.tag);

const words = computed(() => splitWords(query.value));
const visible = computed(() => catalog.value.recipes.filter((recipe) => !isHidden(recipe.id)));
const removed = computed(() => catalog.value.recipes.filter((recipe) => isHidden(recipe.id)));

const topTags = computed(() => {
  const counts = new Map<string, number>();
  for (const recipe of visible.value) {
    for (const recipeTag of recipe.tags) counts.set(recipeTag, (counts.get(recipeTag) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, TOP_TAGS).map(([name]) => name);
});

const filters = computed(() => {
  const favourites = visible.value.filter(SPECIAL_FILTERS.favourites).length;
  const heartFriendly = visible.value.filter(SPECIAL_FILTERS.heartFriendly).length;
  return [
    { id: null, label: t("gallery.filter.all") },
    { id: "favourites" satisfies SpecialFilter, label: t("gallery.filter.favourites", { count: favourites }) },
    { id: "heartFriendly" satisfies SpecialFilter, label: t("gallery.filter.heart", { count: heartFriendly }) },
    { id: "toAdjust" satisfies SpecialFilter, label: t("gallery.filter.adjust", { count: visible.value.length - heartFriendly }) },
    ...topTags.value.map((name) => ({ id: name, label: name })),
  ];
});

// Recipes arrive sorted: most ordered first, then most recent.
const results = computed(() => {
  const isTagMatch = (recipe: Recipe): boolean => {
    if (!tag.value) return true;
    const special = SPECIAL_FILTERS[tag.value as SpecialFilter] as ((recipe: Recipe) => boolean) | undefined;
    return special ? special(recipe) : recipe.tags.includes(tag.value);
  };
  return visible.value
    .map((recipe) => ({ recipe, ...matchRecipe(recipe, words.value) }))
    .filter((result) => result.isMatch && isTagMatch(result.recipe));
});
</script>

<style scoped>
.GalleryView__Grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
}
</style>
