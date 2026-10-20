# Sonic Racing: CrossWorlds — Random Gadget Build Generator

**Project plan** · Owner: Arthur Terra · Status: draft v2 (20 Oct 2026, with Arthur's decisions in §9) · Type: personal hobby project, built with AI-assisted development

> One-liner: press a button, get a random **valid** gadget build, shown on a gadget plate graphic with a list next to it. Later: tag filters, random character and machine, sharing, community builds, and an **offline Android app**.

---

## 1. Game facts (research summary)

**Primary source:** Sonic Wiki Zone (Fandom), *Gadget (Sonic Racing: CrossWorlds)*: <https://sonic.fandom.com/wiki/Gadget_(Sonic_Racing:_CrossWorlds)>. Read 20 Oct 2026. The page itself lists items from game versions 1.2.1 through 1.4.1 plus a "version 2.0" update that has not shipped yet.
**Cross-check:** Namu Wiki (Korean), *소닉 레이싱 크로스월드/가젯*: <https://namu.moe/w/소닉%20레이싱%20크로스월드/가젯>. I used it only for the row-layout rule and to confirm the plate unlock steps.

### 1.1 What gadgets are
- Gadgets are passive modifiers that you equip before a race. They do not run out when used, unlike the Bonus Boxes in Team Sonic Racing. *(Fandom)*
- Each gadget takes **1, 2 or 3 slots** on the Gadget Plate. *(Fandom)*
- Some gadgets are **kits**: one gadget that combines the effects of several. Some kits are tied to a character type or Machine type. *(Fandom)*
- Some gadgets are **marked invalid in Time Trial** and do nothing there. The page **does not list which ones** → unknown.
- You can save up to **5 gadget presets** and switch between them between races, even in the middle of a Grand Prix. In Festivals, Special Rules offer an optional **Rental Plate** with recommended gadgets. *(Fandom)*

### 1.2 The plate
- The full plate has **6 slots in a 3 × 2 grid**: 3 columns and 2 rows. *(Fandom)*
- **The two rows are separate. A gadget has to fit inside one row.** A 2-slot gadget cannot be placed vertically, so three 2-slot gadgets can never be equipped together. *(Namu Wiki; the Fandom page doesn't say. TheGamer adds: "the more powerful ones could take up a whole row".)*
- So each row is one of these: `[3]`, `[2,1]`, `[1,2]`, `[1,1,1]`, or one of those with empty slots.

| Plate | Slots | Unlocked after (total races) | Also unlocks |
|---|---|---|---|
| Normal | 2 | start (customizing is locked until you finish 1 Grand Prix) | 5 default presets: empty, Lv1 Quick Charge, Air Trick Expert, Double Boost Specialist, Inventory Plus |
| Bronze | 3 | 6 | Item-based gadgets |
| Silver | 4 | 18 | Stat-based gadgets |
| Gold | 5 | 30 | "Improved driving" gadgets |
| Master | 6 | 46 | Ring-based gadgets |
| — | — | 62 | Machine Kit gadgets |
| — | — | 78 | "Race tactics" gadgets |
| — | — | 94 | "Technical" gadgets |

*(Fandom. Namu Wiki gives the same steps as increments: 6/12/12/16 races, then a reward every 16 races, three times.)*
**Smaller-plate layout (decision D2 — Arthur; partly unverified):**
- Bronze's 3 slots are the **full top row** (confirmed by Arthur).
- Silver and Gold then fill the **bottom row, left to right** (assumed, not verified).
- Normal's 2 slots are taken to be the top row's left two cells (assumed).

```
Normal  [■ ■ □]   Bronze [■ ■ ■]   Silver [■ ■ ■]   Gold [■ ■ ■]   Master [■ ■ ■]
        [□ □ □]          [□ □ □]          [■ □ □]        [■ ■ □]          [■ ■ ■]
```

### 1.3 How many gadgets
The Fandom table has **135 gadgets in 13 categories**:
- **118** are released (in the game today).
- **17** are upcoming (planned for the "version 2.0" update).
  - 10 of the 17 are labelled "Upcoming" on the page.
  - I inferred the other 7 (see §1.5).

Slot sizes of the **118 released gadgets**: **49 take 1 slot, 31 take 2, and 38 take 3**.

| Category | Total | Upcoming | Released 1-slot | Released 2-slot | Released 3-slot |
|---|---|---|---|---|---|
| Ring Gain | 13 | 0 | 9 | 3 | 1 |
| Ring Ability | 11 | 0 | 5 | 4 | 2 |
| Technique Upgrade | 11 | 2 | 5 | 4 | 0 |
| Charge Upgrade | 15 | 7 | 2 | 5 | 1 |
| Stat Upgrade | 15 | 5 | 10 | 0 | 0 |
| Power Up | 9 | 1 | 5 | 2 | 1 |
| Support | 15 | 2 | 5 | 6 | 2 |
| Item Control | 10 | 0 | 3 | 4 | 3 |
| Upgrade/Add Item | 9 | 0 | 5 | 3 | 1 |
| Standard Kit | 3 | 0 | 0 | 0 | 3 |
| Machine Type Kit | 5 | 0 | 0 | 0 | 5 |
| Character Type Kit | 5 | 0 | 0 | 0 | 5 |
| Advanced Kit | 14 | 0 | 0 | 0 | 14 |

All kits take 3 slots, which means a kit always fills a whole row.

### 1.4 Where gadgets come from
The table lists these kinds of unlock:
- **Available from the start**
- **Finish a Grand Prix**
- **Reach Bronze / Silver / Gold / Master Plate**
- **Finish N races** (62, 78 or 94)
- **World Match rank** (from D- up to B)
- **Festival points**: 120–150 points in a named Festival. All of those Festivals are now marked **expired**.
- **Donpa Tickets**: some expired Festival kits can be bought for **100 Donpa Tickets** once you reach the Master Plate (marked `*` on the page).

The page also mentions gadgets that come from ranking up in World Match and from Festival points in general. The full list with each gadget's unlock is in **Appendix A**.

### 1.5 Data quality notes (mark these in the databank)
- **Blank unlock cells.** Many rows of the wiki table have an empty unlock cell. The table seems to use merged (row-spanning) cells, so I **assumed the blank cell takes the value of the row above**. These rows are marked † in Appendix A. **This needs checking in game.**
- **Upcoming gadgets.** 7 gadgets have no "upcoming" label, but they have no icon yet (`File:…png` placeholder) and sit right below an upcoming row: Collision Charge, Refined Counter Drift, the four Acceleration/Handling/Power/Boost Mods, and Power Through. I treated them as **upcoming (v2.0)**.
- **Slot counts change between patches.** Example: Crash Pads went from 2 slots to 1 in 1.4.1. Store a `gameVersion` and `lastVerified` with the data.
- **Small source conflicts:**
  - Namu Wiki gives Air Trick Bounty and Travel Ring Bounty as "46 races", and Fandom says "Master Plate". These match, because Master Plate = 46 races.
  - Namu Wiki says Route Planner Bounty raises the Ring limit to 200. Fandom only says "increase maximum Ring Limit".
- **Build rules.** The Fandom page confirms only one stacking case: **Air Trick Adept stacks with Air Trick Expert**. Namu Wiki adds that the three Dash Panel bounties stack. Arthur's rules (from Steam forum consensus) are in §1.7.
- **Still unknown:** which gadgets are invalid in **Time Trial**. Deferred (D4).

### 1.6 A valid build, as a rule set
1. Every gadget fits inside one row of 3 slots, and the total size in each row is 3 or less.
2. The number of slots used is no more than the plate's slot count (Master = 6).
3. **No duplicates:** the same gadget can't be equipped twice (D1).
4. **Overlapping gadgets are allowed** (D1). Examples: a kit plus its own parts, 130 + 200 Ring Limit, Tuner 1 + Tuner 2. They are legal, just sometimes inefficient.
5. Filters (later phases): owned gadgets only, include v2.0 gadgets, "efficient builds", Time-Trial-valid (deferred).

### 1.7 Stacking behaviour (community info — UNVERIFIED)
Source: Arthur, summarizing Steam forum consensus. This is not an official or wiki source, so tag it as `community-unverified` in the data.

| Effect type | Stacks? | Examples |
|---|---|---|
| **Flat caps / limits** | No. The highest value wins | 130 vs 200 Ring Limit; Double Down combined with other item-slot modifiers |
| **Threshold effects** | No. The highest value wins | A "becomes X" style effect from two sources |
| **Recurring / payout effects** (gain per event) | Yes, they add up | Charge Boost + a kit that also pays Rings on Charge Boost; the Dash Panel bounties |
| **Quick Charge levels** | Yes | Lv1 + Lv2 + Lv3 Quick Charge, or a Quick Charge inside a kit |
| **Stat modifiers** (Tuners, Evolutions) | Unknown, presumably add up | Tuner 1 + Tuner 2 are allowed; whether the stat gains add is unverified |

**Effect on the randomizer:**
- **MVP:** overlaps are allowed, and the randomizer doesn't care about them.
- **Later:** an optional **"Efficient builds"** mode avoids pairs whose effects on the same cap or threshold don't stack.

---

## 2. Tech stack recommendation

### 2.1 What we need from the stack
- **Static first.** The randomizer is pure computation over a small JSON file (about 135 items), so no server is needed.
- **Offline Android later** (Arthur's addition). The randomizer and the databank have to **run fully on the device**. The API is only for community features.
- **Friendly to AI-assisted development.** A popular stack means AI assistants write better code and there are more examples.
- **Free hosting** and very little ops work.

### 2.2 Frontend framework options

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Vite + React + TypeScript** | Biggest ecosystem; AI assistants know it best; great PWA plugin (`vite-plugin-pwa`); Capacitor works out of the box | Somewhat more boilerplate than Svelte | **Recommended** |
| Vite + Svelte 5 + TS | Less code, small bundles, pleasant to write | AI assistants still mix Svelte 4 and 5 syntax; smaller ecosystem | Good alternative |
| SvelteKit / Next.js | Routing and SSR built in | Server features aren't needed; static export plus offline adds friction | Overkill for the MVP |
| Plain HTML/JS | No build step | Gets messy once filters, editor and sharing arrive | Only for a throwaway prototype |
| Flutter / Kotlin native | Truly native Android | A second codebase; the web version gets weaker or has to be built twice | Not worth it for a hobby project |

**TypeScript** gives the gadget schema compile-time types. Add **Zod** for runtime validation of the JSON. Both catch data mistakes, which is the most likely bug class in this project.

### 2.3 Android offline: PWA vs Capacitor

> **What is a PWA? (Progressive Web App)**
> - A PWA is a normal website that also has two extra files:
>   - a **web app manifest**: name, icon and colours, so Android can install it like an app;
>   - a **service worker**: a small script that the browser runs in the background.
> - On the first visit, the service worker **downloads and caches** the app's files: HTML, JS, CSS, the gadget JSON and the icons.
> - After that the app opens **without internet**. On Android, Chrome shows **"Install app" / "Add to Home screen"**, and the app then gets its own icon and opens full-screen with no browser bar.
> - Updates arrive by themselves the next time you're online.
> - With `vite-plugin-pwa`, setting this up is mostly configuration, not code.

| | **PWA** (service worker + cached databank) | **Capacitor-wrapped Android app** |
|---|---|---|
| What it is | The same website, installable ("Add to Home screen"). A service worker precaches the app shell, the JSON and the icons | The same web build inside a native Android WebView shell (APK/AAB) |
| Offline | Yes, after the first visit (Workbox precache) | Yes, from install, because the assets are bundled in the APK |
| Effort | Small: `vite-plugin-pwa`, a manifest and icons. Can be done during the MVP | Medium: Android Studio/Gradle, signing keys, an extra build step. Native plugins only if needed |
| Distribution | A URL; installs from Chrome. No store, no fees | Sideload the APK, or the Play Store (one-time developer fee, review, data-safety form) |
| Updates | Instant: a new deploy, and the service worker updates | Web assets ship with the APK. Needs a new release, or a live-update service |
| Native features | Web APIs only (share sheet via Web Share, clipboard, storage) | Native share, haptics, filesystem, better deep links |
| Store risk | None | **Fan app using Sega's IP: Play Store may reject it or take it down** |
| Storage | IndexedDB/localStorage; the browser may evict it under storage pressure (rare for installed PWAs) | The WebView's storage plus Capacitor Preferences/Filesystem, so it lasts longer |

**Decision (D7): PWA first, then an APK via Capacitor later.**
- The MVP ships as an installable, offline PWA.
- Phase 4 wraps the same `dist/` build with **Capacitor** into a sideloadable **APK**. No rewrite is needed.
- A Play Store listing is not planned. If it's ever wanted, a TWA (Trusted Web Activity) is the lighter-weight route to the store.

### 2.4 Final stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 18/19 + TypeScript + Vite | Ecosystem and quality of AI help |
| Styling | Tailwind CSS (or CSS modules) | Fast to lay out the plate grid |
| Data | `src/data/gadgets.json` (+ `characters.json`, `machines.json` later), validated with Zod in CI | Versioned, diffable, can be reviewed in PRs |
| Core logic | `packages/core` (or `src/core`): pure TypeScript, **no DOM and no network**. Holds the randomizer, validator and encoder | Runs the same in the browser, the PWA, Capacitor and tests. Never needs the API |
| Tests | Vitest (+ fast-check for property tests of the randomizer) | "Every generated build is valid" is a perfect property test |
| Offline | `vite-plugin-pwa` (Workbox precache) | One plugin, works offline |
| Hosting | **Cloudflare Pages** (`*.pages.dev`) or Vercel (`*.vercel.app`): **free URL, no custom domain** (D8) | Free, deploys from git, preview URLs |
| Community backend (Phase 6+, low priority) | **Supabase**: Postgres, Auth, Row-Level Security, edge functions | Free tier; SQL suits builds, likes and rankings; a JS client; no server code to run yourself |
| Android (Phase 4) | Capacitor 6+ → sideloaded APK | Reuses the web build; the databank is bundled for full offline use |

**Offline-first rule:** the API can only *add* things: saved builds, likes, top lists. Random generation, filters, the editor and share-link decoding all work with no network. Community calls fail gracefully and show "offline". Local favourites live in IndexedDB.

---

## 3. Data model

### 3.1 Gadget (`gadgets.json`)
```jsonc
{
  "schemaVersion": 1,
  "gameVersion": "1.4.1",          // game version the data reflects
  "source": "https://sonic.fandom.com/wiki/Gadget_(Sonic_Racing:_CrossWorlds)",
  "gadgets": [
    {
      "id": "lv1-quick-charge",      // stable slug, never renamed
      "code": 37,                    // stable integer for share URLs; NEVER reused
      "name": "Lv1 Quick Charge",
      "names": { "ja": null, "pt": null }, // optional i18n later
      "category": "charge-upgrade",  // one of 13 category ids
      "slots": 2,                    // 1 | 2 | 3
      "isKit": false,
      "kitType": null,               // "standard" | "machine" | "character" | "advanced"
      "kitAffinity": null,           // e.g. { "machineType": "speed" } for type kits
      "description": "Level 1 Drift Charge fills faster.", // short own wording preferred (CC BY-SA, see Risks)
      "tags": ["drift", "charge", "boost"],
      "unlock": {
        "type": "start",             // start | grand-prix | plate | races | world-match | festival | shop | upcoming
        "plate": null,               // "bronze" | "silver" | "gold" | "master"
        "races": null,               // 62 | 78 | 94 ...
        "worldMatchRank": null,      // "E" | "E+" | "D-" | ... | "B"
        "festival": null,            // { "name": "Axel Festival", "points": 150, "expired": true }
        "shop": null,                // { "currency": "donpa-ticket", "cost": 100, "requires": "master-plate" }
        "text": "Available from the start",
        "inferred": false            // true = filled in from a blank wiki cell (†)
      },
      "status": "released",          // released | upcoming | removed
      "addedIn": null,               // e.g. "1.3.1"
      "timeTrialValid": null,        // true | false | null (unknown)
      "stacksWith": [],              // explicitly confirmed stack partners, e.g. air-trick-adept
      "effects": [                   // stack behaviour (§1.7); used by the later "efficient builds" mode
        {
          "key": "drift-charge-lv1",   // what the effect touches; same key = same "thing"
          "kind": "charge-level",      // cap | threshold | recurring | payout | charge-level | stat | unique
          "stacking": "additive",      // additive | max-wins | unknown
          "value": null,               // e.g. 200 for "ring-limit" caps, when known
          "confidence": "community-unverified" // wiki | community-unverified | in-game-verified
        }
      ],
      "kitContains": [],             // ids of gadgets whose effects this kit includes (when known)
      "icon": {
        "src": "/icons/gadgets/lv1-quick-charge.webp", // local copy, never hotlinked
        "sourceUrl": "https://sonic.fandom.com/wiki/File:...", // where it came from
        "credit": "© SEGA; via Sonic Wiki Zone (Fandom)",
        "fallback": { "glyph": "drift", "color": "#3BA7FF" }    // used if no image (e.g. v2.0 items)
      },
      "lastVerified": "2026-10-20",
      "notes": ""
    }
  ]
}
```
- **Effects examples:**
  - 130 Ring Limit: `{key:"ring-limit", kind:"cap", stacking:"max-wins", value:130}`
  - 200 Ring Limit: the same with `value:200`
  - Double Down / Inventory Plus: `{key:"item-slots", kind:"cap", stacking:"max-wins"}`
  - Dash Panel bounties: `{key:"rings-on-dash-panel", kind:"payout", stacking:"additive"}`
  - Fill these in gradually. An empty `effects` list means "unknown", and the MVP doesn't need them.
- **Tags** are our own words, not the game's: `drift`, `charge`, `rings`, `items`, `attack`, `defense`, `air-trick`, `start`, `lap3`, `collision`, `slipstream`, `water`, `flight`, `stats`, `time-trial`, `beginner`. They are kept in a separate `tags.json` with labels and colours.
- **Later:**
  - `characters.json`: id, name, `type` (Speed / Acceleration / Handling / Power / Boost), series, unlock.
  - `machines.json`: id, name, type, unlock.
  - Type kits can then be shown as "synergy" with the character or Machine type.

### 3.2 Build (in memory and in URLs)
```ts
type Row = (string | null)[];        // gadget ids per slot start; null = empty slot
interface Build {
  v: 1;
  plate: "normal" | "bronze" | "silver" | "gold" | "master";
  rows: [PlacedGadget[], PlacedGadget[]];
  character?: string; machine?: string;    // Phase 3
}
interface PlacedGadget { id: string; col: 0 | 1 | 2 }   // col = start column; width = gadget.slots
```

### 3.3 Supabase tables (Phase 6, low priority)
- `profiles`: `id`, `handle`, `created_at`
- `builds`:
  - `id`, `owner_id`, `title`, `encoded` (the share code), `gadget_ids text[]`, `tags text[]`, `character`, `machine`, `game_version`, `created_at`, `is_public`
- `likes`: `build_id`, `user_id`, `created_at`, primary key `(build_id, user_id)`
- View `top_builds`: likes in the last 7/30 days, plus all time
- RLS rules: anyone can read public builds; only the owner can write their own builds; a user can only create or delete their own like.

---

## 4. Randomizer algorithm

**Goal:** a random valid build, where every distinct build is equally likely (or a weighted mode later), with filters applied.

1. **Pool.**
   - **MVP:** all gadgets with `status = released` (118), and no other filters (D3).
   - **Later:** owned-only, the v2.0 toggle, tags (include any / include all / exclude), categories, "allow kits", efficient builds, and Time-Trial-valid (deferred).
   - Pinned gadgets are placed first.
2. **Row capacities.** The plate is described as one capacity per row, using the layout in §1.2:
   - Normal `[2,0]`, Bronze `[3,0]`, Silver `[3,1]`, Gold `[3,2]`, Master `[3,3]`.
   - Each gadget has to fit inside one row's capacity, so the shapes are `[3]`, `[2,1]`, `[1,2]`, `[1,1,1]`, plus partial shapes for capacity 1 or 2.
3. **Uniform sampling without bias.**
   - If you pick gadgets one after another with random fits, the result is biased toward 1-slot gadgets, because there are more of them.
   - Instead, count the combinations for each **whole-plate composition**: the number of 3-, 2- and 1-slot gadgets used.
   - For pool counts n₁, n₂, n₃, a composition with a three-slot gadgets, b two-slot and c one-slot has `C(n₃,a)·C(n₂,b)·C(n₁,c)` gadget sets.
   - For smaller plates, the same counting runs over the row capacities from step 2.
   - On a 6-slot plate, two rows of 3 slots allow these compositions (a, b, c): (2,0,0), (1,1,1), (1,0,3), (0,2,2), (0,1,4), (0,0,6). Note that (0,3,0) is impossible.
   - Pick a composition with probability proportional to its count. Then sample a, b and c distinct gadgets uniformly.
   - **Placement:** each 3-slot gadget gets its own row. Each 2-slot gadget is paired with a 1-slot gadget in a row. Put the leftover 1-slot gadgets in the remaining slots. The order inside a row is random, or sorted for display.
   - This is O(1) work per press and has no rejection loops.
4. **Constraints.**
   - Duplicates are impossible by construction, because the sampler picks distinct gadgets (D1).
   - **Overlaps are allowed in the MVP.**
   - **Later "efficient builds" mode:** reject a build if two gadgets share an `effects.key` whose `stacking` is `max-wins`. Resample up to 50 times, then fall back to a greedy fill.
5. **Fill policy:** "always fill the plate" is the default. "Allow empty slots" is a toggle.
6. **Seeded RNG.** Use a small PRNG (mulberry32 or sfc32) seeded from `crypto.getRandomValues`. The seed can go in the URL so a roll can be reproduced. This also makes tests deterministic.
7. **"Reroll one."** Click a gadget to replace only it with another gadget of the same size from the pool, so the layout stays valid.
8. **Roll types (D10).**
   - **MVP:** pure uniform rolls only.
   - **Later:** weighted by category, "one per category", favouring popular builds, and similar options. These are plugged in as different composition/pick weights.
9. **Validator (`isValid(build, rules)`).** One shared function used by the randomizer, the editor and the share-link decoder. Property test: for 10,000 seeds × random filters, every output passes `isValid`.

*Note on build counts:* with 118 released gadgets (49/31/38 by size) and no extra rules, there are millions of distinct full Master builds, so a "never repeat" feature isn't needed.

---

## 5. UI sketch

```
┌──────────────────────────────────────────────────────────────────────┐
│  CrossWorlds Gadget Randomizer            [Plate: Master ▾] [⚙ Rules] │
├───────────────────────────────────────┬──────────────────────────────┤
│        GADGET PLATE (Master)          │  YOUR BUILD                  │
│  ┌──────────────┬──────────────┬─────┐│  ① Lv1 Quick Charge   [2] 🔒 │
│  │ ⚡ Lv1 Quick Charge (2)    │ 💍  ││     Charge Upgrade · drift   │
│  │                             │Ring ││     Get: available at start  │
│  │                             │Range││  ② Ring Range UP      [1]    │
│  ├──────────────┴──────────────┴─────┤│     Get: reach Gold Plate    │
│  │ 🛡  Drift Charge Kit (3)          ││  ③ Drift Charge Kit   [3]    │
│  │                                   ││     Get: finish 78 races     │
│  └───────────────────────────────────┘│                              │
│                                       │  [□ show where to get]       │
│      [ 🎲  RANDOMIZE ]  [⟳ Reroll]    │  [📋 Copy link] [⬇ PNG]      │
├───────────────────────────────────────┴──────────────────────────────┤
│ Filters (Phase 2): [drift ✕] [+ tag]  ☐ only unlocked  ☐ no kits      │
└──────────────────────────────────────────────────────────────────────┘
```
- **Plate:**
  - A CSS Grid with `grid-template-columns: repeat(3, 1fr)` and 2 rows. Each gadget tile uses `grid-column: span <slots>`.
  - Each tile shows the **game's gadget icon** (D5; local copy, see the asset task), the name and the slot pips (●●). The tile's background colour follows the category.
  - Gadgets with no image yet (v2.0) show the fallback glyph.
  - Locked slots on smaller plates are greyed out, with a padlock icon.
  - On mobile the list stacks under the plate.
- **"Gadget loadout" community style:**
  - A dark metallic plate with rounded tiles, the game icon and a short name in each, and a header showing the plate rank.
  - Render it as SVG/HTML so that **"Download PNG"** works with `html-to-image`, for posting on Discord or X.
- **List panel:**
  - Name, slot count, category, tags.
  - The "Where to get it" toggle shows the unlock text and a † "unverified" badge where the data was inferred.
  - A lock icon pins a gadget across rerolls.
- **Accessibility:** colour is never the only cue (the text and pips carry the meaning too); the Randomize button works with Space/Enter.

---

## 6. Share-link encoding (do this early: sharing with no backend)

**Format:** `https://<site>/#b=1.<row1>.<row2>[.c<char>][.m<machine>]`
- `1` = encoding version.
- Each row is up to 3 characters per slot position in **base-36 pairs**: `code` as 2 base-36 characters (up to 1,296 gadgets), with `--` for an empty slot. Only the start slot of a gadget is written; the following slots are implied by its size.
  - Example: `#b=1.11-0x.2f` → row 1 = Lv1 Quick Charge (code `11`, 2 slots) + Ring Range UP (code `0x`); row 2 = Drift Charge Kit (`2f`). The `-` separates gadgets inside a row.
- Put it in the **hash** (`#`). Static hosts need no rewrites, and it works offline in the PWA and in Capacitor.
- The **decoder** runs `isValid()`. A broken or outdated link shows "this build is no longer valid (game update?)" and highlights the bad slot.
- **Stable integer `code` per gadget, never reused.** Reordering or renaming the JSON can't break old links. Removed gadgets stay in the file with `status: "removed"`.
- **Nice extra:** a readable fallback `#ids=lv1-quick-charge,ring-range-up,drift-charge-kit` (longer, but easy to debug).
- **Phase 6:** short links (`/b/AbC123`) come from Supabase rows. The encoded string stays the source of truth, so links still work offline.

---

## 7. Phased roadmap

Priority order (from Arthur's decisions):
1. MVP
2. Owned gadgets and filters
3. Characters and Machines
4. Android APK
5. Extras
6. Community features (a far-off dream, low priority)

### Phase 0 — Setup (½ day)
- [ ] Create the repo `sonic-randomizer`: Vite + React + TS, ESLint, Prettier, Vitest.
- [ ] Add an `AGENTS.md` with AI instructions: the stack, the rules, and "`src/core` must stay DOM-free".
- [ ] Deploy a "hello" page to a **free** Cloudflare Pages / Vercel URL.
- [ ] CI on every PR: typecheck, tests, data validation.

### Phase 1 — MVP: random build + PWA (2–3 weekends)
- **Pool and rolls:** all 118 released gadgets, uniform random rolls, Master plate by default. The plate-size selector uses the D2 layout. Overlaps are allowed and there are no duplicates.
- **Display:** the plate graphic with game icons, plus the list with a "where to get" toggle.
- **Sharing:** copy a share link (`#b=` encoding). Reroll one gadget.
- **Offline:** an installable PWA that works with no connection. English only.
- The step-by-step breakdown is in **§7a**.

### Phase 2 — My gadgets and filters (1–2 weekends)
- [ ] **"My gadgets"** (D3): a checklist of owned gadgets, with quick presets such as "everything up to Gold Plate" or "94 races done", stored in IndexedDB/localStorage. A "roll only from my gadgets" toggle.
- [ ] **"Include unreleased v2.0 gadgets"** toggle (off by default).
- [ ] Tag every gadget (`tags.json`), plus preset filters: Drift, Rings, Items, Air Tricks, No kits.
- [ ] Filter UI: include/exclude tags and categories.
- [ ] Fill in the `effects` data (start with Ring Limits, item-slot modifiers, Quick Charges, and the bounties) and add the **"Efficient builds"** toggle (§1.7).
- [ ] **Other roll types** (D10): one per category, a fixed composition ("only 1-slot"), weighted by category.
- [ ] A "Databank" page: search and browse all gadgets with their unlock info.
- [ ] A "Report wrong data" link (GitHub issue form).

### Phase 3 — Characters and machines (1 weekend)
- [ ] `characters.json` and `machines.json` (type, unlock), with their icons from the same asset pipeline.
- [ ] Randomize the character and/or the Machine; an optional "type synergy" mode that prefers matching type kits.
- [ ] Add `c` and `m` to the share encoding (as optional fields, still `v1`).

### Phase 4 — Android APK via Capacitor (1 weekend)
- [ ] `npm i @capacitor/core @capacitor/cli @capacitor/android`, then `npx cap init` and `npx cap add android`.
- [ ] Bundle `dist/`, including the gadget JSON and icons, so the app works 100% offline from install.
- [ ] Add the native Share plugin for share links, an app icon and a splash screen.
- [ ] Build a debug APK in Android Studio and sideload it onto the phone. Later, a signed release APK.
- [ ] Optional: "check for data update" fetches a newer `gadgets.json` when online.

### Phase 5 — Extras (whenever)
- [ ] The build editor (drag and drop with live `isValid`) and local favourites. These work offline and need no backend.
- [ ] Download the plate as a PNG (`html-to-image`).
- [ ] **i18n** (D6): set up `react-i18next`, add Portuguese and Japanese gadget names via `names`.
- [ ] **Time Trial** (D4, deferred): fill in `timeTrialValid` once known, then add a "Time Trial safe" filter.

### Phase 6 — Community (LOW PRIORITY, far future, D9)
- [ ] Supabase: auth, the `builds` table, RLS, and a "Publish build" button that creates a short link `/b/:id` with an OG image.
- [ ] Likes, the `top_builds` view, and Trending / Top / Newest pages.
- [ ] Moderation: reporting, owner delete, admin hide, rate limits.
- [ ] Public sharing works long before this phase, through share links that need no backend.

### 7a. MVP step-by-step (milestones for a beginner with AI help)
Each milestone ends in something you can **see or test**. Commit after each one, and ask the AI for small changes with a clear "done when" check.

| # | Milestone | Steps | Done when |
|---|---|---|---|
| **M0** | Tools ready | Install Node LTS, Git and VS Code (or Cursor). Create a GitHub account and repo. In the repo: `npm create vite@latest sonic-randomizer -- --template react-ts`, then `npm install` and `npm run dev` | The Vite + React page opens at `localhost:5173` |
| **M1** | Deployed "hello" | Connect the repo to Cloudflare Pages (build `npm run build`, output `dist`). Change the title to "CrossWorlds Gadget Randomizer" and push | The free `*.pages.dev` URL shows your title; every push redeploys it |
| **M2** | Gadget data file | Ask the AI to turn Appendix A into `src/data/gadgets.json` using the §3.1 schema (id, code, name, category, slots, unlock, status, `inferred`). Add a Zod schema and a `validate:data` script | `npm run validate:data` passes: 135 entries, 118 released, unique ids/codes, slots 1–3 |
| **M3** | Asset sourcing (icons) | Make a list of icon URLs from the wiki gadget page. Download them **once** with a script into `public/icons/gadgets/<id>.webp` (resize to 128 px). Record `sourceUrl` and `credit` in the JSON. Add a credits page | Every released gadget has a local icon, and missing ones use the fallback glyph. Nothing is hotlinked |
| **M4** | Core: validator | `src/core/validate.ts` implements the §1.6 rules for each plate (row capacities from §1.2). Add Vitest tests with valid and invalid examples, including "three 2-slot gadgets is invalid" | `npm test` is green |
| **M5** | Core: randomizer | `src/core/randomize.ts`: seeded RNG and the composition-weighted uniform sampler (§4). Property test: 10,000 rolls all pass `isValid` | Tests are green, and a `console.log` shows varied builds |
| **M6** | Plate UI | A `Plate` component: 3×2 CSS grid, tiles spanning their slot count, icon + name + pips, locked cells greyed out | Hard-coded example builds look right on desktop and phone sizes |
| **M7** | Button + list | A big **Randomize** button, a build list (name, slots, category), a "Where to get" toggle with † badges, and click-a-tile to reroll it | Pressing the button gives a new valid build every time |
| **M8** | Plate selector | A dropdown for Normal through Master; the randomizer uses the matching row capacities | A Bronze roll only fills the top row |
| **M9** | Share links | `src/core/encode.ts` (`#b=1...`) with round-trip tests. A "Copy link" button. The page reads the hash when it loads | Opening a copied link in a new tab shows the same build |
| **M10** | PWA / offline | Add `vite-plugin-pwa` (`registerType: 'autoUpdate'`), a manifest (name, colours, 192/512 px and maskable icons), and precache the JSON and icons | Lighthouse shows it as installable. On Android Chrome, choose "Install app", turn on airplane mode, open it, and Randomize still works |
| **M11** | Polish + release | A footer with "Fan project, not affiliated with SEGA" and data/icon credits, a README, a favicon, and a simple About page | You use it yourself for a week of races: **MVP done** 🎉 |

**Tips for the AI-assisted workflow:**
- Give the AI this PLAN.md and the relevant milestone row as context.
- Keep `src/core` free of React so it is easy to test.
- Ask for tests together with each core function.
- If something breaks, paste the exact error message.
- One milestone = one branch/PR.

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Image assets and IP.** We use the original game gadget icons for now (D5). They are © SEGA; the wiki copies are game assets, not CC-licensed | A takedown request is possible (low risk for a small, free fan site; higher on an app store) | Keep it non-commercial; a "not affiliated with SEGA" disclaimer; credits (© SEGA, via Sonic Wiki Zone); local copies (no hotlinking); `icon.fallback` in the data so we can **switch to original art quickly** if asked; no app-store listing |
| **Wiki text licence.** Fandom text is CC BY-SA | Copying descriptions word for word carries share-alike obligations | Write **your own short descriptions**; gadget names and slot numbers are facts; credit the sources |
| **Data accuracy.** Inferred unlocks (†), stacking rules from forum consensus, the assumed Silver/Gold layout, unknown Time Trial validity | Wrong "where to get" info or a misleading "efficient" filter | `inferred` flags and `confidence` on effects, both shown in the UI; `lastVerified`; verify in game when possible; a "report wrong data" link |
| **Game updates.** v2.0 adds ~17 gadgets; slot sizes change (Crash Pads 2→1) | Stale data, broken share links | `gameVersion` field, stable `code`s, `status: removed`, version-aware link decoding |
| **Play Store policy** for fan apps | Rejection | Not planned: PWA + sideloaded APK only |
| **Scope creep** (community features) | Never finishing | Every phase ships on its own; the MVP needs no backend |
| **AI-generated code drifting** (a hobby project with AI help) | Messy codebase | Strict TS, a pure `core` module with tests, small PRs, AGENTS.md conventions |
| **Abuse/spam** if community features ever ship (low priority) | Moderation burden | Login required to publish, RLS, rate limits, reporting |

---

## 9. Decisions (Arthur, 20 Oct 2026)

| # | Topic | Decision | Applied in |
|---|---|---|---|
| D1 | Duplicates and overlaps | **No duplicates.** Overlapping gadgets **are allowed** (kit + its parts, 130 + 200 Ring Limit, Tuner 1 + 2). Caps and thresholds don't stack (the highest wins); recurring/payout effects and Quick Charge levels do stack. *Source: Steam forum consensus, unverified.* MVP allows overlaps; an optional "efficient builds" mode comes later | §1.6, §1.7, §3.1 `effects`, §4, Phase 2 |
| D2 | Smaller plates | Bronze = full top row (Arthur). Silver/Gold fill the bottom row left to right (*assumed, unverified*) | §1.2, §4 step 2, M8 |
| D3 | Gadget pool | MVP: all released gadgets. Later: "my gadgets" + a v2.0 toggle | §4 step 1, Phase 2 |
| D4 | Time Trial | Unknown, **deferred** (Arthur can't check the game right now) | `timeTrialValid: null`, Phase 5 |
| D5 | Images | Use the **original game gadget icons** for now (local copies with attribution); original art only if needed later | §3.1 `icon`, §5, M3, §8 |
| D6 | Language | English only for the MVP; other languages later | Phase 5 |
| D7 | Android | **PWA first**, APK via **Capacitor** later | §2.3, M10, Phase 4 |
| D8 | Hosting | Free hosting URL (`*.pages.dev` / `*.vercel.app`) | §2.4, M1 |
| D9 | Community | Public someday, but a far-off dream: **low priority** | Phase 6 |
| D10 | Roll types | MVP: **pure uniform** rolls; other roll types later | §4 step 8, Phase 2 |

### Still open
1. **Time Trial:** which gadgets are invalid in Time Trial? (D4, check in game later.)
2. **Plate layout check:** confirm in game that Silver/Gold slots fill the bottom row left to right, and where Normal's 2 slots sit.
3. **Stacking check:** confirm the forum rules (§1.7) in game, especially whether Tuner 1 + Tuner 2 stat gains add up.
4. **Inferred unlocks (†):** check them against Arthur's save when convenient.
5. **Visual style:** do you have a reference "gadget loadout" image you'd like the plate to imitate?
6. **Community login** (only relevant for Phase 6): GitHub, Google, or magic link?

---

## Appendix A — Gadget list (seed for `gadgets.json`)
Source: Sonic Wiki Zone (Fandom), read 20 Oct 2026.
- **†** = the wiki cell was blank; the value was taken from the row above (assumed row-spanning cell) and **needs checking in game**.
- **UPCOMING** rows are not in the game yet.
- Gadgets with "100 Donpa Tickets" can be bought after reaching the Master Plate.

| # | Category | Gadget | Slots | Unlock / where to get |
|---|---|---|---|---|
| 1 | Ring Gain | Champion Bounty | 3 | Reach Master Plate (added 1.3.1) |
| 2 | Ring Gain | Route Planner Bounty | 1 | Reach Master Plate (added 1.3.1) |
| 3 | Ring Gain | Starting Boost Bounty | 1 | Finish a Grand Prix |
| 4 | Ring Gain | Air Trick Bounty | 1 | Reach Master Plate |
| 5 | Ring Gain | Item Attack Bounty | 1 | Reach Master Plate † |
| 6 | Ring Gain | Runoff Bounty | 1 | Reach Master Plate † |
| 7 | Ring Gain | Slipstream Bounty | 1 | Finish 94 races |
| 8 | Ring Gain | Travel Ring Bounty | 1 | Reach Master Plate |
| 9 | Ring Gain | Morph Action Bounty | 1 | World Match Rank E+ |
| 10 | Ring Gain | Perfect Charge Bounty | 2 | World Match Rank C |
| 11 | Ring Gain | Dash Panel Bounty | 2 | Finish a Grand Prix |
| 12 | Ring Gain | Dash Panel Mini Bounty | 1 | Finish 94 races |
| 13 | Ring Gain | Dash Panel Combo Bounty | 2 | World Match Rank D |
| 14 | Ring Ability | Ring Doubler | 3 | Reach Master Plate (added 1.3.1) |
| 15 | Ring Ability | Less is More | 3 | Reach Master Plate (added 1.3.1) |
| 16 | Ring Ability | Ring Engine | 1 | Reach Master Plate (added 1.3.1) |
| 17 | Ring Ability | Hyper Ring Engine | 2 | Reach Master Plate (added 1.3.1) |
| 18 | Ring Ability | 130 Ring Limit | 1 | Finish a Grand Prix |
| 19 | Ring Ability | 200 Ring Limit | 2 | Reach Master Plate |
| 20 | Ring Ability | Mini Ring Thief | 1 | Reach Gold Plate |
| 21 | Ring Ability | Ring Thief | 2 | Reach Master Plate |
| 22 | Ring Ability | Ring Gain Mini Boost | 1 | Reach Gold Plate |
| 23 | Ring Ability | Ring Gain Boost | 2 | Reach Master Plate |
| 24 | Ring Ability | Ring Range UP | 1 | Reach Gold Plate |
| 25 | Technique Upgrade | Hit and Run | 2 | UPCOMING (v2.0) |
| 26 | Technique Upgrade | Extended Slipstream | 1 | Reach Gold Plate |
| 27 | Technique Upgrade | Air Drift Mobility UP | 1 | Finish 94 races |
| 28 | Technique Upgrade | Charge Jump Mobility UP | 1 | Finish 94 races † |
| 29 | Technique Upgrade | Ultimate Air Trick | 2 | Reach Gold Plate (added 1.4.1) |
| 30 | Technique Upgrade | Perfect Landing | 1 | Reach Gold Plate (added 1.4.1) † |
| 31 | Technique Upgrade | Air Trick Adept | 1 | Reach Gold Plate |
| 32 | Technique Upgrade | Air Trick Expert | 2 | Available from the start |
| 33 | Technique Upgrade | Collision Mini Boost | 1 | UPCOMING (v2.0) |
| 34 | Technique Upgrade | Collision Boost | 2 | Reach Gold Plate |
| 35 | Technique Upgrade | Spin Drift | 2 | Reach Gold Plate † |
| 36 | Charge Upgrade | Mini Lv1 Quick Charge | 1 | UPCOMING (v2.0) |
| 37 | Charge Upgrade | Lv1 Quick Charge | 2 | Available from the start |
| 38 | Charge Upgrade | Lv2 Quick Charge | 1 | Reach Gold Plate |
| 39 | Charge Upgrade | Lv3 Quick Charge | 1 | Reach Gold Plate † |
| 40 | Charge Upgrade | Lv4 Quick Charge | 1 | UPCOMING (v2.0) |
| 41 | Charge Upgrade | Ultimate Charge | 2 | Reach Gold Plate |
| 42 | Charge Upgrade | Boundless Charge | 3 | UPCOMING (v2.0) |
| 43 | Charge Upgrade | Collision Charge | 1 | UPCOMING (v2.0) † |
| 44 | Charge Upgrade | Perfect Charge Boost | 2 | Finish 94 races |
| 45 | Charge Upgrade | Break Charge | 3 | UPCOMING (v2.0) |
| 46 | Charge Upgrade | Friction Drift | 2 | World Match Rank B |
| 47 | Charge Upgrade | Technical Drift | 2 | Finish 94 races |
| 48 | Charge Upgrade | Flawless Counter Drift | 2 | UPCOMING (v2.0) |
| 49 | Charge Upgrade | Refined Counter Drift | 1 | UPCOMING (v2.0) † |
| 50 | Charge Upgrade | Counter Quick Charge | 3 | Finish 94 races |
| 51 | Stat Upgrade | Speed Mod | 1 | UPCOMING (v2.0) |
| 52 | Stat Upgrade | Acceleration Mod | 1 | UPCOMING (v2.0) † |
| 53 | Stat Upgrade | Handling Mod | 1 | UPCOMING (v2.0) † |
| 54 | Stat Upgrade | Power Mod | 1 | UPCOMING (v2.0) † |
| 55 | Stat Upgrade | Boost Mod | 1 | UPCOMING (v2.0) † |
| 56 | Stat Upgrade | Speed Tuner 1 | 1 | Reach Silver Plate |
| 57 | Stat Upgrade | Speed Tuner 2 | 1 | Finish 62 races |
| 58 | Stat Upgrade | Acceleration Tuner 1 | 1 | Reach Silver Plate |
| 59 | Stat Upgrade | Acceleration Tuner 2 | 1 | Finish 62 races |
| 60 | Stat Upgrade | Handling Tuner 1 | 1 | Reach Silver Plate |
| 61 | Stat Upgrade | Handling Tuner 2 | 1 | Finish 62 races |
| 62 | Stat Upgrade | Power Tuner 1 | 1 | Reach Silver Plate |
| 63 | Stat Upgrade | Power Tuner 2 | 1 | Finish 62 races |
| 64 | Stat Upgrade | Boost Tuner 1 | 1 | Reach Silver Plate |
| 65 | Stat Upgrade | Boost Tuner 2 | 1 | Finish 62 races |
| 66 | Power Up | Air Trick Evolution | 1 | UPCOMING |
| 67 | Power Up | Damage Evolution | 1 | Reach Gold Plate (added 1.4.1) |
| 68 | Power Up | Item Hit Evolution | 1 | Reach Gold Plate (added 1.4.1) † |
| 69 | Power Up | Collision Evolution | 1 | Reach Gold Plate (added 1.4.1) † |
| 70 | Power Up | Ring Evolution | 1 | Reach Gold Plate (added 1.4.1) † |
| 71 | Power Up | Quick Starter | 1 | World Match Rank E |
| 72 | Power Up | Super Quick Starter | 2 | Finish 78 races |
| 73 | Power Up | Slow Starter | 2 | World Match Rank C+ |
| 74 | Power Up | Super Slow Starter | 3 | Finish 78 races |
| 75 | Support | Substitute Item | 2 | Reach Gold Plate (added 1.4.1) |
| 76 | Support | Ring Mercy | 1 | Reach Silver Plate (added 1.2.1) |
| 77 | Support | Damage Mercy | 2 | Reach Silver Plate (added 1.2.1) † |
| 78 | Support | Item Mercy | 2 | Reach Silver Plate (added 1.2.1) † |
| 79 | Support | Maximum Traction | 1 | Reach Silver Plate |
| 80 | Support | Second Wind | 1 | Reach Silver Plate † |
| 81 | Support | Bumper Guard | 1 | Reach Silver Plate † |
| 82 | Support | Invincible Start | 2 | Reach Silver Plate † |
| 83 | Support | Strong Finish | 2 | Reach Silver Plate (added 1.2.1) |
| 84 | Support | Invincible Finish | 3 | Reach Gold Plate (added 1.4.1) |
| 85 | Support | Item Keeper | 2 | Finish a Grand Prix |
| 86 | Support | Quick Recovery | 3 | Reach Silver Plate |
| 87 | Support | Mini Quick Recovery | 1 | UPCOMING (v2.0) |
| 88 | Support | Power Through | 1 | UPCOMING (v2.0) † |
| 89 | Support | Crash Pads | 1 | World Match Rank D- |
| 90 | Item Control | Summon Item Box | 2 | Reach Master Plate (added 1.3.1) |
| 91 | Item Control | Lucky Pair | 2 | Reach Silver Plate (added 1.2.1) |
| 92 | Item Control | Double Down | 3 | Reach Silver Plate (added 1.2.1) † |
| 93 | Item Control | Inventory Swap | 3 | Reach Bronze Plate |
| 94 | Item Control | Inventory Plus | 2 | Available from the start |
| 95 | Item Control | Hazard Item Chance UP | 1 | Reach Bronze Plate |
| 96 | Item Control | Attack Item Chance UP | 1 | Reach Bronze Plate † |
| 97 | Item Control | Defense Item Chance UP | 2 | Reach Bronze Plate † |
| 98 | Item Control | Boost Item Chance UP | 3 | Reach Bronze Plate † |
| 99 | Item Control | Wisp Chance UP | 1 | World Match Rank D+ |
| 100 | Upgrade/Add Item | Go Go Omochao | 2 | Reach Master Plate (added 1.3.1) |
| 101 | Upgrade/Add Item | Boost Starter | 1 | Reach Bronze Plate |
| 102 | Upgrade/Add Item | Double Boost Specialist | 2 | Available from the start |
| 103 | Upgrade/Add Item | Dark Chao Starter | 1 | Finish a Grand Prix |
| 104 | Upgrade/Add Item | Warp Ring Specialist | 2 | Finish a Grand Prix † |
| 105 | Upgrade/Add Item | Giant Rocket Punch | 1 | Reach Bronze Plate |
| 106 | Upgrade/Add Item | Giant Spiked Iron Ball | 1 | Reach Bronze Plate † |
| 107 | Upgrade/Add Item | Short Fuse | 1 | Reach Bronze Plate † |
| 108 | Upgrade/Add Item | Monster Truck Starter | 3 | Reach Bronze Plate † |
| 109 | Standard Kit | Drift Charge Kit | 3 | Finish 78 races |
| 110 | Standard Kit | Item Hoarder Kit | 3 | Finish 78 races † |
| 111 | Standard Kit | Damage Support Kit | 3 | Finish 78 races † |
| 112 | Machine Type Kit | Speed Machine Kit | 3 | Finish 62 races |
| 113 | Machine Type Kit | Acceleration Machine Kit | 3 | Finish 62 races † |
| 114 | Machine Type Kit | Handling Machine Kit | 3 | Finish 62 races † |
| 115 | Machine Type Kit | Power Machine Kit | 3 | Finish 62 races † |
| 116 | Machine Type Kit | Boost Machine Kit | 3 | Finish 62 races † |
| 117 | Character Type Kit | Speed Character Kit | 3 | Angry Birds Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 118 | Character Type Kit | Acceleration Character Kit | 3 | PAC-MAN Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 119 | Character Type Kit | Handling Character Kit | 3 | Joker Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 120 | Character Type Kit | Power Character Kit | 3 | Minecraft Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 121 | Character Type Kit | Boost Character Kit | 3 | Hatsune Miku Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 122 | Advanced Kit | Perfect Charge Kit | 3 | Axel Festival, 150 pts (expired) |
| 123 | Advanced Kit | 4th Stage Charge Kit | 3 | Samba de Amigo Festival, 150 pts (expired) |
| 124 | Advanced Kit | Air Trick Action Kit | 3 | TMNT Festival, 150 pts (expired) |
| 125 | Advanced Kit | Slipstream Kit | 3 | Avatar Legends Festival, 150 pts (expired) |
| 126 | Advanced Kit | Spin Dash Kit | 3 | Sonic 35th Anniversary Festival, 150 pts (expired) |
| 127 | Advanced Kit | Speedy Shortcut Kit | 3 | Hatsune Miku 2nd Festival, 140 pts (expired) |
| 128 | Advanced Kit | Item Buster Kit | 3 | Mega Man Festival, 150 pts (expired); 100 Donpa Tickets after Master Plate |
| 129 | Advanced Kit | Drift Spinner Kit | 3 | Captain Majima Festival, 150 pts (expired); 100 Donpa Tickets after Master Plate |
| 130 | Advanced Kit | Panel Combo Kit | 3 | Puyo Puyo Festival, 120 pts (expired); 100 Donpa Tickets after Master Plate |
| 131 | Advanced Kit | Comeback Kit | 3 | Ichiban Kasuga Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 132 | Advanced Kit | Ace Pilot Kit | 3 | NiGHTS Festival, 120 pts (expired); 100 Donpa Tickets after Master Plate |
| 133 | Advanced Kit | Sea Dog Kit | 3 | SpongeBob SquarePants Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 134 | Advanced Kit | All-Rounder Kit | 3 | Super Monkey Ball Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
| 135 | Advanced Kit | Wisp Hoarder Kit | 3 | Tangle & Whisper Festival, 140 pts (expired); 100 Donpa Tickets after Master Plate |
