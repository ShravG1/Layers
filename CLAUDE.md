# CLAUDE.md — Layers (LUN)

A mobile-first PWA that recommends what to wear from live weather and how you
actually feel in different temperatures — learns from "too cold / just right /
too warm" feedback. Global prefs live in `~/.claude/CLAUDE.md`; this is the
per-repo guide (CONTRACT §4).

## Stack
- Vite + React + Tailwind CSS, installable PWA (`vite-plugin-pwa`).
- Live weather via **Open-Meteo** (feels-like temperature).
- **Two-part deploy:** the frontend goes to **Cloudflare Pages** (`layers-app`);
  push-notification and cloud-backup live in a separate **Cloudflare Worker**
  (`layers-push`, lives in `worker/`). Both are on Cloudflare, neither is Vercel.
- `vercel.json` in the root is vestigial — it has no effect; the CI deploy goes
  to Cloudflare Pages. Ignore it; feel free to delete it once confirmed harmless.

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
- **CI deploys to Cloudflare Pages** (`layers-app`) on every push to `main` or
  `claude/**` via `.github/workflows/deploy.yml` + `CLOUDFLARE_API_TOKEN`. The
  commit author is irrelevant to the deploy (it goes via API token, not git
  identity).
- **Worker deploys separately.** `cd worker && npx wrangler deploy` pushes
  `layers-push`. It needs three secrets provisioned once:
  ```
  wrangler secret put VAPID_PUBLIC_KEY
  wrangler secret put VAPID_PRIVATE_KEY   # JSON-encoded JWK
  wrangler secret put VAPID_SUBJECT       # e.g. mailto:you@example.com
  ```
  The `SUBS` KV namespace binding is already declared in `worker/wrangler.toml`.
- **`VITE_PUSH_WORKER_URL` must be set** as a Cloudflare Pages environment
  variable (Cloudflare dashboard → Pages → `layers-app` → Settings → Variables)
  pointing at the deployed worker URL (find it under Workers & Pages →
  `layers-push`). Without it, push notifications and cloud backup are silently
  disabled — the hooks read `import.meta.env.VITE_PUSH_WORKER_URL || ''`.
- Live: confirm the live URL in the Cloudflare Pages dashboard (`layers-app`);
  the old `https://lun-flax.vercel.app` reference may be stale.

## Guardrails (CONTRACT.md)
Private by default · no auto-merge · no force-push without asking · nothing
destructive without confirmation.
