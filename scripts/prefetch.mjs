// Remplit .cache en parallèle (pages, photos, étapes, icônes) pour qu'ensuite build-data.mjs tourne sans attendre le réseau.
// Usage : node scripts/prefetch.mjs liste.txt
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE = path.join(ROOT, '.cache')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
const CONCURRENCY = 8

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

const slugFromUrl = url => url.split('/recipes/')[1].replace(/[^a-z0-9-]/gi, '')

async function pool(items, fn) {
  let next = 0
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) await fn(items[next++]).catch(e => console.warn('✗', e.message))
  }))
}

const lines = (await fs.readFile(path.resolve(ROOT, process.argv[2]), 'utf8'))
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))

const images = []
let done = 0
await pool(lines, async line => {
  for (const url of line.split(/\s+/)) {
    let html
    try {
      html = await cached(`${slugFromUrl(url)}.html`, url)
    } catch {
      continue
    }
    const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    const r = json && JSON.parse(json[1]).props?.pageProps?.ssrPayload?.recipe
    if (!r) continue
    images.push([`${r.id}-hero.jpg`, `https://img.hellofresh.com/f_auto,fl_lossy,q_auto,w_1200/hellofresh_s3${r.imagePath}`])
    ;(r.steps || []).sort((a, b) => a.index - b.index).forEach((s, i) => {
      if (s.images?.[0]?.path) images.push([`${r.id}-step${i}.jpg`, `https://media.hellofresh.com/w_750,q_auto,f_auto,c_limit,fl_lossy/hellofresh_s3${s.images[0].path}`])
    })
    for (const i of r.ingredients) if (i.imagePath) images.push([`ing-${i.id}.png`, `https://img.hellofresh.com/w_128,q_auto,f_auto/hellofresh_s3${i.imagePath}`])
    break
  }
  if (++done % 50 === 0) console.log(`pages ${done}/${lines.length}`)
})

const unique = [...new Map(images).entries()]
console.log(`${unique.length} images`)
done = 0
await pool(unique, async ([key, url]) => {
  await cached(key, url, true)
  if (++done % 500 === 0) console.log(`images ${done}/${unique.length}`)
})
console.log('fini')
