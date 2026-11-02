// Version « parents » : part des fiches brutes de build-data.mjs (parents/raw) et écrit site-parents/
//  - la note de chaque recette selon le nombre de fois où elle a été commandée (parents/orders.json),
//  - l'avis « cœur » de chaque recette (règles de scripts/heart.mjs),
//  - les images regroupées en planches : un artefact accepte au plus 511 fichiers.
// Usage : node scripts/build-data.mjs parents/recipes.txt parents/raw && node scripts/build-parents.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { heartReview } from './heart.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const RAW = path.join(ROOT, 'parents', 'raw')
const SITE = path.join(ROOT, 'site-parents')
const IMG = path.join(SITE, 'img')

const THUMB = [360, 270, 6, 5] // largeur, hauteur, colonnes, lignes par planche (galerie)
const HERO = [720, 480, 4, 4] // photo en tête de fiche
const STEP = [480, 320] // taille d'une étape dans les planches de build-data
const STEP_ROWS = 8 // recettes par planche d'étapes

await fs.rm(IMG, { recursive: true, force: true })
await fs.mkdir(IMG, { recursive: true })

const data = JSON.parse(await fs.readFile(path.join(RAW, 'data.json'), 'utf8'))
const orders = JSON.parse(await fs.readFile(path.join(ROOT, 'parents', 'orders.json'), 'utf8'))

// Note selon le nombre de commandes : 1 fois → 2 étoiles, 2 → 3, 3 → 4, 4 et plus → 5.
const stars = count => Math.min(5, count + 1)
// Une fiche peut réunir plusieurs lignes de commandes (même recette sous deux noms) : on additionne.
const byUrl = new Map(orders.flatMap(o => o.urls.map(u => [u, o])))

for (const r of data.recipes) {
  const matched = [...new Set(r.sources.map(u => byUrl.get(u)).filter(Boolean))]
  if (!matched.length) console.warn('? pas de commande pour', r.name)
  const count = matched.reduce((n, o) => n + o.count, 0) || 1
  const last = matched.map(o => o.lastDate).sort().at(-1) || null
  r.orders = { count, stars: stars(count), last }
  delete r.sources
  r.heart = heartReview(r)
}

// Planches en grille : chaque image redimensionnée à la taille d'une case.
async function gridSheets(prefix, [w, h, cols, rows], items) {
  const per = cols * rows
  const refs = new Map()
  for (let s = 0; s * per < items.length; s++) {
    const batch = items.slice(s * per, (s + 1) * per)
    const tiles = await Promise.all(batch.map(async ({ file }, k) => ({
      input: await sharp(file).resize(w, h, { fit: 'cover' }).toBuffer(),
      left: (k % cols) * w,
      top: Math.floor(k / cols) * h,
    })))
    const name = `${prefix}-${s}.webp`
    const usedRows = Math.ceil(batch.length / cols)
    await sharp({ create: { width: w * cols, height: h * usedRows, channels: 3, background: '#e8efe3' } })
      .composite(tiles).webp({ quality: 66 }).toFile(path.join(IMG, name))
    batch.forEach(({ id }, k) => refs.set(id, [name, cols, usedRows, k % cols, Math.floor(k / cols)]))
  }
  return refs
}

const withPhoto = data.recipes.filter(r => r.photo).map(r => ({ id: r.id, file: path.join(RAW, 'img', `${r.id}.webp`) }))
const thumbs = await gridSheets('t', THUMB, withPhoto)
const heroes = await gridSheets('h', HERO, withPhoto)

// Planches d'étapes : une ligne par recette (sa bande d'étapes telle quelle).
const withSteps = data.recipes.filter(r => r.stepCount)
for (let s = 0; s * STEP_ROWS < withSteps.length; s++) {
  const batch = withSteps.slice(s * STEP_ROWS, (s + 1) * STEP_ROWS)
  const cols = Math.max(...batch.map(r => r.stepCount))
  const name = `s-${s}.webp`
  await sharp({ create: { width: STEP[0] * cols, height: STEP[1] * batch.length, channels: 3, background: '#ffffff' } })
    .composite(batch.map((r, k) => ({ input: path.join(RAW, 'img', `${r.id}-steps.webp`), left: 0, top: k * STEP[1] })))
    .webp({ quality: 62 }).toFile(path.join(IMG, name))
  batch.forEach((r, k) => { r.stepSheet = [name, cols, batch.length, k] })
}

for (const r of data.recipes) {
  r.thumb = thumbs.get(r.id) || null
  r.hero = heroes.get(r.id) || null
}
await fs.copyFile(path.join(RAW, 'img', 'ingredients.webp'), path.join(IMG, 'ingredients.webp'))

// Ordre par défaut : les plus commandées d'abord, puis les plus récentes.
data.recipes.sort((a, b) => b.orders.count - a.orders.count || (b.orders.last || '').localeCompare(a.orders.last || ''))
await fs.writeFile(path.join(SITE, 'data.json'), JSON.stringify(data))

const levels = {}
for (const r of data.recipes) levels[r.heart.level] = (levels[r.heart.level] || 0) + 1
const files = await fs.readdir(IMG)
let size = 0
for (const f of files) size += (await fs.stat(path.join(IMG, f))).size
console.log(`${data.recipes.length} recettes · cœur ${JSON.stringify(levels)} · ${files.length} images, ${(size / 1e6).toFixed(1)} Mo`)
