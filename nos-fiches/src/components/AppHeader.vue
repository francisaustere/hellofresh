<template>
  <header class="AppHeader sticky z-20 border-b border-line backdrop-blur-[10px]">
    <div class="Wrap flex items-center gap-3 py-3">
      <button
        type="button"
        class="flex items-center gap-2 font-display text-xl font-extrabold whitespace-nowrap"
        :aria-label="t('header.home')"
        @click="app.send({ type: 'GO_HOME' })">
        <span class="AppHeader__Dot size-[22px] flex-none bg-accent"></span>
        <span class="max-[560px]:hidden">{{ t("header.brand") }}</span>
      </button>

      <label class="relative min-w-0 flex-1">
        <svg
          class="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true">
          <circle
            cx="11"
            cy="11"
            r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span class="sr-only">{{ t("header.searchLabel") }}</span>
        <input
          :value="query"
          type="search"
          class="AppHeader__Search w-full rounded-full border-[1.5px] border-line bg-surface py-[11px] pr-3.5 pl-10 text-base"
          :placeholder="t('header.searchPlaceholder')"
          autocomplete="off"
          @input="app.send({ type: 'SET_QUERY', query: ($event.target as HTMLInputElement).value })">
      </label>

      <button
        type="button"
        class="flex items-center gap-2 rounded-full bg-ink px-3.5 py-2.5 font-semibold whitespace-nowrap text-bg"
        :aria-label="t('header.openCart')"
        @click="app.send({ type: 'OPEN_SHEET' })">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <path d="M3 5h2l2.2 10.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L20 8H6" />
          <circle
            cx="9"
            cy="20"
            r="1.4" />
          <circle
            cx="17"
            cy="20"
            r="1.4" />
        </svg>
        <span class="max-[560px]:hidden">{{ t("header.cart") }}</span>
        <span class="min-w-[22px] rounded-full bg-hi px-1.5 text-center text-[13px] text-hi-on tabular-nums">{{ cart.length }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSelector } from "@xstate/vue";
import { useAppActor } from "@/composables/useAppActor";
import { usePreferences } from "@/composables/usePreferences";

const { t } = useI18n();
const app = useAppActor();
const { cart } = usePreferences();

const query = useSelector(app, (snapshot) => snapshot.context.query);
</script>

<style scoped>
.AppHeader {
  top: var(--safe-top);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
}

.AppHeader__Dot {
  border-radius: 50% 50% 50% 8px;
  transform: rotate(-20deg);
}

.AppHeader__Search:focus {
  border-color: var(--accent);
  outline: none;
}
</style>
