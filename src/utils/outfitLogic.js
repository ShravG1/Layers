// Outfit recommendation engine
// Primary driver: apparent_temperature (feels-like), NOT raw temperature

// Temp bucket boundaries (°C). Preference offset shifts these.
const BUCKETS = [
  { max: 8,  label: 'sub8' },
  { max: 12, label: '8to12' },
  { max: 16, label: '12to16' },
  { max: 20, label: '16to20' },
  { max: 24, label: '20to24' },
  { max: Infinity, label: 'above24' },
]

// Default outfit per bucket
const DEFAULT_OUTFITS = {
  sub8:    { top: 'jumper',          legs: 'jeans',   outer: 'heavy coat', extras: ['scarf', 'gloves'] },
  '8to12': { top: 'hoodie',          legs: 'jeans',   outer: 'coat',       extras: [] },
  '12to16':{ top: 'hoodie',          legs: 'joggers', outer: 'light jacket',extras: [] },
  '16to20':{ top: 'long-sleeve top', legs: 'joggers', outer: null,         extras: [] },
  '20to24':{ top: 't-shirt',         legs: 'shorts',  outer: null,         extras: [] },
  above24: { top: 'vest',            legs: 'shorts',  outer: null,         extras: [] },
}

// Emoji map for each item
export const ITEM_EMOJI = {
  'vest':            '🎽',
  't-shirt':         '👕',
  'long-sleeve top': '👕',
  'hoodie':          '🧥',
  'jumper':          '🧶',
  'shorts':          '🩳',
  'joggers':         '👖',
  'jeans':           '👖',
  'light jacket':    '🧥',
  'coat':            '🧥',
  'heavy coat':      '🥼',
  'cap':             '🧢',
  'umbrella/raincoat':'☂️',
  'scarf':           '🧣',
  'gloves':          '🧤',
  // alternatives
  'long-sleeve':     '👕',
}

// All possible clothing items (for WhatIWore multi-select)
export const ALL_ITEMS = [
  'vest', 't-shirt', 'long-sleeve top', 'hoodie', 'jumper',
  'shorts', 'joggers', 'jeans',
  'light jacket', 'coat', 'heavy coat',
  'cap', 'umbrella/raincoat', 'scarf', 'gloves',
]

// Get the bucket label for a given feels-like temp + preference offset
export function getBucket(feelsLike, offset = 0) {
  // Offset shifts the perceived temperature:
  // Run Warm (+3): at 14°C body behaves like 17°C → treat 14°C as 17°C → bucket higher
  // Run Cold (-3): at 17°C body behaves like 14°C → treat 17°C as 14°C → bucket lower
  const adjusted = feelsLike + offset
  for (const b of BUCKETS) {
    if (adjusted < b.max) return b.label
  }
  return 'above24'
}

// Layer order for nudging warmer/cooler (outer > top order)
const OUTER_LADDER = [null, 'light jacket', 'coat', 'heavy coat']
const TOP_LADDER   = ['vest', 't-shirt', 'long-sleeve top', 'hoodie', 'jumper']
const LEGS_LADDER  = ['shorts', 'joggers', 'jeans']

function nudgeWarmer(outfit) {
  const result = { ...outfit, extras: [...(outfit.extras || [])] }
  // Try to add/upgrade outer first
  const outerIdx = OUTER_LADDER.indexOf(result.outer)
  if (outerIdx < OUTER_LADDER.length - 1) {
    result.outer = OUTER_LADDER[outerIdx + 1]
    return result
  }
  // Then upgrade top
  const topIdx = TOP_LADDER.indexOf(result.top)
  if (topIdx < TOP_LADDER.length - 1) {
    result.top = TOP_LADDER[topIdx + 1]
  }
  return result
}

// Build the recommended outfit
// feelsLike: current feels-like temp (°C)
// preferences: { offset, bucketAdjustments } from localStorage
// windMph: wind speed in mph
// rainProb: precipitation probability 0-100
// isMorningOrEvening: nudge one layer warmer if true
export function buildOutfit({ feelsLike, preferences = {}, windMph = 0, rainProb = 0, isMorningOrEvening = false }) {
  const offset = preferences.offset ?? 0
  const bucket = getBucket(feelsLike, offset)

  // Start from default, then apply saved per-bucket adjustment
  const base = { ...DEFAULT_OUTFITS[bucket], extras: [...(DEFAULT_OUTFITS[bucket].extras || [])] }
  const adj = preferences.bucketAdjustments?.[bucket] ?? 0 // -1, 0, +1

  let outfit = { ...base }

  // Apply preference adjustment (warm/cold feedback learning)
  if (adj > 0) outfit = nudgeWarmer(outfit)
  if (adj < 0) {
    // nudge cooler: downgrade outer
    const outerIdx = OUTER_LADDER.indexOf(outfit.outer)
    if (outerIdx > 0) outfit.outer = OUTER_LADDER[outerIdx - 1]
  }

  // Wind >20mph → nudge one layer warmer
  if (windMph > 20) outfit = nudgeWarmer(outfit)

  // Morning/evening time nudge
  if (isMorningOrEvening) outfit = nudgeWarmer(outfit)

  // Rain/high precipitation → add umbrella
  if (rainProb > 30 && !outfit.extras.includes('umbrella/raincoat')) {
    outfit.extras = ['umbrella/raincoat', ...outfit.extras]
  }

  return { bucket, outfit }
}

// Items to display as a flat list with emoji
export function outfitItems(outfit) {
  const items = []
  if (outfit.top)   items.push({ name: outfit.top,   emoji: ITEM_EMOJI[outfit.top]   ?? '👕' })
  if (outfit.legs)  items.push({ name: outfit.legs,  emoji: ITEM_EMOJI[outfit.legs]  ?? '👖' })
  if (outfit.outer) items.push({ name: outfit.outer, emoji: ITEM_EMOJI[outfit.outer] ?? '🧥' })
  for (const e of (outfit.extras || [])) {
    items.push({ name: e, emoji: ITEM_EMOJI[e] ?? '🎒' })
  }
  return items
}

// Human-readable bucket label
export const BUCKET_LABELS = {
  sub8:    'below 8°C',
  '8to12': '8–12°C',
  '12to16':'12–16°C',
  '16to20':'16–20°C',
  '20to24':'20–24°C',
  above24: 'above 24°C',
}
