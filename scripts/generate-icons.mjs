// Generates all PWA icon PNGs from an SVG using sharp.
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(__dir, '../public')

// The icon SVG — 3D stacked layers mark, indigo gradient.
// Three rectangular slabs offset in Y and X to simulate depth.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111118"/>
      <stop offset="100%" stop-color="#0a0a10"/>
    </linearGradient>
    <linearGradient id="l3g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#3730a3"/>
    </linearGradient>
    <linearGradient id="l2g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="l1g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a5b4fc"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <filter id="s3" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="0.6"/>
    </filter>
    <filter id="s2" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="s1" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Back slab (widest, darkest) -->
  <rect x="80" y="296" width="352" height="62" rx="16"
        fill="url(#l3g)" filter="url(#s3)"/>

  <!-- Mid slab -->
  <rect x="96" y="248" width="320" height="62" rx="16"
        fill="url(#l2g)" filter="url(#s2)"/>

  <!-- Front slab (narrowest, lightest) — centered -->
  <rect x="112" y="200" width="288" height="62" rx="16"
        fill="url(#l1g)" filter="url(#s1)"/>

  <!-- Highlight on front slab -->
  <rect x="130" y="210" width="90" height="9" rx="4.5"
        fill="white" opacity="0.22"/>
</svg>`

async function generate() {
  const sizes = [
    { name: 'icon-192.png',       size: 192, rounded: true },
    { name: 'icon-512.png',       size: 512, rounded: true },
    { name: 'apple-touch-icon.png', size: 180, rounded: false },
    { name: 'icon.svg',           size: null },
  ]

  const buf = Buffer.from(SVG)

  for (const { name, size, rounded } of sizes) {
    if (name.endsWith('.svg')) {
      writeFileSync(path.join(pub, name), SVG, 'utf8')
      console.log('wrote', name)
      continue
    }
    await sharp(buf)
      .resize(size, size)
      .png()
      .toFile(path.join(pub, name))
    console.log('wrote', name, size + 'x' + size)
  }
}

generate().catch(e => { console.error(e); process.exit(1) })
