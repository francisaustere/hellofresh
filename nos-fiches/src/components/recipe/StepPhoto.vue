<template>
  <SpriteImage
    v-if="cell"
    class="aspect-[3/2] w-full rounded-xl"
    :cell="cell"
    :label="t('recipe.stepPhoto')" />
  <div v-else></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import type { Recipe, SpriteCell, Step } from "@/engine/recipe.schema";

const props = defineProps<{ recipe: Recipe, step: Step }>();

const { t } = useI18n();

// Step photos of a recipe share one row of a sheet; the step index is the column.
const cell = computed<SpriteCell | null>(() => {
  if (props.step.sprite == null || !props.recipe.stepSheet) return null;
  const [file, columns, rows, row] = props.recipe.stepSheet;
  return [file, columns, rows, props.step.sprite, row];
});
</script>
