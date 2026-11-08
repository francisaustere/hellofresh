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

**Si `git pull` affiche une erreur** (avec les mots « conflict », « would be overwritten » ou « diverged »), c'est que ton dossier contient des changements faits avec ton IA. Ne tape rien d'autre. Ouvre ton IA dans le dossier du site et écris-lui : « Lis la section *Remettre le dossier de papa d'aplomb* de HANDOFF.md et fais-la avec moi. »

### Bon à savoir

- **Tes mots sur les plats** (« Notre mot sur ce plat ») et les fiches que tu retires sont gardés **dans ton navigateur, sur cet ordinateur**. Ils ne vont pas sur le téléphone. Utilise toujours le même navigateur, et n'efface pas son historique « avec les données des sites », sinon ils disparaissent.
- Ta note perso (les étoiles) et ton compteur « reproduite » se changent sur la fiche d'une recette, dans le bloc du bas. Ils sont gardés au même endroit.
- La liste de courses et le nombre de personnes sont gardés de la même façon.
- Le site ne marche que sur cet ordinateur, et seulement quand le Terminal le fait tourner. Pour l'avoir aussi sur le téléphone, il faudrait le mettre en ligne : demande à François.
- Si quelque chose bloque, copie le message affiché dans le Terminal et donne-le à Claude ou à François.

---

## 2. Pour l'agent : où en est le projet (8 novembre 2026)

### Comment parler à papa

Papa n'est pas informaticien : il ne connaît ni le Terminal, ni Node, ni npm, ni Git, ni Vue. Chaque fois que tu lui demandes de faire quelque chose de technique :

- **Une étape à la fois.** Dis-lui exactement quoi faire (où cliquer, quoi coller, sur quelle touche appuyer), attends qu'il te dise que c'est fait, puis passe à la suivante.
- **Explique en une phrase simple** à quoi sert l'étape avant de la donner (« ça installe le programme qui fait tourner le site »).
- **Dis-lui ce qu'il va voir** et ce qui est normal (beaucoup de texte, une demande de mot de passe de l'ordinateur), et ce qui serait un problème.
- **Pas de jargon** : si un mot technique est inévitable, explique-le. Parle en français, tutoie-le.
- Fais toi-même tout ce que tu peux faire (installer, lancer, vérifier) et ne lui demande que ce qu'il est le seul à pouvoir faire (cliquer sur un installeur, taper son mot de passe, autoriser une action). Explique-lui chaque autorisation que tu demandes.
- La partie 1 de ce document est le parcours de référence : suis-la.
- Papa est sur **Windows** : son Terminal est **Git Bash**. Donne des commandes qui marchent dans Git Bash.

### Remettre le dossier de papa d'aplomb (à faire une fois, novembre 2026)

Début novembre, papa a modifié le site avec Aider et un petit modèle local (qwen 2.5). Il n'a pas pu pousser son travail : il l'a envoyé à François dans un zip. François l'a repris et refait proprement sur `papamaman` : saison, note perso, compteur « reproduite », tri, filtre saison, « Tout retirer », partage de la liste. Il a aussi simplifié l'affichage : une seule rangée d'étoiles, et les réglages sur la fiche plutôt que sur les cartes. **Tout son travail est donc déjà sur GitHub, en mieux.** Son dossier local, lui, contient encore l'ancienne version : 5 commits locaux (dont des fichiers vides dans `path/to/` et `src/components/`), des changements non commités et une vingtaine de copies de sauvegarde (`*.vue.txt`, `*Original*.txt`). C'est pour ça que `git pull` refuse de marcher.

Avec lui, une étape à la fois, dans le dossier du site :

