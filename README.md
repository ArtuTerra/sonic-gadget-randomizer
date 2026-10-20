# CrossWorlds Gadget Randomizer

A personal fan-made app that will roll a random **valid** gadget build for [Sonic Racing: CrossWorlds](https://sonic.fandom.com/wiki/Sonic_Racing:_CrossWorlds) and show it on a gadget plate.

The page has a Randomize button, an empty plate, and the full gadget databank with local icons. It does **not** roll real builds yet. The full plan, including later milestones, is in [docs/PLAN.md](docs/PLAN.md).

**Fan project, not affiliated with SEGA.**

## What is a PWA?

A progressive web app is a normal website plus two extra pieces:

- A **web app manifest** (name, colours, icons) so Android can install it like an app.
- A **service worker**, a small script the browser keeps in the background. On the first visit it downloads the app's files (HTML, JavaScript, CSS, icons, and the gadget data) and stores them. After that the app can open **with no internet connection**.

On Android, Chrome then offers **Install app** or **Add to Home screen**. The icon opens full screen, without the browser address bar. The next time you are online, the service worker picks up a new version on its own.

This project uses [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/), which generates the manifest and the service worker from the Vite build. You do not write the service worker by hand.

## Prerequisites

- [Node.js](https://nodejs.org/) 22 (the version in `.nvmrc`). npm comes with Node.
- Git.

Check with:

```bash
node -v
npm -v
```

## Run it locally

```bash
npm ci
npm run dev
```

Open <http://localhost:5173>. You should see the title, an empty 2×3 plate, and a Randomize button. The button does not generate a build yet; it only confirms the page is wired up.

The dev server does **not** install a service worker. Offline mode and "Install app" apply to the production build (see below) or to the deployed site.

## Scripts

| Command                  | What it does                                                   |
| ------------------------ | -------------------------------------------------------------- |
| `npm run dev`            | Start the Vite dev server.                                     |
| `npm test`               | Run the Vitest suite once.                                     |
| `npm run validate:data`  | Check `src/data/gadgets.json` against the Zod schema.          |
| `npm run import:gadgets` | Re-download the wiki gadget table and icons into the repo.     |
| `npm run lint`           | ESLint, then Prettier in check mode.                           |
| `npm run format`         | Rewrite files with Prettier.                                   |
| `npm run typecheck`      | Typecheck the app and the Vite config.                         |
| `npm run build`          | Typecheck, then write the static site to `dist/`.              |
| `npm run preview`        | Serve the `dist/` build locally, including the service worker. |

To try the production app on your computer:

```bash
npm run build
npm run preview
```

Open the URL Vite prints (usually <http://localhost:4173>). The first load registers the service worker. Reload once, then switch the browser to offline mode in the developer tools and reload again. The page should still open.

## Build and hosting

The app is a static site. There is no server to run.

| Setting          | Value           |
| ---------------- | --------------- |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Node version     | 22              |

Share links will use the URL hash (`#b=...`), so the host does not need redirect rules for this app.

The GitHub repository is private. Do not use GitHub Pages: the free plan does not serve private repositories, and this project is meant for Cloudflare Pages or Vercel. Both can deploy a private GitHub repo on their free tiers and give you a URL (`*.pages.dev` or `*.vercel.app`). Connecting either host needs **your** Cloudflare or Vercel account; this repo only documents the steps.

### Cloudflare Pages

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) and open **Workers & Pages**.
2. **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub and choose this repository.
4. Set the production branch to `main`.
5. Build command: `npm run build`.
6. Build output directory: `dist`.
7. Add an environment variable `NODE_VERSION` set to `22` (or set the Node.js version in the Pages build settings, if that control is shown).
8. Save and deploy. Cloudflare prints a `*.pages.dev` URL. Later pushes to `main` redeploy it.

### Vercel

1. Sign in at [vercel.com](https://vercel.com) and choose **Add New → Project**.
2. Import this GitHub repository. Authorize Vercel if asked.
3. Framework preset: **Vite** (it should detect the preset).
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Node.js version: 22.
7. Deploy. Vercel prints a `*.vercel.app` URL. Later pushes to `main` redeploy it.

## Install the PWA on Android

Do this after the site is deployed (the phone needs an `https://` address; your computer's `localhost` is not the phone's localhost).

1. On the phone, open the `*.pages.dev` or `*.vercel.app` URL in **Chrome**.
2. Wait for the page to finish loading so the service worker can cache the files.
3. Open the Chrome menu (the three dots) and tap **Install app** or **Add to Home screen**.
4. Open the new home-screen icon. It should launch full screen, without the address bar.
5. Turn on airplane mode and open the icon again. The cached page should still load.

The Randomize button still will not roll a build. That comes in a later milestone. Offline here means the shell opens without a network.

## Project layout

```
docs/PLAN.md          The full project plan. Read this before a milestone.
AGENTS.md             Notes for AI assistants working in this repo.
src/main.tsx          React entry. Registers the service worker.
src/App.tsx           Home page: empty plate, gadget list, and credits.
src/components/       React UI. Plate is the empty 2×3 grid. The databank
                      list and credits sit under it.
src/core/             Framework-free TypeScript: plate rules, and the
                      future randomizer, validator, and share-code logic.
                      No React and no browser APIs. Safe to reuse on Android.
src/data/gadgets.json Gadget databank imported from Sonic Wiki Zone.
src/data/schema.ts    Zod schema and the TypeScript types it infers.
scripts/import-gadgets.ts
                      Re-fetches the wiki table, writes the JSON, and saves
                      icons under public/icons/gadgets/.
public/               Favicon, PWA icons, and local gadget icons.
dist/                 Production build. Created by npm run build. Not committed.
```

Plate capacities, encoded in `src/core/plate.ts` as `[top row, bottom row]`:

| Plate  | Slots | Layout                                            |
| ------ | ----- | ------------------------------------------------- |
| Normal | 2     | Top row, left two cells (assumed)                 |
| Bronze | 3     | Full top row                                      |
| Silver | 4     | Full top row, plus one bottom-left slot           |
| Gold   | 5     | Full top row, plus two bottom slots from the left |
| Master | 6     | Both rows full                                    |

A gadget uses 1, 2, or 3 slots and must fit inside one row. The same gadget cannot be equipped twice.

## What is left

The roadmap is the milestone table in [docs/PLAN.md §7a](docs/PLAN.md). The gadget databank and local icons are in place (M2 and M3). The randomizer, the drawn plate, and share links come after that.

## Refresh the gadget list

Game updates change the wiki table. From the repo root:

```bash
npm run import:gadgets
```

That fetches the [gadget page](<https://sonic.fandom.com/wiki/Gadget_(Sonic_Racing:_CrossWorlds)>), rewrites `src/data/gadgets.json`, and saves 128px WebP icons in `public/icons/gadgets/`. Add an original one-line effect in `scripts/gadget-copy.ts` before importing a gadget the wiki has not listed before. The script keeps existing numeric codes and does not reuse one if a gadget disappears.
