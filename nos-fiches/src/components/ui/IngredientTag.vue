<template>
  <span
    class="IngredientTag rounded-full px-2 py-0.5 text-xs"
    :class="isMinor ? 'bg-chip text-muted' : 'bg-hi-soft text-hi-ink'">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ isMinor?: boolean }>();
</script>