1. Explique-lui ce qui va se passer : on met son ancienne version de côté, sans rien effacer, puis on récupère la version de François.
2. `git status` : vérifie que tu retrouves bien ce qui est décrit ci-dessus. Si tu vois autre chose (des modifications faites après le 6 novembre), arrête-toi et demande à papa de les envoyer à François avant de continuer.
3. `git fetch origin`
4. `git branch papa-sauvegarde-novembre` : ses 5 commits restent accessibles sur cette branche.
5. `git stash push --include-untracked -m "travail de papa avant reprise par François"` : les changements non commités et les copies `.txt` sont rangés dans une remise, pas supprimés.
6. `git reset --hard origin/papamaman` : le dossier devient identique à GitHub.
7. `npm run dev` : vérifie avec lui que le site s'ouvre et qu'il retrouve ses fonctions : en haut de la galerie, les menus « Saison » et « Trier » ; sur la fiche d'une recette, le bloc du bas avec « Note perso », « Reproduite à la maison » et « Notre mot sur ce plat ».

Ses notes (mots sur les plats, fiches retirées) sont dans le navigateur, pas dans le dossier : elles ne bougent pas. Ses étoiles et ses compteurs « reproduite », donnés avec sa version, étaient gardés dans le navigateur sous d'autres noms (`recipe-star-overrides`, `recipe-cooked-overrides`). Le site les reprend tout seul au premier lancement (`LocalNotesRepository`), s'il utilise le même navigateur. Vérifie avec lui qu'il les retrouve.

### Comment bien travailler sur ce projet

Ce qui a coincé avec la version d'Aider, à ne pas refaire :

- **Choisis un modèle capable.** Un modèle local de 3 ou 7 milliards de paramètres (qwen2.5, qwen2.5-coder) ne tient pas ce code en tête. Il invente des fichiers (`path/to/Recipe.js`) et des champs qui n'existent pas (`recipe.season`, `notes.stars`), et il rend du code qui ne compile pas. Utilise Claude Code (partie 1), ou Aider avec un modèle Claude via l'API Anthropic. Si papa tient à un modèle local, limite-le à de petites demandes très précises et vérifie tout.
- **Lis avant d'écrire.** `nos-fiches/CLAUDE.md` contient les règles, quel que soit l'outil (Claude Code, Aider, AiderDesk). Avant de toucher un composant, lis-le en entier, ainsi que les composables qu'il utilise (`useNotes`, `usePreferences`, `useAppActor`).
- **Une donnée gardée = un champ du schéma.** Ce que papa saisit (mot, étoiles, compteur) va dans `RecipeNote` (`src/core/notes/RecipeNote.ts`) et passe par `saveNote`. Un champ absent du schéma est **effacé au rechargement**. Ne crée pas de nouvelle clé localStorage en parallèle pour contourner le problème.
- **Une logique, un seul endroit.** Les calculs vont dans `src/engine/` (sans Vue) et ne sont jamais copiés d'un composant à l'autre. Exemple : la saison est calculée dans `engine/season.utils.ts`.
- **Tous les textes dans `src/locales/fr.json`**, via `t()`. **Les couleurs du thème** (`text-muted`, `bg-surface`, `text-accent`…), jamais `text-black` ni `green-700` : sinon le texte disparaît en mode sombre.
- **Ce qu'on clique reste un `<button>`**, pour le clavier et le lecteur d'écran.
- **Git est la sauvegarde.** Pas de copies `Fichier.vue.txt` dans `src/` : on fait un commit par petite étape qui marche, avec un message clair en français. Pour revenir en arrière : `git restore <fichier>` (avant commit) ou `git revert` (après). Avec Aider, chaque modification est commitée automatiquement : relis le commit, et annule-le avec `/undo` s'il est faux.
- **Vérifie avant de dire « c'est fait »** : dans `nos-fiches/`, `npm run type-check && npm run lint && npm run build` sans erreur, puis teste dans le navigateur sur ordinateur et en largeur téléphone.
- **Identité Git** : les commits de papa étaient signés « Your Name <you@example.com> ». Règle `git config user.name` avec un nom qu'il choisit. Le dépôt est public, donc pas d'adresse e-mail personnelle : laisse l'adresse par défaut, ou utilise l'adresse « noreply » de GitHub s'il a un compte.
- **Transmettre son travail à François.** Papa n'a pas les droits pour pousser sur GitHub. Ne lui fais créer ni compte ni jeton sans l'accord de François. Quand une modification est prête et vérifiée, crée des fichiers de patch avec `git format-patch origin/papamaman -o ../pour-francois`, et aide-le à les envoyer à François par e-mail. Si François l'ajoute un jour au dépôt, pousse sur une branche `papa/<sujet>`, jamais directement sur `papamaman`.

