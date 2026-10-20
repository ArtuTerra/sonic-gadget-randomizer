# CrossWorlds Gadget Randomizer

A personal fan-made app that rolls a random **valid** gadget build for [Sonic Racing: CrossWorlds](https://sonic.fandom.com/wiki/Sonic_Racing:_CrossWorlds) and shows it on a gadget plate.

Pick a plate from Normal through Master and press Randomize. The address bar updates with a share link, and opening that link shows the same build. The full gadget list stays under **All gadgets**. The full plan, including later milestones, is in [docs/PLAN.md](docs/PLAN.md).

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

Open <http://localhost:5173>. You should see a Master plate with a random build and a Randomize button. The address bar hash is the share link for that build. Change the plate to watch locked cells appear on the smaller tiers. **All gadgets** at the bottom opens the full list.

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

Share links use the URL hash (`#b=...`), so the host does not need redirect rules for this app.

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

After the first online load, airplane mode should still open the app, show the icons, and roll a new build. The gadget icons are part of the service worker precache.

## Project layout

```
docs/PLAN.md          The full project plan. Read this before a milestone.
AGENTS.md             Notes for AI assistants working in this repo.
src/main.tsx          React entry. Registers the service worker.
src/App.tsx           Home page: plate, build list, share-link hash, and
                      the collapsible gadget list.
src/components/       React UI. Plate draws each gadget across its slots.
src/core/             Framework-free TypeScript: plate rules, randomizer,
                      validator, and share codes. No React and no browser
                      APIs. Safe to reuse on Android.
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

## How a roll is chosen

The randomizer lists every way to fill the open cells with gadget sizes 1, 2, and 3, one shape per row. It drops shapes the released pool cannot fill, then picks one of the remaining shapes at random. Gadgets of the needed sizes are shuffled in next. That keeps a 3-slot row as likely as a row of three 1-slot gadgets. Weighting shapes by how many gadgets exist would make about 94% of Master builds six 1-slot gadgets, because there are so many of those combinations.

Every full build the pool can make can still come up. The same gadget is never used twice. Overlapping effects are allowed. Pass a `seed` or an `rng` function when you need the same roll again; the tests do this.

Share links look like `#b=1.11-0o.31.pmaster`. Each pair of characters is a gadget code in base 36, `--` is an empty open cell, and `.p` is the plate. The hash needs no server.

## What is left

The roadmap is the milestone table in [docs/PLAN.md §7a](docs/PLAN.md). The databank, icons, randomizer, plate, and share links are in place. Still later: reroll one gadget, owned-gadget filters, the "allow empty slots" toggle, and highlighting the bad slot on a broken link.

## Refresh the gadget list

Game updates change the wiki table. From the repo root:

```bash
npm run import:gadgets
```

That fetches the [gadget page](<https://sonic.fandom.com/wiki/Gadget_(Sonic_Racing:_CrossWorlds)>), rewrites `src/data/gadgets.json`, and saves 128px WebP icons in `public/icons/gadgets/`. Add an original one-line effect in `scripts/gadget-copy.ts` before importing a gadget the wiki has not listed before. The script keeps existing numeric codes and does not reuse one if a gadget disappears.
