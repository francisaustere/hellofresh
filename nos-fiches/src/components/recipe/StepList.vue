<template>
  <section
    class="StepList grid gap-[18px]"
    :aria-label="t('recipe.steps')">
    <div
      v-for="(step, index) in recipe.steps"
      :key="index"
      class="StepList__Step grid items-start gap-[18px]">
      <StepPhoto
        :recipe="recipe"
        :step="step" />
      <div>
        <div class="mb-1 font-display text-[15px] font-extrabold text-accent">
          {{ t("recipe.step", { number: index + 1 }) }}
        </div>
        <ul class="grid list-disc gap-1.5 pl-[18px]">
          <li
            v-for="(item, itemIndex) in step.items"
            :key="itemIndex">{{ item }}</li>
        </ul>
        <div
          v-for="(tip, tipIndex) in step.tips"
          :key="tipIndex"
          class="Tip">{{ tip }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import StepPhoto from "@/components/recipe/StepPhoto.vue";
import type { Recipe } from "@/engine/recipe.schema";

defineProps<{ recipe: Recipe }>();

const { t } = useI18n();
</script>

<style scoped>
.StepList__Step { grid-template-columns: 240px 1fr; }

@media (max-width: 620px) {
  .StepList__Step { grid-template-columns: 1fr; }
}
</style>