### Ta mémoire d'une session à l'autre

Le fichier **`MEMOIRE.md`**, à la racine, est ta mémoire pour ce projet : ce qu'il faut savoir de papa, ce qui est en cours, ce qui a été décidé. Lis-le au début de chaque session et mets-le à jour à la fin (quelques lignes datées, pas de roman). Il est versionné : François le lit aussi.

- **Claude Code** lit `CLAUDE.md`, qui renvoie vers `MEMOIRE.md`. Sa mémoire automatique (ce qu'il retient de lui-même, rangé dans le dossier utilisateur) peut garder les préférences de papa. Mais ce qui concerne le projet va dans `MEMOIRE.md`, pour que François le voie.
- **Aider** n'a pas de mémoire entre deux sessions. Le fichier `.aider.conf.yml` à la racine lui fait lire à chaque lancement `CLAUDE.md`, `nos-fiches/CLAUDE.md`, `HANDOFF.md` et `MEMOIRE.md`, en lecture seule. Pour mettre la mémoire à jour, ajoute `MEMOIRE.md` à la conversation (`/add MEMOIRE.md`). Le fichier `.aiderignore` lui cache les photos et les données, pour que sa carte du code reste petite.
- **AiderDesk** : s'il propose des règles ou une mémoire de projet, mets-y simplement « Lis CLAUDE.md, nos-fiches/CLAUDE.md, HANDOFF.md et MEMOIRE.md avant toute chose ».

### Le dépôt

- https://github.com/francisaustere/hellofresh, **public**.
- Branche `papamaman` : la version des parents (celle-ci). Branche `main` : le site personnel de François, sans les fichiers des parents. Ne pas fusionner `papamaman` dans `main`, ne pas pousser sur `main`.
- À la racine, `package.json` est un workspace npm sur `nos-fiches/` : `npm run dev` installe (`predev`) puis lance le site avec `--open`. Node ≥ 22.12 (`.nvmrc`).

### Ce qui est fait

- `nos-fiches/` : le site en Vue 3 + TypeScript strict + Vite + Tailwind 4 + XState + GSAP + vue-i18n + zod. Toutes les fonctions de l'ancien artefact y sont : galerie (recettes les plus commandées d'abord, recherche, filtres), fiche (badge cœur et remplacements, mot sur le plat, ingrédients selon le nombre de personnes, étapes, recettes avec les mêmes courses), mode cuisine pas à pas, liste de courses fusionnée, retrait d'une fiche avec annulation, liens directs `#r-<id>`.
- Ajouté le 8 novembre 2026, à la demande de papa (repris de son travail avec Aider) :
  - **Saison** de chaque recette, lue dans ses fruits, légumes et poissons frais (`engine/season.utils.ts`). Elle s'affiche à côté du temps de préparation, sur la carte et sur la fiche. Une recette sans produit de saison, ou partagée entre deux saisons, est « Toutes saisons ».
  - **Menu « Saison »** dans la galerie : « Toutes saisons » affiche tout, et la saison du moment est signalée.
  - **Trois informations séparées par recette** :
    - « commandée N fois » : fixe, tiré de l'historique HelloFresh par nos scripts (`data.json`) ;
    - **une seule rangée d'étoiles** : la « Note perso » de papa (champ `rating` des notes) ; tant qu'il n'en a pas donné, les étoiles tirées des commandes (`orders.stars`, 1 commande = 2 étoiles… 4 et plus = 5) ;
    - « reproduite N fois » : les fois où il l'a refaite à la maison (champ `cooked` des notes). **Ce compteur ne change jamais les étoiles**, il compte seulement dans le tri.
  - **Les cartes de la galerie se lisent sans se modifier** : étoiles, « commandée 7 fois · reproduite 2 fois », saison à côté du temps. On modifie sur la fiche, dans le bloc du bas : étoiles (un second appui sur sa propre étoile revient aux étoiles des commandes), « Reproduite à la maison » avec − et +, et le mot sur le plat.
  - **Tri** (menu « Trier ») : « Les plus réalisées » (commandes + reproduite) ou « Les mieux notées » (étoiles affichées). « Les préférées » = 4 étoiles ou plus.
  - Liste de courses : **« Tout retirer »**, avec « Annuler » ; **« Partager ou enregistrer la liste »** (menu de partage du téléphone, ou fichier texte dans les Téléchargements), qui propose d'ajouter +1 à « reproduite » pour les recettes de la liste.
  - Le tag « Moins de CO2 » n'est plus proposé en filtre.
