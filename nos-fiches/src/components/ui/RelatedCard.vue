<template>
  <button
    type="button"
    class="RelatedCard grid grid-cols-[96px_1fr] items-start gap-3 rounded-card bg-surface p-2.5 text-left shadow-card"
    @click="app.send({ type: 'OPEN_RECIPE', id: overlap.recipe.id })">
    <SpriteImage
      class="size-24 rounded-[10px]"
      :cell="overlap.recipe.thumb" />
    <div class="min-w-0">
      <h3 class="text-base leading-tight font-semibold">{{ overlap.recipe.name }}</h3>
      <div class="mt-1 mb-1.5 text-[13px] text-muted tabular-nums">
        {{ t("related.stat", { shared: overlap.shared.length, extra: overlap.extra.length }) }}
      </div>
      <div class="flex flex-wrap gap-1">
        <IngredientTag
          v-for="key in overlap.shared"
          :key="key"
          :is-minor="catalog.rarity(key) < RARE_THRESHOLD">
          {{ catalog.labelFor(key) }}
        </IngredientTag>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import IngredientTag from "@/components/ui/IngredientTag.vue";
import { useAppActor, useCatalog } from "@/composables/useAppActor";
import { RARE_THRESHOLD, type Overlap } from "@/engine/RecipeCatalog";

defineProps<{ overlap: Overlap }>();

const { t } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
</script>
