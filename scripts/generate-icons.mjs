// Generates Reflection's PWA icons and social card from a single SVG mark.
// Calming look: an ember orb on a warm cream surface — the same breathing
// motif the app uses for the daily-entry mic.

import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(__dir, '../public')

// Palette — Garden theme (the app's default).
const CREAM_LIGHT = '#FBF5E9'
const CREAM_DEEP  = '#EDE3CF'
const EMBER_LIGHT = '#E6B595'
const EMBER_MID   = '#C16B47'
const EMBER_DEEP  = '#97492C'

// ---- App icon (square) ----
function iconSVG(size = 512) {
  const rx = Math.round(size * 0.22)
  const cx = size / 2
  const cy = size / 2
  const orbR = Math.round(size * 0.26)
  const haloR = Math.round(size * 0.40)
  const hlx = Math.round(size * 0.42)
  const hly = Math.round(size * 0.42)
  const hlrx = Math.round(size * 0.09)
  const hlry = Math.round(size * 0.06)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  stop-color="${CREAM_LIGHT}"/>
      <stop offset="100%" stop-color="${CREAM_DEEP}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}" stop-opacity="0.55"/>
      <stop offset="55%"  stop-color="${EMBER_LIGHT}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${EMBER_LIGHT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb" cx="42%" cy="38%" r="62%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}"/>
      <stop offset="55%"  stop-color="${EMBER_MID}"/>
      <stop offset="100%" stop-color="${EMBER_DEEP}"/>
    </radialGradient>
  </defs>

  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${haloR}" fill="url(#halo)"/>
  <circle cx="${cx}" cy="${cy}" r="${orbR}" fill="url(#orb)"/>
  <ellipse cx="${hlx}" cy="${hly}" rx="${hlrx}" ry="${hlry}" fill="#FFFFFF" opacity="0.22"/>
</svg>`
}

// Tiny favicon — reads at 16px.
function faviconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <radialGradient id="orb" cx="42%" cy="38%" r="62%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}"/>
      <stop offset="55%"  stop-color="${EMBER_MID}"/>
      <stop offset="100%" stop-color="${EMBER_DEEP}"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${EMBER_LIGHT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="${CREAM_LIGHT}"/>
  <circle cx="24" cy="24" r="18" fill="url(#halo)"/>
  <circle cx="24" cy="24" r="12" fill="url(#orb)"/>
  <ellipse cx="20" cy="20" rx="4.2" ry="2.8" fill="#FFFFFF" opacity="0.22"/>
</svg>`
}

// Social card — 1200×630, used by GitHub/Vercel/Open Graph previews.
function ogSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"  stop-color="${CREAM_LIGHT}"/>
      <stop offset="100%" stop-color="${CREAM_DEEP}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}" stop-opacity="0.55"/>
      <stop offset="60%"  stop-color="${EMBER_LIGHT}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${EMBER_LIGHT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb" cx="42%" cy="38%" r="62%">
      <stop offset="0%"   stop-color="${EMBER_LIGHT}"/>
      <stop offset="55%"  stop-color="${EMBER_MID}"/>
      <stop offset="100%" stop-color="${EMBER_DEEP}"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Orb -->
  <circle cx="320" cy="315" r="260" fill="url(#halo)"/>
  <circle cx="320" cy="315" r="150" fill="url(#orb)"/>
  <ellipse cx="280" cy="270" rx="50" ry="32" fill="#FFFFFF" opacity="0.22"/>

  <!-- Wordmark -->
  <text x="600" y="290" font-family="Georgia, 'Times New Roman', serif"
        font-size="110" font-weight="600" fill="#2E2A22" letter-spacing="-2">Reflection</text>
  <text x="600" y="350" font-family="-apple-system, 'Segoe UI', sans-serif"
        font-size="32" fill="#5A5446" letter-spacing="1">A calm place to journal your day.</text>

  <!-- Spark thread -->
  <circle cx="605" cy="410" r="7" fill="${EMBER_MID}"/>
  <circle cx="635" cy="410" r="7" fill="${EMBER_MID}"/>
  <circle cx="665" cy="410" r="7" fill="${EMBER_MID}"/>
  <circle cx="695" cy="410" r="7" fill="${EMBER_LIGHT}" opacity="0.5"/>
  <circle cx="725" cy="410" r="7" fill="none" stroke="${EMBER_LIGHT}" stroke-width="1.5" opacity="0.7"/>
</svg>`
}

async function generate() {
  const masterSVG = iconSVG(512)
  const buf = Buffer.from(masterSVG)

  const targets = [
    { name: 'icon-192.png',        size: 192 },
    { name: 'icon-512.png',        size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ]

  for (const { name, size } of targets) {
    await sharp(buf).resize(size, size).png().toFile(path.join(pub, name))
    console.log('wrote', name, size + 'x' + size)
  }

  writeFileSync(path.join(pub, 'icon.svg'), masterSVG, 'utf8')
  console.log('wrote icon.svg')

  writeFileSync(path.join(pub, 'favicon.svg'), faviconSVG(), 'utf8')
  console.log('wrote favicon.svg')

  await sharp(Buffer.from(ogSVG())).resize(1200, 630).png().toFile(path.join(pub, 'og-image.png'))
  console.log('wrote og-image.png 1200x630')
}

generate().catch(e => { console.error(e); process.exit(1) })
