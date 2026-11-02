# Passation : le site « Nos fiches HelloFresh » de papa et maman

Ce document a deux parties : une pour papa (installer et lancer le site), une pour l'agent qui l'aide (où en est le projet).

---

## 1. Pour papa : installer le site sur ton ordinateur

Tu n'as à le faire qu'une fois. Ensuite, pour ouvrir le site, il suffit de la partie « Lancer le site ».

Le plus simple : demande à ton agent Claude
> « Clone la branche papamaman de https://github.com/francisaustere/hellofresh et lance le site avec npm run dev. »

Il saura faire toutes les étapes ci-dessous. Si tu préfères le faire toi-même :

### Ce qu'il faut sur l'ordinateur

1. **Node.js, version 22 ou plus récente.** Télécharge la version « LTS » sur https://nodejs.org et installe-la comme un programme normal.
2. **Git.**
   - Sur Mac : ouvre le Terminal et tape `git --version`. S'il n'est pas installé, le Mac propose de l'installer : accepte.
   - Sur Windows : télécharge-le sur https://git-scm.com et installe-le avec les options proposées.

### Récupérer le site (une seule fois)

Ouvre le Terminal (Mac) ou « Git Bash » (Windows), puis tape :

```bash
git clone --branch papamaman --single-branch https://github.com/francisaustere/hellofresh.git nos-fiches-hellofresh
```

Le téléchargement fait environ 100 Mo (les photos des recettes). Un dossier `nos-fiches-hellofresh` est créé.

### Lancer le site

```bash
cd nos-fiches-hellofresh
npm run dev
```

La première fois, l'installation prend une ou deux minutes. Le site s'ouvre ensuite tout seul dans le navigateur, à l'adresse http://localhost:5173.

Pour l'arrêter : clique dans le Terminal et appuie sur **Ctrl + C**. Tant que le Terminal tourne, le site reste ouvert.

### Récupérer les nouvelles recettes

Quand François en ajoute :

```bash
cd nos-fiches-hellofresh
git pull
npm run dev
```

### Bon à savoir

- **Tes mots sur les plats** (« Notre mot sur ce plat ») et les fiches retirées sont gardés **dans le navigateur de cet ordinateur**. Ils ne passent pas sur le téléphone, et ils disparaissent si on efface les données du navigateur. Utilise toujours le même navigateur.
- La liste de courses et le nombre de personnes sont aussi gardés dans le navigateur.
- Le site ne marche que sur l'ordinateur où il est lancé. Pour l'avoir sur le téléphone aussi, il faudrait le mettre en ligne : voir la partie 2.

---

## 2. Pour l'agent : où en est le projet (2 novembre 2026)

### Le dépôt

- https://github.com/francisaustere/hellofresh, **public**.
- Branche `papamaman` : la version des parents (celle-ci). Branche `main` : le site personnel de François, sans les fichiers des parents. Ne pas fusionner `papamaman` dans `main`, ne pas pousser sur `main`.
- À la racine, `package.json` est un workspace npm sur `nos-fiches/` : `npm run dev` installe (`predev`) puis lance le site avec `--open`. Node ≥ 22.12 (`.nvmrc`).

### Ce qui est fait

- `nos-fiches/` : le site en Vue 3 + TypeScript strict + Vite + Tailwind 4 + XState + GSAP + vue-i18n + zod. Toutes les fonctions de l'ancien artefact y sont : galerie (recettes les plus commandées d'abord, recherche, filtres), fiche (badge cœur et remplacements, mot sur le plat, ingrédients selon le nombre de personnes, étapes, recettes avec les mêmes courses), mode cuisine pas à pas, liste de courses fusionnée, retrait d'une fiche avec annulation, liens directs `#r-<id>`.
- Vérifié : `npm run type-check`, `npm run lint`, `npm run build`, et `npm run dev` depuis un clone neuf de `papamaman` (480 recettes affichées, sur ordinateur et en largeur téléphone).
- Les données sont dans le dépôt : `nos-fiches/public/data.json` (480 recettes) et `nos-fiches/public/img/` (photos en planches). Rien à télécharger d'autre.

### Choix faits, à respecter

- **Pas de base de données.** Les recettes viennent du JSON, les notes restent dans le navigateur (localStorage, via `LocalNotesRepository`). C'est voulu. `nos-fiches/docs/database.md` n'est qu'un plan indicatif (Supabase, avec les pièges du plan gratuit) au cas où papa voudrait un jour le site sur tous ses appareils. Ne pas le lancer sans qu'on le demande.
- **Santé :** le site montre un badge cœur coloré et des remplacements d'ingrédients, **jamais de note chiffrée ni de quantité de sel**. Les conseils restent généraux et renvoient au médecin.
- `nos-fiches/public/data.json` et `img/` sont générés par les scripts de `scripts/` puis copiés avec `npm run sync-data` (dans `nos-fiches/`). Ne pas les modifier à la main.

### À lire avant de toucher au code

1. `README.md` (racine) puis `nos-fiches/README.md` : commandes et organisation du code.
2. `nos-fiches/CLAUDE.md` : règles du projet (conventions de code, vérifications avant de rendre la main, public visé).
3. `nos-fiches/docs/database.md` : seulement si on parle de mettre le site en ligne.

### Ce qui reste possible (rien n'est en cours)

- Mettre à jour les recettes après de nouvelles livraisons. C'est François qui le fait depuis son ordinateur, avec la chaîne `scripts/prefetch.mjs` → `build-data.mjs` → `build-parents.mjs`, puis `npm run sync-data`, puis un push sur `papamaman`. De ton côté : `git pull`.
- Mettre le site en ligne pour l'avoir aussi sur le téléphone : suivre `nos-fiches/docs/database.md` (base Supabase + site sur Netlify ou Cloudflare Pages). Demander l'accord de François avant, car ça passe par ses comptes.

### Si quelque chose ne marche pas

- `npm run dev` refuse de démarrer : vérifier `node --version` (22.12 ou plus).
- Page blanche ou « Les fiches n'ont pas pu être chargées » : vérifier que `nos-fiches/public/data.json` existe (`git status`, `git pull`).
- Les notes ont disparu : elles sont liées au navigateur. Vérifier que c'est le même navigateur, et que ses données n'ont pas été effacées.