- Vérifié : `npm run type-check`, `npm run lint`, `npm run build`, et `npm run dev` (480 recettes, sur ordinateur et en largeur téléphone, en clair et en sombre).
- Les données sont dans le dépôt : `nos-fiches/public/data.json` (480 recettes) et `nos-fiches/public/img/` (photos en planches). Rien à télécharger d'autre.

### Choix faits, à respecter

- **Pas de base de données.** Les recettes viennent du JSON, les notes restent dans le navigateur (localStorage, via `LocalNotesRepository`). C'est voulu. `nos-fiches/docs/database.md` n'est qu'un plan indicatif (Supabase, avec les pièges du plan gratuit) au cas où papa voudrait un jour le site sur tous ses appareils. Ne pas le lancer sans qu'on le demande.
- **Santé :** le site montre un badge cœur coloré et des remplacements d'ingrédients, **jamais de note chiffrée ni de quantité de sel**. Les conseils restent généraux et renvoient au médecin.
- `nos-fiches/public/data.json` et `img/` sont générés par les scripts de `scripts/` puis copiés avec `npm run sync-data` (dans `nos-fiches/`). Ne pas les modifier à la main.

### À lire avant de toucher au code

1. `MEMOIRE.md` (racine) : ta mémoire de projet, voir plus haut.
2. `README.md` (racine) puis `nos-fiches/README.md` : commandes et organisation du code.
3. `nos-fiches/CLAUDE.md` : règles du projet (conventions de code, vérifications avant de rendre la main, public visé).
4. `nos-fiches/docs/database.md` : seulement si on parle de mettre le site en ligne.

### Ce qui reste possible (rien n'est en cours)

- Mettre à jour les recettes après de nouvelles livraisons. C'est François qui le fait depuis son ordinateur, avec la chaîne `scripts/prefetch.mjs` → `build-data.mjs` → `build-parents.mjs`, puis `npm run sync-data`, puis un push sur `papamaman`. De ton côté : `git pull`.
- Mettre le site en ligne pour l'avoir aussi sur le téléphone : suivre `nos-fiches/docs/database.md` (base Supabase + site sur Netlify ou Cloudflare Pages). Demander l'accord de François avant, car ça passe par ses comptes.

### Si quelque chose ne marche pas

- `npm run dev` refuse de démarrer : vérifier `node --version` (22.12 ou plus).
- Page blanche ou « Les fiches n'ont pas pu être chargées » : vérifier que `nos-fiches/public/data.json` existe (`git status`, `git pull`).
- `git pull` refuse de marcher : voir « Remettre le dossier de papa d'aplomb ».
- Les notes ont disparu : elles sont liées au navigateur. Vérifier que c'est le même navigateur, et que ses données n'ont pas été effacées.
