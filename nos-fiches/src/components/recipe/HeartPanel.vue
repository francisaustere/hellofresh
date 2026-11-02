<template>
  <section
    class="HeartPanel grid gap-3 rounded-card bg-surface px-[18px] py-4 shadow-card"
    :class="`HeartPanel--${heart.level}`"
    :aria-label="t('heart.title')">
    <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <h2 class="text-xl">{{ t("heart.title") }}</h2>
      <HeartBadge :level="heart.level" />
    </div>
    <p>{{ heart.summary }}</p>
    <p
      v-if="heart.swaps.length && isGreen"
      class="text-sm text-muted">{{ t("heart.evenBetter") }}</p>
    <ul
      v-if="heart.swaps.length"
      class="grid gap-2.5">
      <li
        v-for="swap in heart.swaps"
        :key="swap.id"
        class="grid gap-0.5 border-l-[3px] border-line pl-3.5">
        <span><b>{{ swap.ingredient }}</b> {{ t("heart.swapTo", { to: swap.to }) }}</span>
        <small class="text-sm text-muted">{{ t("heart.why", { why: capitalize(swap.why) }) }}</small>
      </li>
    </ul>
    <p
      v-if="heart.goods.length && !isGreen"
      class="text-sm text-muted">
      {{ t("heart.alreadyGood", { list: heart.goods.join(", ") }) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import HeartBadge from "@/components/ui/HeartBadge.vue";
import type { Recipe } from "@/engine/recipe.schema";

const props = defineProps<{ heart: Recipe["heart"] }>();

const { t } = useI18n();

const isGreen = computed(() => props.heart.level === "green");

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
</script>

<style scoped>
.HeartPanel { border-top: 4px solid var(--level-colour); }
.HeartPanel--green { --level-colour: var(--ok); }
.HeartPanel--orange { --level-colour: var(--warn); }
.HeartPanel--red { --level-colour: var(--bad); }
</style>
