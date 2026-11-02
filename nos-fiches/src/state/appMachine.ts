import { assign, fromPromise, setup } from "xstate";
import RecipeCatalog from "@/engine/RecipeCatalog";
import { RecipeDataSchema } from "@/engine/recipe.schema";

export type AppContext = {
  catalog: RecipeCatalog | null,
  recipeId: string | null,
  cookStep: number,
  query: string,
  tag: string | null,
};

export type AppEvent =
  | { type: "OPEN_RECIPE", id: string }
  | { type: "GO_HOME" }
  | { type: "START_COOK" }
  | { type: "COOK_STEP", step: number }
  | { type: "CLOSE_COOK" }
  | { type: "OPEN_SHEET" }
  | { type: "CLOSE_SHEET" }
  | { type: "SET_QUERY", query: string }
  | { type: "SET_TAG", tag: string | null };

const DATA_URL = `${import.meta.env.BASE_URL}data.json`;

async function loadCatalog(): Promise<RecipeCatalog> {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`[appMachine] ${DATA_URL} answered ${response.status}`);
  return new RecipeCatalog(RecipeDataSchema.parse(await response.json()));
}

/**
 * Application flow. Two parallel regions once data is ready:
 * - view: the gallery, or one recipe (read, or cooked step by step)
 * - sheet: the shopping list panel, open over any view
 */
export const appMachine = setup({
  types: {
    context: {} as AppContext,
    events: {} as AppEvent,
  },
  actors: {
    loadCatalog: fromPromise(loadCatalog),
  },
  guards: {
    isKnownRecipe: ({ context, event }) => event.type === "OPEN_RECIPE" && !!context.catalog?.has(event.id),
  },
  actions: {
    clampCookStep: assign({
      cookStep: ({ context, event }) => {
        if (event.type !== "COOK_STEP") return context.cookStep;
        const stepCount = context.catalog?.get(context.recipeId ?? "")?.steps.length ?? 1;
        return Math.max(0, Math.min(stepCount - 1, event.step));
      },
    }),
  },
}).createMachine({
  id: "app",
  context: {
    catalog: null,
    recipeId: null,
    cookStep: 0,
    query: "",
    tag: null,
  },
  initial: "loading",
  states: {
    loading: {
      invoke: {
        src: "loadCatalog",
        onDone: {
          target: "ready",
          actions: assign({ catalog: ({ event }) => event.output }),
        },
        onError: {
          target: "failed",
          actions: ({ event }) => console.error("[appMachine] data failed to load", event.error),
        },
      },
    },
    failed: {},
    ready: {
      type: "parallel",
      states: {
        view: {
          initial: "gallery",
          on: {
            OPEN_RECIPE: {
              guard: "isKnownRecipe",
              target: ".recipe",
              reenter: true,
              actions: assign({ recipeId: ({ event }) => event.id, cookStep: 0 }),
            },
            GO_HOME: {
              target: ".gallery",
              actions: assign({ recipeId: null }),
            },
            SET_QUERY: {
              target: ".gallery",
              actions: assign({ query: ({ event }) => event.query, recipeId: null }),
            },
            SET_TAG: {
              actions: assign({ tag: ({ event }) => event.tag }),
            },
          },
          states: {
            gallery: {},
            recipe: {
              initial: "reading",
              states: {
                reading: {
                  on: {
                    START_COOK: {
                      target: "cooking",
                      actions: assign({ cookStep: 0 }),
                    },
                  },
                },
                cooking: {
                  on: {
                    COOK_STEP: { actions: "clampCookStep" },
                    CLOSE_COOK: { target: "reading" },
                  },
                },
              },
            },
          },
        },
        sheet: {
          initial: "closed",
          states: {
            closed: {
              on: { OPEN_SHEET: { target: "open" } },
            },
            open: {
              on: {
                CLOSE_SHEET: { target: "closed" },
                OPEN_RECIPE: { target: "closed" },
                GO_HOME: { target: "closed" },
              },
            },
          },
        },
      },
    },
  },
});
