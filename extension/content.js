// Mes fiches → Carrefour
// Lit la liste de courses envoyée par le site (#mesfiches=… dans l'adresse), propose un produit Carrefour
// par ingrédient, retient tes choix, puis ajoute tout au panier avec l'API que carrefour.fr utilise lui-même.
// L'extension ne choisit pas de créneau et ne passe jamais commande.

(() => {
  const HASH_KEY = 'mesfiches='
  const HEADERS = { accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' }
  const MAX_QTY = 10

  const state = {
    list: null,      // { items: [{ key, name, q, need: [{ amount, unit }], recipes }] }
    map: {},         // ingredient key -> produit Carrefour retenu
    qty: {},         // ingredient key -> nombre de paquets
    skip: {},        // ingredient key -> true quand on l'a déjà à la maison
    results: {},     // ingredient key -> résultats de recherche
    picking: null,   // ingredient key en cours de choix
    busy: false,
    message: null,   // { kind: 'ok' | 'error' | 'info', text }
    collapsed: false,
  }

  /* Stockage */
  const load = keys => new Promise(r => chrome.storage.local.get(keys, r))
  const save = obj => new Promise(r => chrome.storage.local.set(obj, r))

  function decodeList(b64) {
    const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  }

  /* API carrefour.fr (même origine, avec ta session) */
  async function api(path, opts = {}) {
    const res = await fetch(path, { credentials: 'include', ...opts, headers: { ...HEADERS, ...(opts.headers || {}) } })
    let body = null
    try { body = await res.json() } catch {}
    return { ok: res.ok, status: res.status, body }
  }

  async function search(q) {
    const { ok, body } = await api(`/s?q=${encodeURIComponent(q)}`)
    if (!ok || !body?.data) return []
    return body.data
      .filter(p => p.type === 'product')
      .map(p => {
        const a = p.attributes
        const offer = a.offers?.[a.ean]?.[a.offerServiceId]?.attributes
        return {
          ean: a.ean,
          title: a.title,
          format: a.format || '',
          packaging: a.packaging || '',
          image: (a.images?.paths?.[0] || '').replace('FORMAT', '200x200'),
          price: offer?.price?.price ?? null,
          perUnit: offer?.price?.perUnitLabel || '',
          purchasable: offer?.availability?.purchasable !== false,
          link: p.links?.self || '',
        }
      })
      .filter(p => p.purchasable)
      .slice(0, 8)
  }

  async function getCart() {
    const { ok, body } = await api('/api/cart')
    return ok ? body?.cart : null
  }

  // counter = quantité totale voulue pour ce produit dans le panier
  async function patchCart(cart, items) {
    return api('/api/cart', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ basketServiceId: cart.facilityServiceId, counter: i.counter, ean: i.ean, subBasketType: cart.type })),
      }),
    })
  }

  /* Nombre de paquets : on compare le besoin de la recette au format du produit quand les unités le permettent */
  const TO_BASE = { g: ['g', 1], kg: ['g', 1000], ml: ['ml', 1], cl: ['ml', 10], l: ['ml', 1000] }
  function packSize(p) {
    const m = /(\d+(?:[.,]\d+)?)\s*(kg|g|cl|ml|l)\b/i.exec(`${p.format} ${p.packaging}`)
    if (!m) return null
    const [base, f] = TO_BASE[m[2].toLowerCase()]
    return { base, value: parseFloat(m[1].replace(',', '.')) * f }
  }
  function suggestQty(item, p) {
    const pack = packSize(p)
    if (!pack) return 1
    const need = (item.need || []).reduce((s, n) => {
      const t = TO_BASE[String(n.unit || '').toLowerCase()]
      return t && t[0] === pack.base ? s + n.amount * t[1] : s
    }, 0)
    return need ? Math.min(MAX_QTY, Math.max(1, Math.ceil(need / pack.value - 0.05))) : 1
  }

  /* Interface : panneau dans un shadow DOM pour ne pas hériter des styles de carrefour.fr */
  const host = document.createElement('div')
  host.id = 'mesfiches-carrefour'
  const root = host.attachShadow({ mode: 'open' })

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    .panel { position: fixed; top: 12px; right: 12px; bottom: 12px; width: min(420px, calc(100vw - 24px)); z-index: 2147483646;
      background: #f4f7f1; color: #1d291f; border-radius: 16px; box-shadow: 0 10px 40px rgb(0 0 0 / .25); display: flex; flex-direction: column; overflow: hidden; font-size: 14px; }
    .panel.min { bottom: auto; }
    header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #1d291f; color: #f4f7f1; }
    header b { font-size: 16px; flex: 1; }
    header button { border: 0; background: rgb(255 255 255 / .15); color: inherit; border-radius: 999px; padding: 6px 10px; cursor: pointer; font-size: 13px; }
    .body { overflow: auto; flex: 1; padding: 12px 16px; display: grid; gap: 10px; align-content: start; }
    .msg { border-radius: 10px; padding: 10px 12px; line-height: 1.4; }
    .msg.ok { background: #dcefd9; } .msg.error { background: #fbe1dc; } .msg.info { background: #fbefc2; }
    .msg a { color: inherit; font-weight: 700; }
    .row { background: #fff; border-radius: 12px; padding: 10px; display: grid; gap: 8px; }
    .row.skip { opacity: .5; }
    .top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
    .ing { font-weight: 700; }
    .need { color: #5c6a5e; font-size: 12px; }
    .prod { display: grid; grid-template-columns: 52px 1fr auto; gap: 10px; align-items: center; }
    .prod img { width: 52px; height: 52px; object-fit: contain; border-radius: 8px; background: #fff; }
    .title { font-size: 13px; line-height: 1.25; }
    .sub { color: #5c6a5e; font-size: 12px; }
    .qty { display: inline-flex; align-items: center; gap: 4px; }
    .qty button { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #dbe3d6; background: #fff; cursor: pointer; font-size: 16px; line-height: 1; }
    .qty span { min-width: 18px; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }
    .links { display: flex; gap: 12px; flex-wrap: wrap; }
    .link { border: 0; background: none; padding: 0; color: #2e6a3a; font-weight: 600; cursor: pointer; text-decoration: underline; font-size: 13px; }
    .choices { display: grid; gap: 6px; }
    .choice { display: grid; grid-template-columns: 44px 1fr auto; gap: 8px; align-items: center; text-align: left; border: 1.5px solid #dbe3d6; background: #fff; border-radius: 10px; padding: 6px; cursor: pointer; }
    .choice:hover { border-color: #2e6a3a; }
    .choice img { width: 44px; height: 44px; object-fit: contain; }
    .price { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .search { display: flex; gap: 6px; }
    .search input { flex: 1; min-width: 0; border: 1.5px solid #dbe3d6; border-radius: 8px; padding: 6px 8px; font-size: 13px; }
    footer { padding: 12px 16px; border-top: 1px solid #dbe3d6; display: grid; gap: 8px; background: #f4f7f1; }
    .go { border: 0; border-radius: 999px; padding: 14px; font-weight: 700; font-size: 15px; background: #2e6a3a; color: #fff; cursor: pointer; }
    .go:disabled { opacity: .5; cursor: default; }
    .hint { color: #5c6a5e; font-size: 12px; text-align: center; }
  `

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const euro = n => n == null ? '' : n.toFixed(2).replace('.', ',') + ' €'
  const fmtNeed = need => (need || []).map(n => `${String(Math.round(n.amount * 100) / 100).replace('.', ',')} ${n.unit || ''}`.trim()).join(' + ')

  function render() {
    if (!state.list) { host.remove(); return }
    if (!host.isConnected) document.documentElement.append(host)
    const items = state.list.items
    const ready = items.filter(i => !state.skip[i.key] && state.map[i.key])
    const missing = items.filter(i => !state.skip[i.key] && !state.map[i.key])
    const total = ready.reduce((s, i) => s + (state.map[i.key].price || 0) * (state.qty[i.key] || 1), 0)

    root.innerHTML = `<style>${CSS}</style>
      <div class="panel ${state.collapsed ? 'min' : ''}">
        <header>
          <b>Mes fiches · ${items.length} produits</b>
          <button data-act="collapse">${state.collapsed ? 'Ouvrir' : 'Réduire'}</button>
          <button data-act="close" aria-label="Fermer">✕</button>
        </header>
        ${state.collapsed ? '' : `
        <div class="body">
          ${state.message ? `<div class="msg ${state.message.kind}">${state.message.html || esc(state.message.text)}</div>` : ''}
          ${items.map(rowHtml).join('')}
        </div>
        <footer>
          <button class="go" data-act="add" ${state.busy || !ready.length ? 'disabled' : ''}>
            ${state.busy ? 'Ajout en cours…' : `Ajouter ${ready.length} produit${ready.length > 1 ? 's' : ''} au panier · ${euro(total)}`}
          </button>
          <div class="hint">${missing.length ? `${missing.length} ingrédient${missing.length > 1 ? 's' : ''} sans produit choisi. ` : ''}Tu choisis le créneau et tu commandes toi-même.</div>
        </footer>`}
      </div>`
  }

  function rowHtml(i) {
    const p = state.map[i.key]
    const skip = state.skip[i.key]
    const head = `<div class="top"><span class="ing">${esc(i.name)}</span><span class="need">${esc(fmtNeed(i.need))}${i.recipes > 1 ? ` · ${i.recipes} recettes` : ''}</span></div>`
    if (skip) return `<div class="row skip">${head}<div class="links"><button class="link" data-act="unskip" data-key="${esc(i.key)}">Finalement, je l'achète</button></div></div>`
    if (state.picking === i.key || !p) {
      const res = state.results[i.key]
      return `<div class="row">${head}
        <form class="search" data-key="${esc(i.key)}"><input name="q" value="${esc(i.q)}" aria-label="Chercher chez Carrefour"><button class="link" type="submit">Chercher</button></form>
        <div class="choices">${res == null ? '<span class="sub">Recherche…</span>'
          : res.length ? res.map((r, k) => `<button class="choice" data-act="pick" data-key="${esc(i.key)}" data-k="${k}">
              <img src="${esc(r.image)}" alt=""><span><span class="title">${esc(r.title)}</span><br><span class="sub">${esc(r.format)} · ${esc(r.perUnit)}</span></span><span class="price">${euro(r.price)}</span></button>`).join('')
          : '<span class="sub">Aucun produit trouvé. Essaie un autre mot.</span>'}</div>
        <div class="links">${p ? `<button class="link" data-act="cancel" data-key="${esc(i.key)}">Garder ${esc(p.title)}</button>` : ''}<button class="link" data-act="skip" data-key="${esc(i.key)}">Je l'ai déjà</button></div>
      </div>`
    }
    const q = state.qty[i.key] || 1
    return `<div class="row">${head}
      <div class="prod"><img src="${esc(p.image)}" alt="">
        <span><span class="title">${esc(p.title)}</span><br><span class="sub">${esc(p.format)} · ${euro(p.price)}</span></span>
        <span class="qty"><button data-act="minus" data-key="${esc(i.key)}" aria-label="Un de moins">−</button><span>${q}</span><button data-act="plus" data-key="${esc(i.key)}" aria-label="Un de plus">+</button></span>
      </div>
      <div class="links"><button class="link" data-act="change" data-key="${esc(i.key)}">Changer de produit</button><button class="link" data-act="skip" data-key="${esc(i.key)}">Je l'ai déjà</button></div>
    </div>`
  }

  async function runSearch(item, q) {
    state.results[item.key] = null
    render()
    try { state.results[item.key] = await search(q) } catch { state.results[item.key] = [] }
    render()
  }

  async function addAll() {
    const items = state.list.items.filter(i => !state.skip[i.key] && state.map[i.key])
    state.busy = true; state.message = null; render()
    try {
      const cart = await getCart()
      if (!cart?.facilityServiceId) {
        state.message = {
          kind: 'error',
          text: 'Impossible de lire ton panier Carrefour. Vérifie que tu es connecté et que tu as choisi Drive ou Livraison (bouton en haut du site), puis réessaie.',
        }
        return
      }
      const current = {}
      for (const c of cart.items || []) for (const p of c.products || []) current[p.product?.attributes?.ean] = p.counter
      const lines = new Map()
      for (const i of items) {
        const ean = state.map[i.key].ean
        lines.set(ean, (lines.get(ean) || current[ean] || 0) + (state.qty[i.key] || 1))
      }
      const payload = [...lines].map(([ean, counter]) => ({ ean, counter }))
      let res = await patchCart(cart, payload)
      const failed = []
      if (!res.ok) {
        // un produit indisponible fait échouer tout l'envoi : on réessaie produit par produit, en espaçant
        // les envois pour ne pas déclencher la limite de Carrefour
        for (const line of payload) {
          await sleep(400)
          const r = await patchCart(cart, [line])
          if (!r.ok) failed.push({ ean: line.ean, why: describe(r) })
        }
      }
      const ok = payload.length - failed.length
      const nameOf = ean => items.find(i => state.map[i.key].ean === ean)?.name || ean
      const reasons = [...new Set(failed.map(f => f.why))]
      state.message = {
        kind: !failed.length ? 'ok' : ok ? 'info' : 'error',
        html: (ok ? `${ok} produit${ok > 1 ? 's' : ''} ajouté${ok > 1 ? 's' : ''} au panier. ` : 'Aucun produit ajouté. ')
          + (failed.length ? `Refusés par Carrefour : ${esc(failed.map(f => nameOf(f.ean)).join(', '))}. ` : '')
          + (failed.length ? `<br><small>Réponse de Carrefour : ${esc(reasons.join(' / '))} · panier ${esc(cart.type)} ${esc(cart.pickupMode || '')}, magasin ${esc(cart.storeRef || '?')}</small><br>` : '')
          + (failed.length && !ok ? 'Vérifie que tu es connecté et que Drive ou Livraison est bien choisi, sinon envoie-moi cette réponse. ' : '')
          + (failed.length && ok ? 'Change de produit pour ceux-là, ils sont peut-être indisponibles dans ton magasin. ' : '')
          + '<a href="/mon-panier">Voir mon panier</a>',
      }
    } catch (e) {
      state.message = { kind: 'error', text: `L'ajout a échoué avant d'arriver à Carrefour (${e.message}). Recharge la page et réessaie.` }
    } finally {
      state.busy = false
      render()
    }
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  // Résumé lisible d'un refus : statut HTTP et code d'erreur renvoyé par carrefour.fr
  function describe(r) {
    const err = r.body?.errors?.[0] || r.body?.meta?.errors?.[0]
    const code = err?.code || err?.title || ''
    const detail = err?.detail && err.detail !== code ? ` (${err.detail})` : ''
    return `${r.status}${code ? ' ' + code : ''}${detail}`
  }

  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]')
    if (!b) return
    e.preventDefault()
    const key = b.dataset.key
    const item = key && state.list.items.find(i => i.key === key)
    switch (b.dataset.act) {
      case 'close': state.list = null; await save({ pending: null }); return render()
      case 'collapse': state.collapsed = !state.collapsed; return render()
      case 'pick': {
        const p = state.results[key][+b.dataset.k]
        state.map[key] = p
        state.qty[key] = suggestQty(item, p)
        state.picking = null
        await save({ map: state.map })
        return render()
      }
      case 'change': state.picking = key; return state.results[key] ? render() : runSearch(item, item.q)
      case 'cancel': state.picking = null; return render()
      case 'skip': state.skip[key] = true; state.picking = null; return render()
      case 'unskip': delete state.skip[key]; return state.map[key] || state.results[key] ? render() : runSearch(item, item.q)
      case 'plus': state.qty[key] = Math.min(MAX_QTY, (state.qty[key] || 1) + 1); return render()
      case 'minus': state.qty[key] = Math.max(1, (state.qty[key] || 1) - 1); return render()
      case 'add': return addAll()
    }
  })
  root.addEventListener('submit', e => {
    e.preventDefault()
    const form = e.target
    const item = state.list.items.find(i => i.key === form.dataset.key)
    const q = form.elements.q.value.trim()
    if (item && q) runSearch(item, q)
  })

  async function start() {
    let incoming = null
    const i = location.hash.indexOf(HASH_KEY)
    if (i >= 0) {
      try { incoming = decodeList(location.hash.slice(i + HASH_KEY.length)) } catch {}
      history.replaceState(null, '', location.pathname + location.search)
    }
    const stored = await load(['pending', 'map'])
    state.map = stored.map || {}
    state.list = incoming || stored.pending || null
    if (incoming) await save({ pending: incoming })
    if (!state.list?.items?.length) return
    for (const it of state.list.items) {
      if (state.map[it.key]) state.qty[it.key] = suggestQty(it, state.map[it.key])
    }
    render()
    // recherche des ingrédients sans produit retenu, une à la fois pour ne pas surcharger le site
    for (const it of state.list.items) {
      if (!state.map[it.key]) await runSearch(it, it.q)
    }
  }

  start()
})()
