<template>
  <span
    class="HeartBadge inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-2 text-[13px] font-semibold"
    :class="`HeartBadge--${level}`">
    {{ t(`heart.level.${level}`) }}
  </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { HeartLevel } from "@/engine/recipe.schema";

defineProps<{ level: HeartLevel }>();

const { t } = useI18n();
</script>

<style scoped>
.HeartBadge::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
}

.HeartBadge--green { background: var(--ok-soft); color: var(--ok); }
.HeartBadge--orange { background: var(--warn-soft); color: var(--warn); }
.HeartBadge--red { background: var(--bad-soft); color: var(--bad); }
</style>
