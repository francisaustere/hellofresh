<template>
  <div
    v-if="toast"
    :key="toast.id"
    class="ToastMessage fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-3.5 rounded-full bg-ink py-2.5 pr-2.5 pl-[18px] text-bg shadow-card"
    role="status">
    <span>{{ toast.text }}</span>
    <button
      v-if="toast.undo"
      type="button"
      class="rounded-full bg-hi px-3 py-1.5 font-bold text-hi-on"
      @click="undo">
      {{ t("toast.undo") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { toast, hideToast } = useToast();

function undo(): void {
  toast.value?.undo?.();
  hideToast();
}
</script>

<style scoped>
.ToastMessage {
  bottom: calc(var(--safe-bottom) + 20px);
  max-width: calc(100% - 32px);
}
</style>
