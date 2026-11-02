import { createActor } from "xstate";
import { useSelector } from "@xstate/vue";
import { computed, type ComputedRef } from "vue";
import { appMachine } from "@/state/appMachine";
import type RecipeCatalog from "@/engine/RecipeCatalog";
import type { Recipe } from "@/engine/recipe.schema";

// One actor for the whole app, started on first use and never stopped (it lives as long as the page).
let actor: ReturnType<typeof createActor<typeof appMachine>> | null = null;

export function useAppActor(): NonNullable<typeof actor> {
  if (!actor) {
    actor = createActor(appMachine);
    actor.start();
  }
  return actor;
}

/** The loaded catalog. Only read it in components rendered once the machine is "ready". */
export function useCatalog(): ComputedRef<RecipeCatalog> {
  const catalog = useSelector(useAppActor(), (snapshot) => snapshot.context.catalog);
  return computed(() => {
    if (!catalog.value) throw new Error("[useCatalog] read before data was loaded");
    return catalog.value;
  });
}

export function useCurrentRecipe(): ComputedRef<Recipe | null> {
  const app = useAppActor();
  const catalog = useSelector(app, (snapshot) => snapshot.context.catalog);
  const recipeId = useSelector(app, (snapshot) => snapshot.context.recipeId);
  return computed(() => (recipeId.value ? catalog.value?.get(recipeId.value) ?? null : null));
}
