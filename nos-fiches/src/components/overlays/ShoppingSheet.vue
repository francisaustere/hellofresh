<template>
  <aside
    class="ShoppingSheet fixed inset-y-0 right-0 z-[36] flex w-full max-w-[440px] flex-col border-l border-line bg-bg"
    :aria-label="t('cart.label')">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-2xl">{{ t("cart.title") }}</h2>
      <button
        type="button"
        class="Close"
        :aria-label="t('cart.close')"
        @click="app.send({ type: 'CLOSE_SHEET' })">{{ t("common.closeGlyph") }}</button>
    </div>

    <div class="grid flex-1 content-start gap-[22px] overflow-auto pt-3.5">
      <template v-if="selected.length">
        <button
          type="button"
          class="Btn justify-center"
          @click="openShare">
          {{ t("cart.share") }}
        </button>

        <div>
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="Label">{{ t("cart.recipes", { count: selected.length }, selected.length) }}</span>
            <button
              type="button"
              class="ml-auto py-1 text-[13px] text-muted underline"
              @click="clearAll">
              {{ t("cart.clear") }}
            </button>
            <ServingsPicker
              v-model="servings"
              :options="ALL_SERVINGS" />
          </div>
          <ul class="grid gap-2">
            <li
              v-for="recipe in selected"
              :key="recipe.id"
              class="grid grid-cols-[48px_1fr_auto] items-center gap-2.5">
              <SpriteImage
                class="size-12 rounded-lg"
                :cell="recipe.thumb" />
              <button
                type="button"
                class="text-left leading-tight font-semibold"
                @click="app.send({ type: 'OPEN_RECIPE', id: recipe.id })">
                {{ recipe.name }}
              </button>
              <button
                type="button"
                class="text-[13px] text-muted underline"
                @click="removeFromCart(recipe.id)">
                {{ t("cart.remove") }}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div class="Label mb-1">{{ t("cart.toBuy", { count: list.buy.length }) }}</div>
          <ShoppingLines :lines="list.buy" />
        </div>

        <div v-if="list.pantry.length">
          <div class="Label mb-1">{{ t("cart.checkPantry") }}</div>
          <ShoppingLines :lines="list.pantry" />
        </div>

        <div
          v-if="suggestions.length"
          class="grid gap-2.5">
          <div class="Label">{{ t("cart.suggestions") }}</div>
          <RelatedCard
            v-for="overlap in suggestions"
            :key="overlap.recipe.id"
            :overlap="overlap" />
        </div>
      </template>
      <p
        v-else
        class="text-sm text-muted">{{ t("cart.empty") }}</p>
    </div>

    <dialog
      ref="shareDialog"
      class="m-auto backdrop:bg-black/45 w-[min(420px,calc(100%-32px))] rounded-card border border-line bg-bg p-5 text-ink">
      <form
        class="grid gap-3"
        @submit.prevent="confirmShare">
        <h3 class="text-xl font-bold">{{ t("cart.shareTitle") }}</h3>
        <p class="text-sm text-muted">{{ t("cart.shareIntro") }}</p>
        <div class="grid">
          <label
            v-for="recipe in selected"
            :key="recipe.id"
            class="flex cursor-pointer items-center gap-3 border-b border-line py-2 leading-tight">
            <input
              v-model="cookedIds"
              type="checkbox"
              class="size-5 flex-none accent-accent"
              :value="recipe.id">
            {{ recipe.name }}
          </label>
        </div>
        <div class="flex flex-wrap justify-end gap-2.5 pt-1">
          <button
            type="button"
            class="Btn Btn--ghost"
            @click="shareDialog?.close()">
            {{ t("cart.shareCancel") }}
          </button>
          <button
            type="submit"
            class="Btn">
            {{ t("cart.shareConfirm") }}
          </button>
        </div>
      </form>
    </dialog>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { onKeyStroke } from "@vueuse/core";
