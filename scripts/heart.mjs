// Avis « cœur » d'une recette, pour une cuisine adaptée après un problème cardiaque.
// Repères : recommandations ESC 2021 de prévention cardiovasculaire (alimentation méditerranéenne, moins de sel,
// moins de graisses saturées remplacées par des graisses insaturées, poisson gras chaque semaine, viande rouge limitée,
// charcuterie à éviter) et OMS (moins de 5 g de sel par jour). Pas de chiffres affichés : seulement un badge et des remplacements.

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ')

// weight : 3 = à remplacer en priorité, 2 = à ajuster, 1 = petit plus.
// issue : ce que l'ingrédient apporte de mauvais (sert à écrire le résumé).
const SWAPS = [
  { re: /\b(bouillon cube|cube de bouillon|bouillon de (legumes|volaille|poisson|boeuf))\b/, weight: 2, issue: 'salt',
    to: 'un demi-cube de bouillon, ou un bouillon « réduit en sel », et des herbes (thym, laurier) pour le goût', why: 'un cube de bouillon contient presque la moitié du sel de la journée' },
  { re: /\b(lardons?|poitrine fumee|bacon|pancetta|chorizo|jambon sec|jambon cru|coppa|speck|chair a saucisse|saucisses?|merguez|boudin|nems)\b/, weight: 3, issue: 'salt-fat',
    to: 'des dés de blanc de poulet ou de dinde, avec une pincée de paprika fumé pour garder le goût fumé',
    why: 'la charcuterie est à la fois très salée et grasse' },
  { re: /\bjambon blanc\b/, weight: 2, issue: 'salt',
    to: 'du blanc de poulet ou de dinde cuit, ou un jambon « réduit en sel »', why: 'le jambon apporte beaucoup de sel' },
  { re: /\b(viande hachee|hache de boeuf|emince?s? de boeuf|boeuf|agneau|filet mignon de porc|medaillons de porc|emince?s? de porc|porc)\b/, weight: 2, issue: 'fat',
    to: 'du haché de volaille, ou moitié viande moitié lentilles', why: 'la viande rouge est à limiter dans la semaine' },
  { re: /\b(canette|magret|cuisse de poulet|cuisses de poulet)\b/, weight: 1, issue: 'fat',
    to: 'la même viande sans la peau (la retirer avant cuisson)', why: 'le gras est surtout dans la peau' },
  { re: /\bcreme (liquide|epaisse|fraiche|entiere)|^creme$/, weight: 2, issue: 'fat',
    to: 'du yaourt à la grecque nature (ajouté hors du feu pour qu\'il ne tranche pas) ou de la crème légère', why: 'la crème est riche en graisses saturées' },
  { re: /\bmascarpone\b/, weight: 2, issue: 'fat', to: 'de la ricotta ou du fromage blanc', why: 'le mascarpone est très gras' },
  { re: /^beurre$|\bbeurre doux\b/, weight: 2, issue: 'fat',
    to: 'de l\'huile d\'olive (un peu moins que la quantité de beurre)', why: 'l\'huile d\'olive protège les artères, le beurre non' },
  { re: /\b(burrata|mozzarella|camembert|raclette|fromage bleu|tomme|comte|cantal|cheddar|emmental|gouda|fromage rape|parmesan|parmigiano|grana padano|pecorino|fromage de chevre|chevre|feta|fromage a la grecque|labneh|fromage frais)\b/, weight: 2, issue: 'salt-fat',
    to: 'la moitié de la quantité, à garder pour le dessus, où il se voit et se goûte le plus', why: 'le fromage est salé et riche en graisses saturées' },
  { re: /\blait de coco\b/, weight: 2, issue: 'fat',
    to: 'du lait de coco allégé, ou moitié lait de coco moitié eau', why: 'le lait de coco est très riche en graisses saturées' },
  { re: /\bsauce soja\b(?!.*reduite)/, weight: 2, issue: 'salt',
    to: 'de la sauce soja réduite en sel, en en mettant la moitié, plus un trait de citron', why: 'la sauce soja est l\'un des ingrédients les plus salés' },
  { re: /\b(sauce poisson|sauce (umami )?a l huitre|sauce hoisin|sauce teriyaki|sauce asiatique|sauce miel gingembre|sauce au chili|miso|pate epicee|sauce sriracha)\b/, weight: 1, issue: 'salt',
    to: 'la moitié de la sauce, et du citron vert, du gingembre ou de la coriandre pour le goût', why: 'ces sauces toutes prêtes sont très salées' },
  { re: /\b(mayonnaise|aioli)\b/, weight: 1, issue: 'fat',
    to: 'du yaourt à la grecque avec un peu de moutarde et d\'ail', why: 'la mayonnaise est très grasse' },
  { re: /\b(pate a tarte|pate feuilletee|pate brisee)\b/, weight: 2, issue: 'fat',
    to: 'une pâte à l\'huile d\'olive, ou des feuilles de brick badigeonnées d\'huile', why: 'les pâtes toutes prêtes sont faites au beurre ou à l\'huile de palme' },
  { re: /\boignons frits\b/, weight: 1, issue: 'fat',
    to: 'des graines de courge ou de sésame grillées à sec dans la poêle', why: 'les oignons frits sont gras et salés' },
  { re: /\bcacahuetes salees\b/, weight: 1, issue: 'salt', to: 'des cacahuètes non salées', why: 'même croquant sans le sel' },
  { re: /\b(olives|capres)\b/, weight: 1, issue: 'salt', to: 'la moitié, bien rincées à l\'eau', why: 'elles sont conservées dans la saumure' },
  { re: /\bboulettes\b|\bfalafels\b/, weight: 1, issue: 'salt-fat', to: 'des boulettes maison au poulet ou aux pois chiches, cuites au four', why: 'les boulettes toutes prêtes sont salées et frites' },
]

