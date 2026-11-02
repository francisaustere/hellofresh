// Lit recipes.txt, récupère chaque recette sur hellofresh.fr et écrit site/data.json
// avec les images du site : photo de chaque recette, planche des étapes, planche des ingrédients.
// Usage : node scripts/build-data.mjs [liste.txt dossier-du-site]
// (par défaut recipes.txt et site, avec les fiches papier de manual/)
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE = path.join(ROOT, '.cache')
const LIST = path.resolve(ROOT, process.argv[2] || 'recipes.txt')
const SITE = path.resolve(ROOT, process.argv[3] || 'site')
const WITH_MANUAL = !process.argv[2]
const IMG = path.join(SITE, 'img')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

const HERO_W = 800
const STEP_W = 480
const STEP_H = 320
const ICON = 64
const ICON_COLS = 16

await fs.mkdir(CACHE, { recursive: true })
await fs.mkdir(IMG, { recursive: true })

async function cached(key, url, binary = false) {
  const file = path.join(CACHE, key)
  try {
    return await fs.readFile(file, binary ? undefined : 'utf8')
  } catch {}
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const data = binary ? Buffer.from(await res.arrayBuffer()) : await res.text()
  await fs.writeFile(file, data)
  return data
}

function decode(s) {
  return s
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
}

function stripTags(s) {
  return decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
}

// Une étape HelloFresh est une liste <li> suivie parfois d'un <p> de conseil.
function parseStep(html) {
  const items = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => stripTags(m[1])).filter(Boolean)
  const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => stripTags(m[1])).filter(Boolean)
  if (!items.length && !paragraphs.length) {
    const text = stripTags(html)
    return { items: text ? [text] : [], tips: [] }
  }
  return { items, tips: paragraphs }
}

function minutes(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || '')
  return m ? (+m[1] || 0) * 60 + (+m[2] || 0) : null
}

// Étiquettes du site HelloFresh : on fusionne les doublons et on retire les étiquettes internes.
const TAG_RENAME = { 'Rapido': 'Rapide', 'Oven-free': 'Sans four', 'Famille': 'Familial' }
const TAG_DROP = new Set(['SEO'])
function cleanTags(tags) {
  return [...new Set(tags.map(t => TAG_RENAME[t] || t).filter(t => !TAG_DROP.has(t)))]
}

function slugFromUrl(url) {
  return url.split('/recipes/')[1].replace(/[^a-z0-9-]/gi, '')
}

// Une ligne peut donner plusieurs URL (versions d'une même recette) : on prend la première qui répond.
const lines = (await fs.readFile(LIST, 'utf8'))
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

const recipes = []
const seen = new Map() // id ou nom → recette gardée
const icons = new Map() // ingredient id -> imagePath

// Valeurs par portion du site HelloFresh
const NUTRIENTS = { 'Sel': 'salt', 'Matières grasses': 'fat', 'dont acides gras saturés': 'satFat', 'dont sucres': 'sugar', 'Fibres alimentaires': 'fiber', 'Protéines': 'protein' }

