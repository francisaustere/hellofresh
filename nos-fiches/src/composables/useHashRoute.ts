import { watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useSelector } from "@xstate/vue";
import { useAppActor } from "@/composables/useAppActor";

const RECIPE_HASH = /^#r-([\w-]+)$/;

/** Keeps the URL hash (#r-<id>) and the machine in sync, so links and the back button work. */
export function useHashRoute(): void {
  const app = useAppActor();
  const isReady = useSelector(app, (snapshot) => snapshot.matches("ready"));
  const recipeId = useSelector(app, (snapshot) => snapshot.context.recipeId);

  const readHash = (): void => {
    if (!isReady.value) return;
    const id = RECIPE_HASH.exec(location.hash)?.[1];
    if (id === recipeId.value) return;
    app.send(id ? { type: "OPEN_RECIPE", id } : { type: "GO_HOME" });
  };

  watch(isReady, readHash, { immediate: true });
  useEventListener(window, "hashchange", readHash);

  watch(recipeId, (id) => {
    const hash = id ? `#r-${id}` : "";
    if (location.hash === hash) return;
    if (id) location.hash = hash;
    else history.pushState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
  });
}
