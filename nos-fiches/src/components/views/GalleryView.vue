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
      <div class="flex flex-wrap items-center gap-2">
        <label class="Chip inline-flex items-center gap-1.5">
          <span class="text-muted">{{ t("gallery.seasonLabel") }}</span>
          <select
            class="cursor-pointer bg-transparent font-semibold"
            :value="season ?? ''"
            @change="app.send({ type: 'SET_SEASON', season: parseSeason(($event.target as HTMLSelectElement).value) })">
            <option
              v-for="option in seasonOptions"
              :key="option.id ?? 'all'"
              :value="option.id ?? ''">{{ option.label }}</option>
          </select>
        </label>
        <label class="Chip inline-flex items-center gap-1.5">
          <span class="text-muted">{{ t("gallery.sortLabel") }}</span>
          <select
            class="cursor-pointer bg-transparent font-semibold"
            :value="sort"
            @change="app.send({ type: 'SET_SORT', sort: parseSort(($event.target as HTMLSelectElement).value) })">
            <option
              v-for="option in SORTS"
              :key="option"
              :value="option">{{ t(`gallery.sort.${option}`) }}</option>
          </select>
        </label>
        <span class="ml-auto text-sm text-muted tabular-nums">
          {{ t("gallery.count", { count: results.length }, results.length) }}<template v-if="words.length">{{ t("gallery.forQuery", { query: query.trim() }) }}</template>
        </span>
      </div>
    </section>

    <section
      v-if="results.length"
      class="GalleryView__Grid grid gap-5 pt-4 pb-12">
      <RecipeCard
        v-for="result in results"
        :key="result.recipe.id"
        :recipe="result.recipe"
        :season="catalog.seasonOf(result.recipe)"
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
import { shownStars, timesMade } from "@/engine/orders.utils";
import type { Recipe } from "@/engine/recipe.schema";
import { matchRecipe } from "@/engine/search.utils";
import { SEASONS, currentSeason, parseSeason, seasonMessageKey, type Season } from "@/engine/season.utils";
import { splitWords } from "@/engine/text.utils";
import type { GallerySort } from "@/state/appMachine";

const FAVOURITE_STARS = 4;
const TOP_TAGS = 6;
const SORTS: GallerySort[] = ["made", "rated"];
// Data tags not worth a filter chip
const SKIPPED_TAGS = new Set(["Moins de CO2"]);

// Filters that are not data tags; `stars` are the ones shown on the card (note perso, or drawn from the orders).
type SpecialFilter = "favourites" | "heartFriendly" | "toAdjust";

const SPECIAL_FILTERS: Record<SpecialFilter, (recipe: Recipe, stars: number) => boolean> = {
  favourites: (_recipe, stars) => stars >= FAVOURITE_STARS,
  heartFriendly: (recipe) => recipe.heart.level === "green",
  toAdjust: (recipe) => recipe.heart.level !== "green",
};

const { t } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
const { isHidden, noteOf, saveNote } = useNotes();

const query = useSelector(app, (snapshot) => snapshot.context.query);
const tag = useSelector(app, (snapshot) => snapshot.context.tag);
const season = useSelector(app, (snapshot) => snapshot.context.season);
const sort = useSelector(app, (snapshot) => snapshot.context.sort);

const starsOf = (recipe: Recipe): number => shownStars(recipe, noteOf(recipe.id).rating);
const madeOf = (recipe: Recipe): number => timesMade(recipe, noteOf(recipe.id).cooked ?? 0);
const matchesSpecial = (filter: SpecialFilter, recipe: Recipe): boolean => SPECIAL_FILTERS[filter](recipe, starsOf(recipe));
const parseSort = (value: string): GallerySort => SORTS.find((option) => option === value) ?? "made";

const words = computed(() => splitWords(query.value));
const visible = computed(() => catalog.value.recipes.filter((recipe) => !isHidden(recipe.id)));
const removed = computed(() => catalog.value.recipes.filter((recipe) => isHidden(recipe.id)));

const topTags = computed(() => {
  const counts = new Map<string, number>();
  for (const recipe of visible.value) {
    for (const recipeTag of recipe.tags) {
      if (!SKIPPED_TAGS.has(recipeTag)) counts.set(recipeTag, (counts.get(recipeTag) ?? 0) + 1);
    }
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, TOP_TAGS).map(([name]) => name);
});

const filters = computed(() => {
  const favourites = visible.value.filter((recipe) => matchesSpecial("favourites", recipe)).length;
  const heartFriendly = visible.value.filter((recipe) => matchesSpecial("heartFriendly", recipe)).length;
  return [
    { id: null, label: t("gallery.filter.all") },
    { id: "favourites" satisfies SpecialFilter, label: t("gallery.filter.favourites", { count: favourites }) },
    { id: "heartFriendly" satisfies SpecialFilter, label: t("gallery.filter.heart", { count: heartFriendly }) },
    { id: "toAdjust" satisfies SpecialFilter, label: t("gallery.filter.adjust", { count: visible.value.length - heartFriendly }) },
    ...topTags.value.map((name) => ({ id: name, label: name })),
  ];
});

const now = currentSeason();
const seasonOptions = computed(() => [
  { id: null, label: t("season.all") },
  ...SEASONS.map((id: Season) => ({
    id,
    label: id === now ? t("season.now", { season: t(seasonMessageKey(id)) }) : t(seasonMessageKey(id)),
  })),
]);

// Recipes arrive most ordered first, then most recent; sorting is stable, so that order breaks ties.
// Notes are edited on the recipe page, so the gallery never reorders under the finger.
const results = computed(() => {
  const isTagMatch = (recipe: Recipe): boolean => {
    if (!tag.value) return true;
    return tag.value in SPECIAL_FILTERS ? matchesSpecial(tag.value as SpecialFilter, recipe) : recipe.tags.includes(tag.value);
  };
  const isSeasonMatch = (recipe: Recipe): boolean => !season.value || catalog.value.seasonOf(recipe) === season.value;
  const byMade = (a: Recipe, b: Recipe): number => madeOf(b) - madeOf(a);
  const byStars = (a: Recipe, b: Recipe): number => starsOf(b) - starsOf(a) || byMade(a, b);

  return visible.value
    .filter((recipe) => isTagMatch(recipe) && isSeasonMatch(recipe))
    .sort(sort.value === "rated" ? byStars : byMade)
    .map((recipe) => ({ recipe, ...matchRecipe(recipe, words.value) }))
    .filter((result) => result.isMatch);
});
</script>

<style scoped>
.GalleryView__Grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
}
</style>
