# Passation : le site « Nos fiches HelloFresh » de papa et maman

Ce document a deux parties : une pour papa (installer et lancer le site), une pour l'agent qui l'aide (où en est le projet).

---

## 1. Pour papa : installer le site sur ton ordinateur

### En deux mots

Le site de recettes n'est pas sur Internet : il tourne **sur ton ordinateur**. Pour ça, il faut une fois pour toutes installer deux petits programmes, puis copier le site depuis Internet sur ton ordinateur. Ensuite, chaque fois que tu veux t'en servir, tu tapes une commande et le site s'ouvre dans ton navigateur (Safari, Chrome…), comme un site normal.

### La façon la plus simple : demander à Claude

Ouvre Claude Code et écris-lui exactement ceci :

> « Installe et lance le site de recettes de la branche papamaman de https://github.com/francisaustere/hellofresh. Lis le fichier HANDOFF.md et guide-moi pas à pas. »

Il fera les étapes à ta place. Quand il te demande quelque chose (autoriser une action, taper ton mot de passe de l'ordinateur pour installer un programme), c'est normal : lis ce qu'il dit et réponds. En cas de doute, demande-lui « qu'est-ce que ça fait ? » avant d'accepter.

### Si tu veux le faire toi-même, pas à pas

Quelques mots qui reviennent :

- **Le Terminal** : une fenêtre où l'on tape des commandes au lieu de cliquer. Tu écris une ligne, tu appuies sur la touche **Entrée**, l'ordinateur l'exécute et affiche du texte. C'est normal qu'il y ait beaucoup de texte : seules les lignes avec le mot « error » sont un problème.
- **Une commande** : une ligne de texte à taper dans le Terminal. Le plus sûr est de la **copier-coller** depuis ce document plutôt que de la retaper.
- **Node.js** : un programme qui fait tourner le site sur ton ordinateur. On l'installe une fois, puis on l'oublie.
- **Git** : un programme qui copie le site depuis Internet et qui récupère ensuite les nouvelles recettes.

#### Étape 1 : ouvrir le Terminal

- **Sur Mac** : appuie en même temps sur **Cmd + Espace**, tape `Terminal`, puis appuie sur **Entrée**. Une fenêtre avec du texte s'ouvre.
- **Sur Windows** : ce sera « Git Bash », un programme installé à l'étape 3. Fais d'abord les étapes 2 et 3.

#### Étape 2 : installer Node.js (une seule fois)

1. Va sur https://nodejs.org avec ton navigateur.
2. Clique sur le gros bouton de téléchargement marqué **LTS** (la version stable).
3. Ouvre le fichier téléchargé et clique sur **Continuer** / **Suivant** jusqu'à la fin, sans rien changer. L'ordinateur peut te demander ton mot de passe : c'est celui que tu tapes pour allumer ta session.
4. Pour vérifier : dans le Terminal, colle cette commande et appuie sur Entrée :

   ```bash
   node --version
   ```

   Tu dois voir un numéro qui commence par **v22** ou plus (par exemple `v22.12.0`). Si tu vois « command not found », ferme le Terminal, rouvre-le et réessaie.

#### Étape 3 : installer Git (une seule fois)

- **Sur Mac** : dans le Terminal, colle `git --version` et appuie sur Entrée. Si une fenêtre propose d'installer des « outils de développement en ligne de commande », clique sur **Installer** et attends la fin (quelques minutes). Si un numéro s'affiche, Git est déjà là.
- **Sur Windows** : va sur https://git-scm.com, clique sur **Download for Windows**, ouvre le fichier et clique sur **Next** jusqu'à la fin sans rien changer. Ensuite, ouvre le programme **Git Bash** (menu Démarrer) : c'est ton Terminal pour la suite.

#### Étape 4 : copier le site sur ton ordinateur (une seule fois)

Dans le Terminal, colle cette commande (c'est une seule longue ligne) et appuie sur Entrée :

```bash
git clone --branch papamaman --single-branch https://github.com/francisaustere/hellofresh.git nos-fiches-hellofresh
```

Ça télécharge environ 100 Mo (surtout les photos des recettes) et crée un dossier **nos-fiches-hellofresh** dans ton dossier personnel. Attends que le texte s'arrête et que tu puisses de nouveau taper.

#### Étape 5 : ouvrir le site

Colle ces deux commandes, l'une après l'autre (Entrée après chacune) :

```bash
cd nos-fiches-hellofresh
```

```bash
npm run dev
```

La première commande « entre » dans le dossier du site. La deuxième le démarre. **La première fois, attends une ou deux minutes** : il installe ce dont il a besoin. Ensuite le site s'ouvre tout seul dans ton navigateur. S'il ne s'ouvre pas, tape à la main dans la barre d'adresse du navigateur : **http://localhost:5173**

**Important : ne ferme pas la fenêtre du Terminal tant que tu utilises le site.** Le Terminal fait tourner le site ; si tu le fermes, la page arrête de marcher. Tu peux le réduire (le mettre de côté) sans problème.

#### Étape 6 : fermer le site

Quand tu as fini : clique dans la fenêtre du Terminal, appuie en même temps sur **Ctrl + C**, puis ferme la fenêtre.

### Les fois suivantes

Plus besoin des étapes 2 à 4. Ouvre le Terminal, puis :

```bash
cd nos-fiches-hellofresh
```

```bash
npm run dev
```

### Quand François ajoute de nouvelles recettes

Ouvre le Terminal, puis colle une par une :

```bash
cd nos-fiches-hellofresh
```

```bash
git pull
```

```bash
npm run dev
```

`git pull` va chercher les nouveautés sur Internet. Si tu vois « Already up to date », c'est qu'il n'y avait rien de nouveau.

### Bon à savoir

- **Tes mots sur les plats** (« Notre mot sur ce plat ») et les fiches que tu retires sont gardés **dans ton navigateur, sur cet ordinateur**. Ils ne vont pas sur le téléphone. Utilise toujours le même navigateur, et n'efface pas son historique « avec les données des sites », sinon ils disparaissent.
- La liste de courses et le nombre de personnes sont gardés de la même façon.
- Le site ne marche que sur cet ordinateur, et seulement quand le Terminal le fait tourner. Pour l'avoir aussi sur le téléphone, il faudrait le mettre en ligne : demande à François.
- Si quelque chose bloque, copie le message affiché dans le Terminal et donne-le à Claude ou à François.

---

## 2. Pour l'agent : où en est le projet (2 novembre 2026)

### Comment parler à papa

Papa n'est pas informaticien : il ne connaît ni le Terminal, ni Node, ni npm, ni Git, ni Vue. Chaque fois que tu lui demandes de faire quelque chose de technique :

- **Une étape à la fois.** Dis-lui exactement quoi faire (où cliquer, quoi coller, sur quelle touche appuyer), attends qu'il te dise que c'est fait, puis passe à la suivante.
- **Explique en une phrase simple** à quoi sert l'étape avant de la donner (« ça installe le programme qui fait tourner le site »).
- **Dis-lui ce qu'il va voir** et ce qui est normal (beaucoup de texte, une demande de mot de passe de l'ordinateur), et ce qui serait un problème.
- **Pas de jargon** : si un mot technique est inévitable, explique-le. Parle en français, tutoie-le.
- Fais toi-même tout ce que tu peux faire (installer, lancer, vérifier) et ne lui demande que ce qu'il est le seul à pouvoir faire (cliquer sur un installeur, taper son mot de passe, autoriser une action). Explique-lui chaque autorisation que tu demandes.
- La partie 1 de ce document est le parcours de référence : suis-la.

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
