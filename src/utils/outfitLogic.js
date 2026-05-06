// Outfit recommendation engine
// Driven by apparent_temperature (feels-like) and the user's personal wardrobe.

import {
  WARDROBE_CATALOG,
  ITEM_BY_ID,
  BUCKET_TARGETS,
  pickByWarmth,
} from './wardrobe.js'

const BUCKETS = [
  { max: 8,  label: 'sub8' },
  { max: 12, label: '8to12' },
  { max: 16, label: '12to16' },
  { max: 20, label: '16to20' },
  { max: 24, label: '20to24' },
  { max: Infinity, label: 'above24' },
]

export function getBucket(feelsLike, offset = 0) {
  const adjusted = feelsLike + offset
  for (const b of BUCKETS) {
    if (adjusted < b.max) return b.label
  }
  return 'above24'
}

// Build the recommended outfit from the user's wardrobe.
// preferences: { offset, bucketAdjustments, wardrobe: [itemIds] }
export function buildOutfit({
  feelsLike,
  preferences = {},
  windMph = 0,
  rainProb = 0,
  uvIndex = 0,
  isMorningOrEvening = false,
}) {
  const offset = preferences.offset ?? 0
  const bucket = getBucket(feelsLike, offset)
  const owned  = preferences.wardrobe ?? []
  const adj    = preferences.bucketAdjustments?.[bucket] ?? 0 // -1, 0, +1

  const targets = { ...BUCKET_TARGETS[bucket] }

  // Apply learned adjustment + environmental nudges
  let warmthShift = adj
  if (windMph > 20) warmthShift += 1
  if (isMorningOrEvening) warmthShift += 1

  if (warmthShift !== 0) {
    targets.top   += warmthShift
    targets.outer += warmthShift
    targets.socks += warmthShift > 0 ? 1 : 0
  }

  const top   = pickByWarmth('top',   owned, targets.top)
  const legs  = pickByWarmth('legs',  owned, targets.legs)
  const outer = targets.outer < 0 ? null : pickByWarmth('outer', owned, targets.outer)
  const socks = pickByWarmth('socks', owned, targets.socks)

  const extras = []
  if (rainProb > 30 && owned.includes('umbrella')) extras.push(ITEM_BY_ID.umbrella)
  if (bucket === 'sub8') {
    if (owned.includes('scarf'))  extras.push(ITEM_BY_ID.scarf)
    if (owned.includes('gloves')) extras.push(ITEM_BY_ID.gloves)
  }
  if (uvIndex >= 6 && owned.includes('cap')) extras.push(ITEM_BY_ID.cap)

  const outfit = { top, legs, outer, socks, extras }
  return { bucket, outfit }
}

// Items to display as a flat list (top, legs, outer, [socks tiny], extras)
function toDisplay(item, tier) {
  return { id: item.id, name: item.label, emoji: item.emoji, tier }
}
export function outfitItems(outfit) {
  const items = []
  if (outfit.top)   items.push(toDisplay(outfit.top,   'main'))
  if (outfit.legs)  items.push(toDisplay(outfit.legs,  'main'))
  if (outfit.outer) items.push(toDisplay(outfit.outer, 'main'))
  for (const e of (outfit.extras || [])) {
    items.push(toDisplay(e, 'extra'))
  }
  if (outfit.socks) items.push(toDisplay(outfit.socks, 'tiny'))
  return items
}

// Flat list of all wardrobe items, used by What-I-Wore picker
export const ALL_ITEMS = Object.values(WARDROBE_CATALOG)
  .flat()
  .map(i => ({ id: i.id, name: i.label, emoji: i.emoji }))

// Backwards compat for places that imported ITEM_EMOJI by name string
export const ITEM_EMOJI = Object.fromEntries(
  Object.values(WARDROBE_CATALOG).flat().map(i => [i.label, i.emoji])
)

export const BUCKET_LABELS = {
  sub8:    'below 8°C',
  '8to12': '8–12°C',
  '12to16':'12–16°C',
  '16to20':'16–20°C',
  '20to24':'20–24°C',
  above24: 'above 24°C',
}
