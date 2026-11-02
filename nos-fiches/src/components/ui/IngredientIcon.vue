<template>
  <span
    class="IngredientIcon block flex-none rounded-[10px] bg-chip bg-no-repeat"
    :style="style"
    aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCatalog } from "@/composables/useAppActor";
import { imageUrl } from "@/utils/asset.utils";

const ICON_SHEET = imageUrl("ingredients.webp");

const props = withDefaults(defineProps<{ ingredientId: string, size?: number }>(), { size: 40 });

const catalog = useCatalog();

const style = computed(() => {
  const box = { width: `${props.size}px`, height: `${props.size}px` };
  const index = catalog.value.icons.index[props.ingredientId];
  if (index == null) return box;
  const { cols } = catalog.value.icons;
  const x = (index % cols) * props.size;
  const y = Math.floor(index / cols) * props.size;
  return {
    ...box,
    backgroundImage: `url(${ICON_SHEET})`,
    backgroundSize: `${cols * props.size}px auto`,
    backgroundPosition: `-${x}px -${y}px`,
  };
});
</script>