for (const line of lines) {
  let url, html
  for (const candidate of line.split(/\s+/)) {
    try {
      html = await cached(`${slugFromUrl(candidate)}.html`, candidate)
      url = candidate
      break
    } catch (e) {
      console.warn('✗', candidate, e.message)
    }
  }
  if (!html) continue
  const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  const r = json && JSON.parse(json[1]).props?.pageProps?.ssrPayload?.recipe
  if (!r) {
    console.warn('✗ pas de données', url)
    continue
  }
  // Une recette revient sous plusieurs versions (une par semaine où HelloFresh l'a proposée) :
  // on garde la première ligne de recipes.txt pour chaque nom, et on note les URL des autres dans sources.
  const nameKey = r.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\bet\b/g, '&').replace(/[^a-z0-9&]+/g, ' ').trim()
  const kept = seen.get(r.id) || seen.get(nameKey)
  if (kept) {
    kept.sources.push(...line.split(/\s+/))
    console.log('= doublon', r.name)
    continue
  }

  const ingredients = r.ingredients.map(i => {
    if (i.imagePath) icons.set(i.id, i.imagePath)
    return {
      id: i.id,
      family: i.familyId || i.id,
      name: i.name.trim(),
      shipped: i.shipped !== false,
      allergens: (i.allergens || []).map(a => a.name || a).filter(Boolean),
    }
  })

  const yields = {}
  for (const y of r.yields || []) {
    yields[y.yields] = Object.fromEntries(y.ingredients.map(i => [i.id, [i.amount, i.unit]]))
  }

  const steps = (r.steps || []).sort((a, b) => a.index - b.index).map(s => ({
    ...parseStep(s.instructionsMarkdown || s.instructions || ''),
    image: s.images?.[0]?.path || null,
  }))

  // Photo principale
  let hasPhoto = false
  try {
    const hero = await cached(`${r.id}-hero.jpg`, `https://img.hellofresh.com/f_auto,fl_lossy,q_auto,w_1200/hellofresh_s3${r.imagePath}`, true)
    await sharp(hero).resize(HERO_W).webp({ quality: 70 }).toFile(path.join(IMG, `${r.id}.webp`))
    hasPhoto = true
  } catch (e) {
    console.warn('  pas de photo', e.message)
  }

  // Planche des étapes, une image à côté de l'autre
  const stepImgs = []
  for (const [i, s] of steps.entries()) {
    if (!s.image) continue
    try {
      const buf = await cached(`${r.id}-step${i}.jpg`, `https://media.hellofresh.com/w_750,q_auto,f_auto,c_limit,fl_lossy/hellofresh_s3${s.image}`, true)
      stepImgs.push({ i, buf: await sharp(buf).resize(STEP_W, STEP_H, { fit: 'cover' }).toBuffer() })
    } catch (e) {
      console.warn('  étape sans image', i + 1, e.message)
    }
  }
  steps.forEach(s => { delete s.image })
  if (stepImgs.length) {
    await sharp({ create: { width: STEP_W * stepImgs.length, height: STEP_H, channels: 3, background: '#ffffff' } })
      .composite(stepImgs.map((s, k) => ({ input: s.buf, left: k * STEP_W, top: 0 })))
      .webp({ quality: 62 })
      .toFile(path.join(IMG, `${r.id}-steps.webp`))
    stepImgs.forEach((s, k) => { steps[s.i].sprite = k })
  }

  recipes.push({
    id: r.id,
    name: r.name.trim(),
    headline: (r.headline || '').trim(),
    url: r.websiteUrl || url,
    sources: line.split(/\s+/),
    totalTime: minutes(r.totalTime),
    prepTime: minutes(r.prepTime),
    difficulty: r.difficulty,
    tags: cleanTags((r.tags || []).map(t => t.name).filter(Boolean)),
    kcal: Math.round(r.nutrition?.find(n => n.type === 'energy' || /kcal/i.test(n.unit || ''))?.amount || 0) || null,
    nutrition: Object.fromEntries((r.nutrition || []).filter(n => NUTRIENTS[n.name]).map(n => [NUTRIENTS[n.name], n.amount])),
    allergens: (r.allergens || []).map(a => a.name).filter(Boolean),
    utensils: (r.utensils || []).map(u => u.name).filter(Boolean),
    photo: hasPhoto,
    stepCount: stepImgs.length,
    ingredients,
    yields,
    steps,
  })
  seen.set(r.id, recipes.at(-1))
  seen.set(nameKey, recipes.at(-1))
  console.log('✓', r.name)
}

// Recettes saisies à la main (fiches papier qui ne sont plus sur hellofresh.fr) : manual/*.json,
// avec leurs images recadrées dans les photos de manual/photos/.
const MANUAL = path.join(ROOT, 'manual')
const nameKey = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const knownIngredients = new Map()
for (const r of recipes) for (const i of r.ingredients) if (icons.has(i.id)) knownIngredients.set(nameKey(i.name), i)

