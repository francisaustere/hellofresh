<template>
  <template
    v-for="(segment, index) in segments"
    :key="index">
    <mark v-if="segment.isMatch">{{ segment.text }}</mark>
    <template v-else>{{ segment.text }}</template>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { highlightSegments } from "@/engine/text.utils";

const props = defineProps<{ text: string, words: string[] }>();

const segments = computed(() => highlightSegments(props.text, props.words));
</script>
