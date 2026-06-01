# CLAUDE.md — Layers (LUN)

A mobile-first PWA that recommends what to wear from live weather and how you
actually feel in different temperatures — learns from "too cold / just right /
too warm" feedback. Global prefs live in `~/.claude/CLAUDE.md`; this is the
per-repo guide (CONTRACT §4).

## Stack
- Vite + React + Tailwind CSS, installable PWA (`vite-plugin-pwa`).
- Live weather via **Open-Meteo** (feels-like temperature).
- Has a `worker/` (edge worker) and `vercel.json`; deployed to Vercel.

## Run
```bash
npm install
npm run dev        # Vite — http://localhost:5173
npm run build
npm run lint
npm run preview
```

## Gotchas
- **Work on `main`.** The repo's default branch historically pointed at a
  `claude/…` agent branch; `main` is the canonical line. Commit here, not to a
  scratch branch.
- **Commit author must be `meshavie@gmail.com`** — Vercel blocks deploys whose git
  author isn't tied to the Vercel account. Pushing here triggers a Vercel redeploy.
- Live: <https://lun-flax.vercel.app>.

## Guardrails (CONTRACT.md)
Private by default · no auto-merge · no force-push without asking · nothing
destructive without confirmation.
