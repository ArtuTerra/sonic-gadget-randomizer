/**
 * Gadget plate rules for Sonic Racing: CrossWorlds.
 *
 * The plate is a 2 × 3 grid. A gadget occupies 1, 2, or 3 slots and must
 * fit entirely inside one row — it cannot cross from the top row into the
 * bottom row. The same gadget cannot be equipped twice. Overlapping
 * effects (a kit plus one of its parts, two ring-limit gadgets, and so on)
 * are allowed; the randomizer does not reject them.
 *
 * Row capacities are [top, bottom]:
 * - Normal [2, 0]: the top row's left two cells. Assumed, not confirmed in game.
 * - Bronze [3, 0]: the full top row. Confirmed in game.
 * - Silver [3, 1]: full top row, plus the bottom row's left cell.
 * - Gold [3, 2]: full top row, plus the bottom row's left two cells.
 * - Master [3, 3]: both rows full.
 *
 * Bronze, Silver, and Gold follow the layouts Arthur confirmed in game.
 * docs/PLAN.md §1.2 still marks the Silver and Gold left-to-right fill as
 * assumed. The numbers here match both; do not change them without checking
 * the plan and the game.
 */

export const GRID_ROWS = 2;
export const GRID_COLUMNS = 3;

export const GADGET_SLOT_SIZES = [1, 2, 3] as const;
export type GadgetSlotSize = (typeof GADGET_SLOT_SIZES)[number];

export const PLATE_TIERS = [
  "normal",
  "bronze",
  "silver",
  "gold",
  "master",
] as const;
export type PlateTier = (typeof PLATE_TIERS)[number];

/** Slots available on [top row, bottom row]. Each value is 0–3. */
export const PLATE_ROW_CAPACITIES = {
  normal: [2, 0],
  bronze: [3, 0],
  silver: [3, 1],
  gold: [3, 2],
  master: [3, 3],
} as const satisfies Record<PlateTier, readonly [number, number]>;

export const PLATE_SLOT_COUNTS = {
  normal: 2,
  bronze: 3,
  silver: 4,
  gold: 5,
  master: 6,
} as const satisfies Record<PlateTier, number>;

/** Duplicates are forbidden. This is decision D1 in docs/PLAN.md. */
export const DUPLICATE_GADGETS_ALLOWED = false;

export type ColumnIndex = 0 | 1 | 2;

/** One equipped gadget. `col` is the start column; width is that gadget's slot size. */
export interface PlacedGadget {
  id: string;
  col: ColumnIndex;
}

/**
 * A build, in memory and (later) in share URLs.
 * `rows[0]` is the top row and `rows[1]` is the bottom row.
 */
export interface Build {
  v: 1;
  plate: PlateTier;
  rows: [PlacedGadget[], PlacedGadget[]];
  character?: string;
  machine?: string;
}
