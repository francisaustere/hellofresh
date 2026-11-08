# Nos fiches

The parents' HelloFresh recipe site as a standalone web app: gallery of the recipes they ordered (most made first, or best rated; filters by tag and season), recipe page with a "for the heart" badge and swaps, step-by-step cook mode, merged shopping list (shared or saved as text), and per recipe a note, personal stars ("Note perso", replacing the stars drawn from the orders once given) and a "cooked again" counter ("reproduite", which only weighs in the sort).

Ported from the artifact "Nos fiches HelloFresh" (`../site-parents/index.html`).

## Stack

Vue 3 (`<script setup lang="ts">`), Vite, TypeScript strict, Tailwind CSS 4, XState 5 (app flow), GSAP (overlay transitions), vue-i18n (all copy in `src/locales/fr.json`), zod (data validation), @vueuse/core. Conventions: the `m-code-style` and `m-vue-style` skills; `eslint.config.js` comes from `m-code-style`.

## Commands

```bash
npm install
npm run dev          # http://localhost:5173
npm run type-check   # vue-tsc, the lint gate
npm run lint
npm run build        # type-check + vite build → dist/
npm run sync-data    # copy ../site-parents/data.json and img/ into public/
```

## Data

`public/data.json` and `public/img/` are generated, never edited by hand. To refresh them after new deliveries, run the chain in the parent folder (`../scripts/prefetch.mjs`, `build-data.mjs`, `build-parents.mjs`), then `npm run sync-data`.

Notes (comment, hidden recipe, personal `rating`, `cooked` count) go through `NotesRepository`; today they stay in the browser. That is the intended setup; [docs/database.md](docs/database.md) only describes how to go online later (shared notes on every device), if ever wanted.

## Layout

```
src/
  App.vue, main.ts, main.css, i18n.ts
  state/appMachine.ts        flow: loading → ready { view: gallery | recipe.reading | recipe.cooking, sheet: closed | open }
  engine/                    pure logic: data schema, search, quantities, shopping list, seasons, RecipeCatalog (related recipes, season per recipe)
  core/notes/                NotesRepository contract + LocalNotesRepository
  composables/               useAppActor, useNotes, usePreferences, useHashRoute, useToast, useGSAP
  components/views/          GalleryView, RecipeView
  components/recipe/         heart panel, note, ingredients, steps, related
  components/overlays/       CookMode, ShoppingSheet
  components/ui/             small shared widgets
```

URLs: `#r-<recipe id>` opens a recipe, so links can be shared and the back button works.

## Deploy

Static site: any static host (Cloudflare Pages, Netlify, Vercel) serving `dist/`. `index.html` carries `noindex`; keep the URL private.
