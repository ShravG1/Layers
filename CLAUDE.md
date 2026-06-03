# Layers

A mobile-first weather → clothing PWA. Live: https://lun-flax.vercel.app

## Stack
- React 19 + Vite, Tailwind CSS 4 (`@tailwindcss/vite`)
- PWA via `vite-plugin-pwa`; icon generation uses `sharp` (see `scripts/`, `worker/`)
- Deployed on Vercel

## Run / test
```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # production build
npm run preview  # serve the built app
npm run lint     # eslint
```

## Gotchas
- **Commit as meshavie@gmail.com** or Vercel rejects the deploy (standing git-author gotcha).

## Conventions
Follows CONTRACT.md in the dev-os repo and global preferences (UK English, minimal deps).