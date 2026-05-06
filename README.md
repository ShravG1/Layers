# Layers

A mobile-first PWA that recommends what to wear based on live weather and how you actually feel in different temperatures.

## Features
- Live weather (Open-Meteo), driven by feels-like temperature
- Personal wardrobe — recommends from items you actually own
- Learns over time from "too cold / just right / too warm" feedback
- Evening drop alerts ("pack something")
- Daily push notification (Cloudflare Worker + cron)
- Installable PWA, dark UI, offline support

## Dev
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name=whattowear --branch=main
```

## Worker (push)
```bash
cd worker
npx wrangler deploy
```
