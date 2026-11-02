<template>
  <div
    class="ServingsPicker inline-flex rounded-full bg-chip p-[3px]"
    role="group"
    :aria-label="t('servings.label')">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      class="ServingsPicker__Option min-w-[34px] rounded-full px-2 py-[5px] font-semibold tabular-nums"
      :aria-pressed="option === model"
      :aria-label="t('servings.people', { count: option }, option)"
      @click="model = option">
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ options: number[] }>();

const model = defineModel<number>({ required: true });

const { t } = useI18n();
</script>

<style scoped>
.ServingsPicker__Option[aria-pressed="true"] {
  background: var(--surface);
  box-shadow: var(--shadow);
}
</style>
