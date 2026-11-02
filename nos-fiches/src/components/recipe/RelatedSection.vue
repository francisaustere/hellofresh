<template>
  <section class="RelatedSection grid gap-3.5 pt-10">
    <h2 class="text-[26px]">{{ t("related.title") }}</h2>
    <p class="max-w-[62ch] text-muted">{{ t("related.intro") }}</p>
    <div class="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
      <span class="inline-flex items-center gap-2">
        <IngredientTag>{{ t("related.legendRareExample") }}</IngredientTag>{{ t("related.legendRare") }}
      </span>
      <span class="inline-flex items-center gap-2">
        <IngredientTag is-minor>{{ t("related.legendCommonExample") }}</IngredientTag>{{ t("related.legendCommon") }}
      </span>
    </div>
    <div
      v-if="overlaps.length"
      class="RelatedSection__List grid gap-3">
      <RelatedCard
        v-for="overlap in overlaps"
        :key="overlap.recipe.id"
        :overlap="overlap" />
    </div>
    <p v-else>{{ t("related.none") }}</p>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import RelatedCard from "@/components/ui/RelatedCard.vue";
import IngredientTag from "@/components/ui/IngredientTag.vue";
import type { Overlap } from "@/engine/RecipeCatalog";

defineProps<{ overlaps: Overlap[] }>();

const { t } = useI18n();
</script>

<style scoped>
.RelatedSection__List {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
}
</style>