async function cropImage(spec) {
  const [left, top, width, height] = spec.crop
  let img = sharp(path.join(MANUAL, 'photos', spec.file)).extract({ left, top, width, height })
  if (spec.rotate) img = sharp(await img.toBuffer()).rotate(spec.rotate)
  return img.toBuffer()
}

for (const file of WITH_MANUAL ? (await fs.readdir(MANUAL).catch(() => [])).filter(f => f.endsWith('.json')).sort() : []) {
  const m = JSON.parse(await fs.readFile(path.join(MANUAL, file), 'utf8'))
  if (recipes.some(r => r.id === m.id)) continue

  const ingredients = m.ingredients.map(i => {
    const known = knownIngredients.get(nameKey(i.name))
    const id = known?.id || `manuel-${nameKey(i.name).replace(/ /g, '-')}`
    return { id, family: id, name: i.name, shipped: i.shipped !== false, allergens: [], amount: i.amount, unit: i.unit }
  })
  // Les fiches donnent les quantités pour une taille de portion : on en déduit les autres
  const yields = {}
  for (let n = 1; n <= 4; n++) {
    yields[n] = Object.fromEntries(ingredients.map(i => [i.id, [i.amount == null ? null : Math.round(i.amount * n / m.servings * 100) / 100, i.unit]]))
  }

  await sharp(await cropImage(m.images.hero)).resize(HERO_W).webp({ quality: 70 }).toFile(path.join(IMG, `${m.id}.webp`))
  const stepImgs = await Promise.all(m.images.steps.map(async s => sharp(await cropImage(s)).resize(STEP_W, STEP_H, { fit: 'cover' }).toBuffer()))
  await sharp({ create: { width: STEP_W * stepImgs.length, height: STEP_H, channels: 3, background: '#ffffff' } })
    .composite(stepImgs.map((buf, k) => ({ input: buf, left: k * STEP_W, top: 0 })))
    .webp({ quality: 62 })
    .toFile(path.join(IMG, `${m.id}-steps.webp`))

  recipes.push({
    id: m.id,
    name: m.name,
    headline: m.headline,
    url: null,
    source: m.source,
    totalTime: m.totalTime,
    prepTime: m.prepTime,
    difficulty: m.difficulty,
    tags: m.tags,
    kcal: m.kcal,
    allergens: m.allergens,
    utensils: m.utensils,
    photo: true,
    stepCount: stepImgs.length,
    ingredients: ingredients.map(({ amount, unit, ...i }) => i),
    yields,
    steps: m.steps.map((s, k) => ({ items: s.items, tips: s.tips || [], sprite: k < stepImgs.length ? k : undefined })),
  })
  console.log('✓ (fiche papier)', m.name)
}

// Planche des icônes d'ingrédients, en grille
const iconIds = [...icons.keys()]
const iconIndex = {}
const tiles = []
for (const id of iconIds) {
  try {
    const buf = await cached(`ing-${id}.png`, `https://img.hellofresh.com/w_128,q_auto,f_auto/hellofresh_s3${icons.get(id)}`, true)
    const k = tiles.length
    tiles.push({
      input: await sharp(buf).resize(ICON, ICON, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
      left: (k % ICON_COLS) * ICON,
      top: Math.floor(k / ICON_COLS) * ICON,
    })
    iconIndex[id] = k
  } catch {}
}
if (tiles.length) {
  const rows = Math.ceil(tiles.length / ICON_COLS)
  await sharp({ create: { width: ICON * ICON_COLS, height: ICON * rows, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(tiles)
    .webp({ quality: 80 })
    .toFile(path.join(IMG, 'ingredients.webp'))
}

recipes.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
await fs.writeFile(path.join(SITE, 'data.json'), JSON.stringify({ icons: { size: ICON, cols: ICON_COLS, index: iconIndex }, recipes }))
console.log(`\n${recipes.length} recettes, ${tiles.length} icônes d'ingrédients`)
