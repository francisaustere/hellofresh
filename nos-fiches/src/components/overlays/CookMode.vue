<template>
  <div
    class="CookMode fixed inset-0 z-40 flex flex-col bg-bg"
    role="dialog"
    aria-modal="true"
    :aria-label="t('cook.label')">
    <div class="CookMode__Row flex items-center justify-between gap-3">
      <span class="min-w-0 truncate font-semibold">{{ recipe.name }}</span>
      <button
        type="button"
        class="Close"
        :aria-label="t('cook.close')"
        @click="close">{{ t("common.closeGlyph") }}</button>
    </div>

    <div class="CookMode__Row my-3 flex gap-1.5">
      <i
        v-for="(_, index) in recipe.steps"
        :key="index"
        class="h-1 flex-1 rounded"
        :class="index <= stepIndex ? 'bg-accent' : 'bg-line'"></i>
    </div>

    <div
      :key="stepIndex"
      class="CookMode__Row CookMode__Body grid flex-1 content-start gap-[18px] overflow-auto">
      <StepPhoto
        v-if="step"
        class="CookMode__Photo justify-self-center"
        :recipe="recipe"
        :step="step" />
      <h2 class="text-[30px]">{{ t("cook.step", { number: stepIndex + 1, total: recipe.steps.length }) }}</h2>
      <ul class="grid gap-2.5 text-[19px] leading-[1.45]">
        <li
          v-for="(item, index) in step?.items"
          :key="index">
          <label class="CookMode__Item grid cursor-pointer grid-cols-[26px_1fr] items-start gap-2.5">
            <input
              type="checkbox"
              class="mt-[3px] size-[22px] accent-accent">
            <span>{{ item }}</span>
          </label>
        </li>
      </ul>
      <div
        v-for="(tip, index) in step?.tips"
        :key="index"
        class="Tip">{{ tip }}</div>
    </div>

    <div class="CookMode__Row mt-3 flex gap-2.5">
      <button
        type="button"
        class="Btn Btn--ghost CookMode__Nav"
        :disabled="stepIndex === 0"
        @click="goTo(stepIndex - 1)">
        {{ t("cook.previous") }}
      </button>
      <button
        v-if="!isLast"
        type="button"
        class="Btn CookMode__Nav"
        @click="goTo(stepIndex + 1)">
        {{ t("cook.next") }}
      </button>
      <button
        v-else
        type="button"
        class="Btn CookMode__Nav"
        @click="close">
        {{ t("cook.done") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { onKeyStroke, useScrollLock, useWakeLock } from "@vueuse/core";
import { useSelector } from "@xstate/vue";
import StepPhoto from "@/components/recipe/StepPhoto.vue";
import { useAppActor } from "@/composables/useAppActor";
import type { Recipe } from "@/engine/recipe.schema";

const props = defineProps<{ recipe: Recipe }>();

const { t } = useI18n();
const app = useAppActor();
const stepIndex = useSelector(app, (snapshot) => snapshot.context.cookStep);
const wakeLock = useWakeLock();
const scrollLock = useScrollLock(document.body);

const step = computed(() => props.recipe.steps[stepIndex.value]);
const isLast = computed(() => stepIndex.value >= props.recipe.steps.length - 1);

function goTo(target: number): void {
  app.send({ type: "COOK_STEP", step: target });
}

function close(): void {
  app.send({ type: "CLOSE_COOK" });
}

onKeyStroke("ArrowRight", () => goTo(stepIndex.value + 1));
onKeyStroke("ArrowLeft", () => goTo(stepIndex.value - 1));
onKeyStroke("Escape", close);

onMounted(() => {
  scrollLock.value = true;
  // The screen stays on while cooking; not every browser allows it.
  if (wakeLock.isSupported.value) wakeLock.request("screen").catch((error: unknown) => console.warn("[CookMode] wake lock refused", error));
});

onBeforeUnmount(() => {
  scrollLock.value = false;
  if (wakeLock.isActive.value) void wakeLock.release();
});
</script>

<style scoped>
.CookMode {
  padding:
    calc(var(--safe-top) + 12px)
    var(--gutter-right)
    calc(var(--safe-bottom) + 12px)
    var(--gutter-left);
}

.CookMode__Row {
  width: 100%;
  max-width: 900px;
  margin-inline: auto;
}

.CookMode__Photo { width: min(100%, 63vh); }
.CookMode__Nav { flex: 1; justify-content: center; padding: 16px; font-size: 17px; }

.CookMode__Item input:checked + span {
  color: var(--muted);
  text-decoration: line-through;
}
</style>
