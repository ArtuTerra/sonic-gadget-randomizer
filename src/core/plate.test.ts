import { describe, expect, it } from "vitest";
import {
  DUPLICATE_GADGETS_ALLOWED,
  GADGET_SLOT_SIZES,
  GRID_COLUMNS,
  GRID_ROWS,
  PLATE_ROW_CAPACITIES,
  PLATE_SLOT_COUNTS,
  PLATE_TIERS,
} from "./plate.ts";

describe("plate rules", () => {
  it("uses a 2 by 3 grid and slot sizes 1, 2, or 3", () => {
    expect(GRID_ROWS).toBe(2);
    expect(GRID_COLUMNS).toBe(3);
    expect(GADGET_SLOT_SIZES).toEqual([1, 2, 3]);
    expect(DUPLICATE_GADGETS_ALLOWED).toBe(false);
  });

  it("matches the Normal through Master row layouts", () => {
    expect(PLATE_ROW_CAPACITIES.normal).toEqual([2, 0]);
    expect(PLATE_ROW_CAPACITIES.bronze).toEqual([3, 0]);
    expect(PLATE_ROW_CAPACITIES.silver).toEqual([3, 1]);
    expect(PLATE_ROW_CAPACITIES.gold).toEqual([3, 2]);
    expect(PLATE_ROW_CAPACITIES.master).toEqual([3, 3]);

    for (const tier of PLATE_TIERS) {
      const [top, bottom] = PLATE_ROW_CAPACITIES[tier];
      expect(top + bottom).toBe(PLATE_SLOT_COUNTS[tier]);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(bottom).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThanOrEqual(GRID_COLUMNS);
      expect(bottom).toBeLessThanOrEqual(GRID_COLUMNS);
    }
  });
});
