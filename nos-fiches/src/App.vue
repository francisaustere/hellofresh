<template>
  <AppHeader />

  <main class="Wrap">
    <p
      v-if="isLoading"
      class="py-12 text-muted">{{ t("app.loading") }}</p>
    <p
      v-else-if="hasFailed"
      class="py-12 text-muted">{{ t("app.failed") }}</p>
    <RecipeView
      v-else-if="recipe"
      :recipe="recipe" />
    <GalleryView v-else-if="isReady" />
  </main>

  <Teleport to="body">
    <Transition
      :css="false"
      @enter="onFadeEnter"
      @leave="onFadeLeave">
      <CookMode
        v-if="isCooking && recipe"
        :recipe="recipe" />
    </Transition>

    <Transition
      :css="false"
      @enter="onFadeEnter"
      @leave="onFadeLeave">
      <div
        v-if="isSheetOpen"
        class="fixed inset-0 z-[35] bg-black/35"
        @click="app.send({ type: 'CLOSE_SHEET' })"></div>
    </Transition>
    <Transition
      :css="false"
      @enter="onSlideEnter"
      @leave="onSlideLeave">
      <ShoppingSheet v-if="isSheetOpen" />
    </Transition>

    <ToastMessage />
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useSelector } from "@xstate/vue";
import AppHeader from "@/components/AppHeader.vue";
import GalleryView from "@/components/views/GalleryView.vue";
import RecipeView from "@/components/views/RecipeView.vue";
import CookMode from "@/components/overlays/CookMode.vue";
import ShoppingSheet from "@/components/overlays/ShoppingSheet.vue";
import ToastMessage from "@/components/ui/ToastMessage.vue";
import { useAppActor, useCurrentRecipe } from "@/composables/useAppActor";
import { useGSAP } from "@/composables/useGSAP";
import { useHashRoute } from "@/composables/useHashRoute";
import { usePreferences } from "@/composables/usePreferences";

const { t } = useI18n();
const app = useAppActor();
const gsap = useGSAP();
const { pruneCart } = usePreferences();
useHashRoute();

const isLoading = useSelector(app, (snapshot) => snapshot.matches("loading"));
const hasFailed = useSelector(app, (snapshot) => snapshot.matches("failed"));
const isReady = useSelector(app, (snapshot) => snapshot.matches("ready"));
const isCooking = useSelector(app, (snapshot) => snapshot.matches({ ready: { view: { recipe: "cooking" } } }));
const isSheetOpen = useSelector(app, (snapshot) => snapshot.matches({ ready: { sheet: "open" } }));
const catalog = useSelector(app, (snapshot) => snapshot.context.catalog);
const recipe = useCurrentRecipe();

// Recipes removed from the data since the last visit leave the basket
watch(catalog, (loaded) => {
  if (loaded) pruneCart((id) => loaded.has(id));
});

function onFadeEnter(element: Element, done: () => void): void {
  gsap.fromTo(element, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, onComplete: done });
}

// Leaving overlays stop catching clicks right away, not at the end of the fade.
function onFadeLeave(element: Element, done: () => void): void {
  (element as HTMLElement).style.pointerEvents = "none";
  gsap.to(element, { autoAlpha: 0, duration: 0.2, onComplete: done });
}

function onSlideEnter(element: Element, done: () => void): void {
  gsap.fromTo(element, { xPercent: 100 }, { xPercent: 0, onComplete: done });
}

function onSlideLeave(element: Element, done: () => void): void {
  gsap.to(element, { xPercent: 100, duration: 0.25, ease: "power2.in", onComplete: done });
}
</script>
