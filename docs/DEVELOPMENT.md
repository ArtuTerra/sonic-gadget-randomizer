# Development

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

Open <http://localhost:5173>. You should see a Master plate with a random build, a Randomize button, and the share link under it. The address bar hash is that same link. Change the plate to watch locked cells appear on the smaller tiers. **All gadgets** at the bottom opens the full list.

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

## Project layout

```
docs/                 Project docs. PLAN.md is the full plan; read it before a milestone.
AGENTS.md             Notes for AI assistants working in this repo.
src/main.tsx          React entry. Registers the service worker.
src/App.tsx           Home page: plate, build options, build list,
                      share-link hash, and the collapsible gadget list.
src/components/       React UI. Plate draws each gadget across its slots.
src/core/             Framework-free TypeScript: plate rules, randomizer,
                      validator, owned/upcoming filters, and share codes. No React and no browser
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

The roadmap is the milestone table in [PLAN.md §7a](PLAN.md). The databank, icons, randomizer, plate, and share links are in place. Owned-gadget filters and the upcoming toggle are in place too. Still later: reroll one gadget, the "allow empty slots" toggle, and highlighting the bad slot on a broken link.