const GOODS = [
  { re: /\b(saumon|truite|maquereau|sardines?|hareng)\b/, text: 'du poisson gras, riche en oméga-3, excellent pour le cœur' },
  { re: /\b(lieu|cabillaud|merlu|colin|dorade|bar|crevettes|thon)\b/, text: 'du poisson ou des fruits de mer, maigres' },
  { re: /\b(lentilles|pois chiches|haricots (noirs|rouges|blancs)|feves?|edamame|freekeh|boulgour)\b/, text: 'des légumineuses ou céréales riches en fibres, qui aident à faire baisser le cholestérol' },
  { re: /\b(noix(?! de (coco|muscade))|amandes|noisettes|pistaches|noix de cajou|graines de courge|graines de sesame|cacahuetes non salees)\b/, text: 'des fruits à coque ou des graines, de bons gras' },
  { re: /\bcomplet|complete|completes\b/, text: 'des céréales complètes' },
  { re: /\b(tofu|emince?s? vegetariens)\b/, text: 'des protéines végétales' },
  { re: /\bhuile d olive\b/, text: 'de l\'huile d\'olive' },
]
const VEG = /\b(carotte|poireau|epinards|brocoli|broccolini|courgette|poivron|chou|pak choi|tomate|concombre|courge|butternut|potimarron|haricots verts|champignons|fenouil|radis|salade|petits pois|patate douce|panais|chou-fleur)\b/

export function heartReview(r) {
  const swaps = []
  const goods = new Set()
  let score = 0
  const issues = { salt: [], fat: [] }
  for (const ing of r.ingredients) {
    const n = norm(ing.name)
    const rule = SWAPS.find(s => s.re.test(n))
    if (rule && !swaps.some(s => s.rule === rule)) {
      swaps.push({ rule, ingredient: ing.name.trim(), id: ing.id })
      score += rule.weight
      if (rule.issue.includes('salt')) issues.salt.push(ing.name.trim())
      if (rule.issue.includes('fat')) issues.fat.push(ing.name.trim())
    }
    for (const g of GOODS) if (g.re.test(n)) goods.add(g.text)
  }
  const veg = r.ingredients.filter(i => VEG.test(norm(i.name))).length
  if (veg >= 3) goods.add('beaucoup de légumes')

  // Valeurs par portion du site HelloFresh : servent seulement à décider du badge, jamais affichées.
  const salt = r.nutrition?.salt ?? null
  const satFat = r.nutrition?.satFat ?? null
  const salty = salt != null && salt > 2.5
  const verySalty = salt != null && salt > 4
  const fatty = satFat != null && satFat > 9
  const veryFatty = satFat != null && satFat > 15
  score += (verySalty ? 2 : salty ? 1 : 0) + (veryFatty ? 2 : fatty ? 1 : 0)

  const processed = swaps.some(s => s.rule.weight === 3)
  const level = processed || score >= 7 ? 'red' : score >= 3 ? 'orange' : 'green'

  const list = a => a.length > 1 ? `${a.slice(0, -1).join(', ')} et ${a.at(-1)}` : a[0]
  const lower = a => [...new Set(a.map(s => s.toLowerCase()))]
  const parts = []
  if (salty || issues.salt.length >= 2) parts.push(issues.salt.length ? `assez salé (${list(lower(issues.salt).slice(0, 3))})` : 'assez salé')
  if (fatty || issues.fat.length >= 2) parts.push(issues.fat.length ? `riche en graisses saturées (${list(lower(issues.fat).slice(0, 3))})` : 'riche en graisses saturées')
  let summary
  if (level === 'green') {
    summary = goods.size ? `Plat équilibré, avec ${list([...goods].slice(0, 2))}.` : 'Plat équilibré, sans ingrédient à surveiller.'
  } else if (parts.length) {
    summary = `Plat ${list(parts)}. Avec les remplacements ci-dessous, il devient bon pour le cœur.`
  } else {
    summary = 'Quelques ingrédients à remplacer pour le rendre meilleur pour le cœur.'
  }
  if (salty && !issues.salt.length) summary += ' Ne pas resaler à table.'

  return {
    level,
    summary,
    goods: [...goods].slice(0, 3),
    swaps: swaps
      .sort((a, b) => b.rule.weight - a.rule.weight)
      .slice(0, 4)
      .map(s => ({ id: s.id, ingredient: s.ingredient, to: s.rule.to, why: s.rule.why })),
  }
}
