# LUN

A mobile-first weather → clothing PWA. Live: https://lun-flax.vercel.app

## Stack
- React 19 + Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`)
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
- Default branch is currently `claude/weather-clothing-pwa-kBg5q`, not `main` — see ShravG1/dev-os#1.

## Conventions
Follows CONTRACT.md in the dev-os repo and global preferences (UK English, minimal deps).

<!-- TODO (Shrav): the repo description is "Have no idea what this is" — fix it,
     and confirm the one-liner above actually matches what LUN does. -->
