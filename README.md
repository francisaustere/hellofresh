# Nos fiches HelloFresh

Le site de recettes de papa et maman : toutes les recettes déjà commandées, la liste de courses, le mode cuisine pas à pas.

## Lancer le site

Il faut Node.js 22 ou plus récent (https://nodejs.org, version « LTS »).

```bash
npm run dev
```

Le site s'ouvre dans le navigateur sur http://localhost:5173. Pour l'arrêter : Ctrl + C dans le terminal.

## Mettre à jour

```bash
git pull
npm run dev
```

## Pour l'agent qui aide

- Le site est dans `nos-fiches/` (Vue 3 + TypeScript). Lire `nos-fiches/README.md` et `nos-fiches/CLAUDE.md`.
- `npm run dev` à la racine installe ce qu'il faut puis lance le site.
- Les notes (« Notre mot sur ce plat », fiches retirées) sont gardées dans le navigateur de cet ordinateur pour l'instant.
- Les recettes et photos sont déjà dans le dépôt (`nos-fiches/public/`), rien à télécharger d'autre.
