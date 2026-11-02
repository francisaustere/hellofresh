<template>
  <div
    ref="root"
    class="SpriteImage bg-chip bg-no-repeat"
    :style="style"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"></div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import type { SpriteCell } from "@/engine/recipe.schema";
import { imageUrl } from "@/utils/asset.utils";

// Photos are packed in sprite sheets; each one is a cell. The sheet loads only near the viewport.
const LAZY_MARGIN = "600px";

const props = defineProps<{ cell?: SpriteCell | null, label?: string }>();

const root = useTemplateRef<HTMLElement>("root");
const isNear = ref(false);

const { stop } = useIntersectionObserver(root, ([entry]) => {
  if (!entry?.isIntersecting) return;
  isNear.value = true;
  stop();
}, { rootMargin: LAZY_MARGIN });

const style = computed(() => {
  if (!props.cell) return {};
  const [file, columns, rows, column, row] = props.cell;
  const x = columns > 1 ? column / (columns - 1) * 100 : 0;
  const y = rows > 1 ? row / (rows - 1) * 100 : 0;
  return {
    backgroundSize: `${columns * 100}% ${rows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundImage: isNear.value ? `url(${imageUrl(file)})` : undefined,
  };
});
</script>