import SpriteImage from "@/components/ui/SpriteImage.vue";
import ServingsPicker from "@/components/ui/ServingsPicker.vue";
import RelatedCard from "@/components/ui/RelatedCard.vue";
import ShoppingLines from "@/components/overlays/ShoppingLines.vue";
import { useAppActor, useCatalog } from "@/composables/useAppActor";
import { useNotes } from "@/composables/useNotes";
import { usePreferences } from "@/composables/usePreferences";
import { useToast } from "@/composables/useToast";
import type { Recipe } from "@/engine/recipe.schema";
import { MAX_SERVINGS } from "@/engine/quantity.utils";
import { buildShoppingList, type ShoppingLine } from "@/engine/shopping.utils";
import { downloadText, todayStamp } from "@/utils/file.utils";

const ALL_SERVINGS = Array.from({ length: MAX_SERVINGS }, (_, index) => index + 1);
const SUGGESTION_LIMIT = 4;

type ShareOutcome = "shared" | "saved" | "cancelled";

const { t, locale } = useI18n();
const app = useAppActor();
const catalog = useCatalog();
const { isHidden, addCooked } = useNotes();
const { cart, servings, checked, removeFromCart, clearCart } = usePreferences();
const { showToast } = useToast();

const shareDialog = useTemplateRef<HTMLDialogElement>("shareDialog");
// Recipes whose "reproduite" counter goes up once the list is shared
const cookedIds = ref<string[]>([]);

const selected = computed(() => cart.value
  .map((id) => catalog.value.get(id))
  .filter((recipe): recipe is Recipe => recipe !== null));

const list = computed(() => buildShoppingList(selected.value, servings.value));

// Recipes that reuse what is already in the basket
const suggestions = computed(() => {
  if (!selected.value.length) return [];
  const keys = new Set(selected.value.flatMap((recipe) => [...catalog.value.keysOf(recipe)]));
  return catalog.value.related(keys, (recipe) => cart.value.includes(recipe.id) || isHidden(recipe.id), SUGGESTION_LIMIT);
});

function clearAll(): void {
  showToast(t("cart.cleared"), clearCart());
}

function openShare(): void {
  cookedIds.value = selected.value.map((recipe) => recipe.id);
  shareDialog.value?.showModal();
}

/** Plain text for a message or a note: recipes, what is left to buy, then what is already ticked. */
function listText(): string {
  const lineText = (line: ShoppingLine): string => (line.quantity
    ? t("cart.export.lineWithQuantity", { name: line.name, quantity: line.quantity })
    : t("cart.export.line", { name: line.name }));
  const isTicked = (line: ShoppingLine): boolean => !!checked.value[line.key];
  const { buy, pantry } = list.value;
  const sections: [string, string[]][] = [
    [t("cart.export.recipes"), selected.value.map((recipe) => t("cart.export.line", { name: recipe.name }))],
    [t("cart.export.toBuy"), buy.filter((line) => !isTicked(line)).map(lineText)],
    [t("cart.export.pantry"), pantry.filter((line) => !isTicked(line)).map(lineText)],
    [t("cart.export.done"), [...buy, ...pantry].filter(isTicked).map(lineText)],
  ];
  const title = t("cart.export.title", { date: new Date().toLocaleDateString(locale.value) });
  const blocks = sections.filter(([, lines]) => lines.length).map(([heading, lines]) => [heading, ...lines].join("\n"));
  return `${[title, ...blocks].join("\n\n")}\n`;
}

// The phone's share menu when there is one, a text file in the downloads otherwise.
async function deliver(text: string): Promise<ShareOutcome> {
  if ("share" in navigator) {
    try {
      await navigator.share({ title: t("cart.title"), text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      console.warn("[ShoppingSheet] share failed, saving a file instead", error);
    }
  }
  downloadText(t("cart.export.fileName", { date: todayStamp() }), text);
  return "saved";
}

async function confirmShare(): Promise<void> {
  shareDialog.value?.close();
  const outcome = await deliver(listText());
  if (outcome === "cancelled") return;
  for (const id of cookedIds.value) addCooked(id, 1);
  showToast(outcome === "shared" ? t("cart.shared") : t("cart.saved"));
}

// The share dialog handles its own Escape.
onKeyStroke("Escape", () => {
  if (!shareDialog.value?.open) app.send({ type: "CLOSE_SHEET" });
});
</script>

<style scoped>
.ShoppingSheet {
  padding:
    calc(var(--safe-top) + 16px)
    var(--gutter-right)
    calc(var(--safe-bottom) + 16px)
    16px;
}
</style>
