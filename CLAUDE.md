# CLAUDE.md — Layers (LUN)

A mobile-first PWA that recommends what to wear from live weather and how you
actually feel in different temperatures — learns from "too cold / just right /
too warm" feedback. Global prefs live in `~/.claude/CLAUDE.md`; this is the
per-repo guide (CONTRACT §4).

## Stack
- Vite + React + Tailwind CSS, installable PWA (`vite-plugin-pwa`).
- Live weather via **Open-Meteo** (feels-like temperature).
- **Two concurrent deploy targets** (both trigger on push to main):
  - **Vercel** (`lun` project) — git integration; `vercel.json` provides the SPA
    rewrite rule. This is the primary live URL (`lun-flax.vercel.app`).
  - **Cloudflare Pages** (`layers-app`) — CI workflow in
    `.github/workflows/deploy.yml` via `wrangler-action` + `CLOUDFLARE_API_TOKEN`.
- **Cloudflare Worker** (`layers-push`, lives in `worker/`) — push-notification
  and cloud-backup edge service; deployed separately, not via CI.

## Run
```bash
# Frontend PWA (repo root)
npm install
npm run dev        # Vite — http://localhost:5173
npm run build
npm run lint
npm run preview

# Worker (separate deploy — cd into worker/ first)
cd worker
npx wrangler deploy      # deploys layers-push to Cloudflare Workers
```

## Gotchas
- **Work on `main`.** The repo's default branch historically pointed at a
  `claude/…` agent branch; `main` is the canonical line. Commit here, not to a
  scratch branch.
- **Commit author must be `meshavie@gmail.com`** — Vercel blocks deploys whose git
  author isn't tied to the Vercel account. Pushing here triggers both a Vercel
  redeploy and a Cloudflare Pages deploy.
- **Worker deploys separately.** `cd worker && npx wrangler deploy` pushes
  `layers-push`. It needs three secrets provisioned once:
  ```
  wrangler secret put VAPID_PUBLIC_KEY
  wrangler secret put VAPID_PRIVATE_KEY   # JSON-encoded JWK
  wrangler secret put VAPID_SUBJECT       # e.g. mailto:you@example.com
  ```
  The `SUBS` KV namespace binding is already declared in `worker/wrangler.toml`.
- **`VITE_PUSH_WORKER_URL` must be set** as an environment variable on both Vercel
  and Cloudflare Pages (find the deployed worker URL under Cloudflare dashboard →
  Workers & Pages → `layers-push`). Without it, push notifications and cloud
  backup are silently disabled — the hooks read
  `import.meta.env.VITE_PUSH_WORKER_URL || ''`.
- Live: <https://lun-flax.vercel.app>.

## Guardrails (CONTRACT.md)
Private by default · no auto-merge · no force-push without asking · nothing
destructive without confirmation.
