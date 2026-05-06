// Personal wardrobe catalog + matching helpers.
// Each item has a `warmth` score (higher = warmer). Recommendations pick
// the owned item closest to the target warmth for the current temperature.

export const WARDROBE_CATALOG = {
  legs: [
    { id: 'shorts',  label: 'Shorts',  emoji: '🩳', warmth: 0 },
    { id: 'joggers', label: 'Joggers', emoji: '👖', warmth: 1 },
    { id: 'jeans',   label: 'Jeans',   emoji: '👖', warmth: 2 },
  ],
  top: [
    { id: 'vest',         label: 'Vest / tank',     emoji: '🎽', warmth: 0 },
    { id: 'tshirt',       label: 'T-shirt',         emoji: '👕', warmth: 1 },
    { id: 'longsleeve',   label: 'Long-sleeve top', emoji: '👕', warmth: 2 },
    { id: 'thin_hoodie',  label: 'Thin hoodie',     emoji: '🧥', warmth: 3 },
    { id: 'med_hoodie',   label: 'Medium hoodie',   emoji: '🧥', warmth: 4 },
    { id: 'thick_hoodie', label: 'Thick hoodie',    emoji: '🧥', warmth: 5 },
    { id: 'jumper',       label: 'Jumper / sweater',emoji: '🧶', warmth: 5 },
  ],
  outer: [
    { id: 'windbreaker', label: 'Windbreaker',         emoji: '🧥', warmth: 1 },
    { id: 'med_jacket',  label: 'Medium jacket',       emoji: '🧥', warmth: 3 },
    { id: 'big_jacket',  label: 'Big / puffer jacket', emoji: '🥼', warmth: 5 },
  ],
  socks: [
    { id: 'sport_socks', label: 'Sport socks', emoji: '🧦', warmth: 0 },
    { id: 'thick_socks', label: 'Thick socks', emoji: '🧦', warmth: 1 },
  ],
  extras: [
    { id: 'cap',      label: 'Cap',              emoji: '🧢' },
    { id: 'scarf',    label: 'Scarf',            emoji: '🧣' },
    { id: 'gloves',   label: 'Gloves',           emoji: '🧤' },
    { id: 'umbrella', label: 'Umbrella / raincoat', emoji: '☂️' },
  ],
}

// Flat lookup
export const ITEM_BY_ID = Object.fromEntries(
  Object.values(WARDROBE_CATALOG).flat().map(i => [i.id, i])
)

// Default: own everything. User trims in onboarding/settings.
export const DEFAULT_WARDROBE = Object.values(WARDROBE_CATALOG)
  .flat()
  .map(i => i.id)

// Pick the owned item from a category whose warmth is closest to target.
// Falls back to nearest available, returns null if none owned in that category.
export function pickByWarmth(category, ownedIds, targetWarmth) {
  const ownedSet = new Set(ownedIds)
  const items = WARDROBE_CATALOG[category].filter(i => ownedSet.has(i.id))
  if (!items.length) return null
  return items.reduce((best, cur) => {
    if (!best) return cur
    return Math.abs(cur.warmth - targetWarmth) < Math.abs(best.warmth - targetWarmth) ? cur : best
  }, null)
}

// Bucket → target warmth per category
export const BUCKET_TARGETS = {
  sub8:    { top: 5, legs: 2, outer: 5, socks: 1 },
  '8to12': { top: 4, legs: 2, outer: 3, socks: 1 },
  '12to16':{ top: 3, legs: 1, outer: 1, socks: 0 },
  '16to20':{ top: 2, legs: 1, outer: -1, socks: 0 },
  '20to24':{ top: 1, legs: 0, outer: -1, socks: 0 },
  above24: { top: 0, legs: 0, outer: -1, socks: 0 },
}
