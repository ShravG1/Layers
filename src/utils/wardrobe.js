export const WARDROBE_CATALOG = {
  top: [
    { id: 'vest',          label: 'Vest / tank top',   emoji: '🎽', warmth: 0 },
    { id: 'crop_top',      label: 'Crop top',          emoji: '🎽', warmth: 0 },
    { id: 'tshirt',        label: 'T-shirt',            emoji: '👕', warmth: 1 },
    { id: 'polo',          label: 'Polo shirt',         emoji: '👔', warmth: 1 },
    { id: 'blouse',        label: 'Blouse',             emoji: '👚', warmth: 1 },
    { id: 'bodysuit',      label: 'Bodysuit',           emoji: '🩱', warmth: 1 },
    { id: 'longsleeve',    label: 'Long-sleeve top',    emoji: '👕', warmth: 2 },
    { id: 'knit_top',      label: 'Knit / ribbed top',  emoji: '🧶', warmth: 2 },
    { id: 'thermal',       label: 'Thermal base layer', emoji: '🩲', warmth: 3 },
    { id: 'thin_hoodie',   label: 'Thin hoodie',        emoji: '🧥', warmth: 3 },
    { id: 'med_hoodie',    label: 'Medium hoodie',      emoji: '🧥', warmth: 4 },
    { id: 'thick_hoodie',  label: 'Thick hoodie',       emoji: '🧥', warmth: 5 },
    { id: 'fleece',        label: 'Fleece',             emoji: '🧶', warmth: 5 },
    { id: 'jumper',        label: 'Jumper / sweater',   emoji: '🧶', warmth: 5 },
  ],
  legs: [
    { id: 'shorts',        label: 'Shorts',             emoji: '🩳', warmth: 0 },
    { id: 'skirt',         label: 'Mini skirt',         emoji: '👗', warmth: 0 },
    { id: 'joggers',       label: 'Joggers',            emoji: '👖', warmth: 1 },
    { id: 'chinos',        label: 'Chinos',             emoji: '👖', warmth: 1 },
    { id: 'midi_skirt',    label: 'Midi skirt',         emoji: '👗', warmth: 1 },
    { id: 'dress',         label: 'Dress',              emoji: '👗', warmth: 1 },
    { id: 'jeans',         label: 'Jeans',              emoji: '👖', warmth: 2 },
    { id: 'leggings',      label: 'Leggings',           emoji: '🩱', warmth: 2 },
    { id: 'maxi_skirt',    label: 'Maxi skirt',         emoji: '👗', warmth: 2 },
    { id: 'maxi_dress',    label: 'Maxi dress',         emoji: '👗', warmth: 2 },
    { id: 'thermal_legs',  label: 'Thermal leggings',   emoji: '🩲', warmth: 3 },
  ],
  outer: [
    { id: 'windbreaker',   label: 'Windbreaker',        emoji: '🫧', warmth: 1 },
    { id: 'rain_jacket',   label: 'Rain jacket',        emoji: '🌧️',  warmth: 1 },
    { id: 'cardigan',      label: 'Cardigan',           emoji: '🧶', warmth: 2 },
    { id: 'wrap',          label: 'Wrap / shawl',       emoji: '🧣', warmth: 2 },
    { id: 'light_jacket',  label: 'Light jacket',       emoji: '🧥', warmth: 2 },
    { id: 'trench',        label: 'Trench coat',        emoji: '🥼', warmth: 3 },
    { id: 'med_jacket',    label: 'Medium jacket',      emoji: '🧥', warmth: 3 },
    { id: 'puffer',        label: 'Puffer / big jacket',emoji: '🥼', warmth: 4 },
    { id: 'heavy_coat',    label: 'Heavy coat',         emoji: '🥼', warmth: 5 },
  ],
  socks: [
    { id: 'no_show_socks', label: 'No-show socks',      emoji: '🧦', warmth: 0 },
    { id: 'sport_socks',   label: 'Sport socks',        emoji: '🧦', warmth: 1 },
    { id: 'thick_socks',   label: 'Thick socks',        emoji: '🧦', warmth: 2 },
  ],
  extras: [
    { id: 'cap',           label: 'Cap',                emoji: '🧢' },
    { id: 'beanie',        label: 'Beanie',             emoji: '🎿' },
    { id: 'sunglasses',    label: 'Sunglasses',         emoji: '🕶️' },
    { id: 'scarf',         label: 'Scarf',              emoji: '🧣' },
    { id: 'gloves',        label: 'Gloves',             emoji: '🧤' },
    { id: 'umbrella',      label: 'Umbrella',           emoji: '☂️' },
    { id: 'rain_coat',     label: 'Raincoat',           emoji: '🌂' },
    { id: 'backpack',      label: 'Backpack',           emoji: '🎒' },
  ],
}

export const ITEM_BY_ID = Object.fromEntries(
  Object.values(WARDROBE_CATALOG).flat().map(i => [i.id, i])
)

export const DEFAULT_WARDROBE = Object.values(WARDROBE_CATALOG)
  .flat()
  .map(i => i.id)

export function pickByWarmth(category, ownedIds, targetWarmth) {
  const ownedSet = new Set(ownedIds)
  const items = WARDROBE_CATALOG[category].filter(i => ownedSet.has(i.id))
  if (!items.length) return null
  return items.reduce((best, cur) =>
    Math.abs(cur.warmth - targetWarmth) < Math.abs(best.warmth - targetWarmth) ? cur : best
  )
}

export const BUCKET_TARGETS = {
  sub8:    { top: 5, legs: 2, outer: 5, socks: 2 },
  '8to12': { top: 4, legs: 2, outer: 3, socks: 1 },
  '12to16':{ top: 3, legs: 1, outer: 1, socks: 1 },
  '16to20':{ top: 2, legs: 1, outer: -1, socks: 0 },
  '20to24':{ top: 1, legs: 0, outer: -1, socks: 0 },
  above24: { top: 0, legs: 0, outer: -1, socks: 0 },
}

export const EMOJI_PICKER_OPTIONS = [
  '👕','🧥','🥼','🧶','👔','🎽','👖','🩳','🧦','👟','🥾',
  '🧢','🎿','🕶️','🧣','🧤','☂️','🌂','🎒','🩱','🩲',
  '👗','👘','🥻','🩴','👒','⛑️','🪖','🧳','💼',
]
