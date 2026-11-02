# Database: recipe notes

Status (2026-11-02): **not wired yet**. The site runs on `LocalNotesRepository` (localStorage, one browser only). This document is the plan for the agent that takes over.

## What needs storing

| Data | Where today | Where it should live | Why |
|---|---|---|---|
| Recipes, photos, heart badges | `public/data.json`, `public/img/` (static, rebuilt by `../scripts/build-parents.mjs`) | Stay static | Read-only, regenerated in batch, 44 MB of sprites. A CDN serves it better than a database. |
| Notes per recipe: `comment`, `hidden` (and legacy `rating`) | `localStorage["notes"]` | **Shared database** | The parents write a note on the computer and read it on the phone in the kitchen. The artifact version already behaved this way. |
| Basket, ticked shopping lines, servings | `localStorage` (`cart`, `checked`, `servings`) | Stay per device | Same as the artifact. Optional later: share the basket too (one more table, same pattern). |

The contract is `src/core/notes/NotesRepository.ts`: `subscribe(onChange, onError)` pushes the full map now and on every change, `save(recipeId, note)` replaces one note. `useNotes` handles optimistic updates and one write at a time per recipe, so a backend only has to implement those two methods.

## Recommended backend: Supabase

Postgres with row-level security, a realtime channel for `subscribe`, email magic-link auth, a free tier and an EU region (Frankfurt). Firebase Firestore would also fit (its `onSnapshot` is what the artifact used), but Supabase keeps the data in plain SQL and is easier to export.

Schema: `supabase/migrations/0001_recipe_notes.sql`.

- `households`: one row, "Parents".
- `household_members`: the parents' auth users (and François's if he wants access).
- `recipe_notes`: primary key `(household_id, recipe_id)`, mirrors `RecipeNote`.
- RLS: a user reads and writes only the notes of a household they belong to. No delete policy: hiding a recipe is `hidden = true`, never a delete.

### Sign-in for the parents

Magic link by email, once per device; Supabase keeps the session (refresh token) so they don't sign in again. No password to remember. Don't open public sign-ups: create the two users in the Supabase dashboard (Authentication → Add user) and insert their `household_members` rows by hand. Turn off "Allow new users to sign up".

Show a simple sign-in screen when there is no session (one email field, "Recevoir le lien"), all copy through `src/locales/fr.json`.

## Implementation steps

1. `npm i @supabase/supabase-js`.
2. `src/core/notes/SupabaseNotesRepository.ts` implementing `NotesRepository`, `isShared = true`:
   - `subscribe`: `select recipe_id, comment, hidden, rating, updated_at` for the household, call `onChange(map)`, then `channel("recipe_notes").on("postgres_changes", { event: "*", schema: "public", table: "recipe_notes", filter: "household_id=eq.<id>" }, …)` and re-emit the merged map. Return a function that removes the channel.
   - `save`: `upsert({ household_id, recipe_id, comment, hidden, rating, updated_at }, { onConflict: "household_id,recipe_id" })`; throw on error so `useNotes` shows its toast.
   - Map `updated_at` ↔ `updatedAt` (camelCase in the app, snake_case in SQL).
   - Validate rows with `RecipeNoteSchema` (zod) like the local repository does.
3. Household id: read it once after sign-in from `household_members` (`select household_id … limit 1`).
4. `createNotesRepository()`: return `SupabaseNotesRepository` when `VITE_NOTES_BACKEND=supabase` and a session exists. Env vars in `.env.example`; the anon key is public by design, RLS does the protection.
5. Auth flow: a small XState branch before `ready` (`signing_in` → `ready`) or a `useAuth` composable; keep `appMachine` the source of the flow.
6. Run `npm run type-check`, `npm run lint`, and test with two browsers (note written in one appears in the other within a second).

## Migrating the existing notes

The parents already wrote notes in the artifact "Nos fiches HelloFresh" (`https://claude.ai/artifact/2AQehHQqi46F5xc4v4EzSA`, artifact database collection `notes`, one document per recipe id: `{ comment?, hidden?, rating?, updatedAt }`).

1. Export: from Claude Code, `ArtifactData` → `list` on that URL, collection `notes`. Save as `notes-export.json` outside the repo (it is personal data, don't commit it).
2. Import: a one-off `scripts/import-artifact-notes.mjs` that upserts each document into `recipe_notes` with the service-role key (local env only, never in the client).
3. Check in the site that the "Fiches retirées" list and the comments match the artifact, then tell François so the parents switch to the new URL.

## Constraints to keep

- Never show a health score or number; the heart badge and swaps only (see CLAUDE.md).
- Notes are personal data: EU region, no analytics on their content, `noindex` stays in `index.html`.
