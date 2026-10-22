# Deploy

The live site is a Cloudflare Worker serving static assets, deployed from `main`: <https://sonic-gadget-randomizer.arthur-terra.workers.dev>. The Worker config is [`wrangler.jsonc`](../wrangler.jsonc) (assets from `dist/`, SPA fallback, preview deploys enabled). Cloudflare builds with `npm run build` and uploads with `npx wrangler versions upload`.

## Build settings

The app is a static site. There is no server to run.

| Setting          | Value           |
| ---------------- | --------------- |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Node version     | 22              |

Share links use the URL hash (`#b=...`), so the host does not need redirect rules for this app.

## Other hosts

The GitHub repository is private. Do not use GitHub Pages: the free plan does not serve private repositories, and this project is meant for Cloudflare Pages or Vercel. Both can deploy a private GitHub repo on their free tiers and give you a URL (`*.pages.dev` or `*.vercel.app`). Connecting either host needs **your** Cloudflare or Vercel account; this repo only documents the steps.

## Cloudflare Pages

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) and open **Workers & Pages**.
2. **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub and choose this repository.
4. Set the production branch to `main`.
5. Build command: `npm run build`.
6. Build output directory: `dist`.
7. Add an environment variable `NODE_VERSION` set to `22` (or set the Node.js version in the Pages build settings, if that control is shown).
8. Save and deploy. Cloudflare prints a `*.pages.dev` URL. Later pushes to `main` redeploy it.

## Vercel

1. Sign in at [vercel.com](https://vercel.com) and choose **Add New → Project**.
2. Import this GitHub repository. Authorize Vercel if asked.
3. Framework preset: **Vite** (it should detect the preset).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Node.js version: 22.
7. Deploy. Vercel prints a `*.vercel.app` URL. Later pushes to `main` redeploy it.
