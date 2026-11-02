<template>
  <span class="OrderLine inline-flex flex-wrap items-center gap-x-2.5">
    <span
      class="OrderLine__Stars text-sm tracking-[1px] text-hi"
      :aria-label="t('orders.starsLabel', { stars })">{{ starsText }}</span>
    <span class="text-[13px] text-muted">{{ t("orders.count", { count }, count) }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const MAX_STARS = 5;

const props = defineProps<{ stars: number, count: number }>();

const { t } = useI18n();

const starsText = computed(() => t("orders.starOn").repeat(props.stars) + t("orders.starOff").repeat(MAX_STARS - props.stars));
</script>
