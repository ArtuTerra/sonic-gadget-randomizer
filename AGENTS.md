# Agent notes

This is a personal fan project: a gadget-build randomizer for Sonic Racing: CrossWorlds. The full plan is `docs/PLAN.md`. Read the milestone you are implementing before editing.

## Stack

- Vite, React, and TypeScript for the UI.
- Tailwind is the planned styling approach once the plate graphic needs it. The skeleton uses plain CSS.
- Gadget data lives in `src/data/gadgets.json` and is checked with Zod (`src/data/schema.ts`).
- Vitest for tests. `vite-plugin-pwa` for the installable offline app.
- Static hosting only (Cloudflare Pages or Vercel). No server in the MVP.

## Hard rules

- `src/core` must stay free of React, the DOM, and the network. No `react`, `react-dom`, `document`, `window`, `localStorage`, or `fetch`. The randomizer, validator, and share-code logic belong there so the same code can run in the browser, the PWA, unit tests, and a future Capacitor shell.
- Do not import UI code from `src/core`.
- Plate rules live in `src/core/plate.ts`: 2 rows × 3 columns; gadget sizes 1, 2, or 3; a gadget must fit inside a single row; no duplicate gadgets.
- Row capacities are `[top, bottom]`: Normal `[2, 0]`, Bronze `[3, 0]`, Silver `[3, 1]`, Gold `[3, 2]`, Master `[3, 3]`. Normal's two slots are the top row's left two cells and are still an assumption. Do not change capacities on a guess.
- Overlapping effects are allowed. The MVP randomizer does not try to make "efficient" builds.
- Gadget `id` slugs and integer `code`s are stable. Never reuse a code, even after a gadget is removed (`status: "removed"`).
- The current `gadgets.json` is a **placeholder seed**. Do not treat it as the real databank. Filling it in is milestone M2.
- Write original short gadget descriptions. Do not paste Sonic Wiki Zone text.
- Do not hotlink wiki or game images. Icons, when they exist, are local files with credit.
- English only until a later milestone.
- Keep the fan-project disclaimer: not affiliated with SEGA.

## Checks

Before handing work back, `npm run lint`, `npm test`, and `npm run build` should pass. `npm run validate:data` checks the gadget JSON.
