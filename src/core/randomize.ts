import { releasedGadgets, type PoolGadget } from "./pool.ts";
import {
  GRID_ROWS,
  PLATE_ROW_CAPACITIES,
  type Build,
  type ColumnIndex,
  type GadgetSlotSize,
  type PlateTier,
  type PlacedGadget,
} from "./plate.ts";
import { mulberry32, randomSeed, type Rng } from "./rng.ts";

/**
 * Roll one full plate.
 *
 * Algorithm — uniform over row shapes, then uniform gadgets:
 * 1. Take the released pool (upcoming and removed gadgets are ignored).
 * 2. List every way to fill the open cells with ordered sizes 1, 2, and 3.
 *    A row of 3 is one of `[3]`, `[2,1]`, `[1,2]`, `[1,1,1]`. A row of 2 is
 *    `[2]` or `[1,1]`. A row of 1 is `[1]`. A row of 0 is empty. The two rows
 *    are chosen together, so a 2-slot gadget can never cross the row boundary
 *    and three 2-slot gadgets can never come up.
 * 3. Drop shapes the pool cannot fill (not enough gadgets of a needed size).
 *    If nothing fills every open cell, step down to the largest slot count
 *    the pool can fill. That is the "fill every slot when possible" rule.
 * 4. Pick one of those shapes uniformly. Then, for each size, shuffle the
 *    matching gadgets and take as many as the shape needs. Lay them down
 *    left to right, top row first.
 *
 * Why shapes are not weighted by combination counts:
 * Weighting a shape by P(n₃, a) × P(n₂, b) × P(n₁, c) would make every
 * placed build equally likely. With 49 released 1-slot gadgets, about 94% of
 * Master builds are six 1-slot gadgets, so the button would almost always
 * show the same kind of plate. That is the 1-slot pile-up a left-to-right
 * fill also tends to create. Picking the partition first gives a kit row the
 * same chance as a row of three small gadgets. Inside one shape, every
 * fitting assignment of gadgets is still equally likely, and every full build
 * the pool can make has a non-zero chance.
 *
 * Duplicates are impossible because each gadget is drawn once. Overlapping
 * effects are kept: nothing here looks at kits, caps, or tags.
 *
 * Pass `rng` or `seed`. `rng` wins when both are set. With neither, the roll
 * is seeded from {@link randomSeed}.
 */
export interface RandomizeInput {
  plate: PlateTier;
  gadgets: readonly PoolGadget[];
  seed?: number;
  rng?: Rng;
}

interface PlateShape {
  rows: [readonly GadgetSlotSize[], readonly GadgetSlotSize[]];
}

export function randomize(input: RandomizeInput): Build {
  const rng = resolveRng(input);
  const pool = releasedGadgets(input.gadgets);
  const buckets = groupBySize(pool);
  const capacities = PLATE_ROW_CAPACITIES[input.plate];
  const shape = pickShape(capacities, buckets, rng);
  // RNG order after the shape pick is size 1, then 2, then 3. A size that
  // the shape does not use consumes no random numbers.
  const drawn: Record<GadgetSlotSize, PoolGadget[]> = {
    1: draw(buckets[1], countSize(shape, 1), rng),
    2: draw(buckets[2], countSize(shape, 2), rng),
    3: draw(buckets[3], countSize(shape, 3), rng),
  };
  const cursors: Record<GadgetSlotSize, number> = { 1: 0, 2: 0, 3: 0 };
  const rows: [PlacedGadget[], PlacedGadget[]] = [[], []];

  for (let rowIndex = 0; rowIndex < GRID_ROWS; rowIndex += 1) {
    let column = 0;
    const pattern = shape.rows[rowIndex] ?? [];
    for (const size of pattern) {
      const gadget = drawn[size][cursors[size]];
      cursors[size] += 1;
      if (!gadget || !isStartColumn(column)) {
        throw new Error(
          "The sampler produced a gadget that does not fit the shape.",
        );
      }
      const row = rows[rowIndex];
      if (!row) {
        throw new Error("The sampler lost a plate row.");
      }
      row.push({ id: gadget.id, col: column });
      column += size;
    }
  }

  return { v: 1, plate: input.plate, rows };
}

function resolveRng(input: RandomizeInput): Rng {
  if (input.rng) return input.rng;
  if (input.seed !== undefined) return mulberry32(input.seed);
  return mulberry32(randomSeed());
}

function groupBySize(
  pool: readonly PoolGadget[],
): Record<GadgetSlotSize, PoolGadget[]> {
  return {
    1: pool.filter((gadget) => gadget.slots === 1),
    2: pool.filter((gadget) => gadget.slots === 2),
    3: pool.filter((gadget) => gadget.slots === 3),
  };
}

function pickShape(
  capacities: readonly [number, number],
  buckets: Record<GadgetSlotSize, PoolGadget[]>,
  rng: Rng,
): PlateShape {
  const total = capacities[0] + capacities[1];
  for (let used = total; used >= 0; used -= 1) {
    const shapes = shapesUsing(capacities, used).filter((shape) =>
      shapeFits(shape, buckets),
    );
    if (shapes.length === 0) continue;
    return shapes[uniformIndex(shapes.length, rng)] ?? shapes[0]!;
  }
  return { rows: [[], []] };
}

function shapesUsing(
  capacities: readonly [number, number],
  used: number,
): PlateShape[] {
  const shapes: PlateShape[] = [];
  for (let top = 0; top <= capacities[0]; top += 1) {
    const bottom = used - top;
    if (bottom < 0 || bottom > capacities[1]) continue;
    for (const topShape of sequencesOfSum(top)) {
      for (const bottomShape of sequencesOfSum(bottom)) {
        shapes.push({ rows: [topShape, bottomShape] });
      }
    }
  }
  return shapes;
}

/** Ordered ways to sum exactly to `sum` with parts 1, 2, and 3. */
function sequencesOfSum(sum: number): GadgetSlotSize[][] {
  if (sum === 0) return [[]];
  const sequences: GadgetSlotSize[][] = [];
  const walk = (remaining: number, current: GadgetSlotSize[]) => {
    if (remaining === 0) {
      sequences.push(current);
      return;
    }
    for (const size of [1, 2, 3] as const) {
      if (size > remaining) continue;
      walk(remaining - size, [...current, size]);
    }
  };
  walk(sum, []);
  return sequences;
}

function shapeFits(
  shape: PlateShape,
  buckets: Record<GadgetSlotSize, PoolGadget[]>,
): boolean {
  return (
    countSize(shape, 1) <= buckets[1].length &&
    countSize(shape, 2) <= buckets[2].length &&
    countSize(shape, 3) <= buckets[3].length
  );
}

function countSize(shape: PlateShape, size: GadgetSlotSize): number {
  let count = 0;
  for (const row of shape.rows) {
    for (const part of row) {
      if (part === size) count += 1;
    }
  }
  return count;
}

function draw(
  items: readonly PoolGadget[],
  count: number,
  rng: Rng,
): PoolGadget[] {
  if (count <= 0) return [];
  const copy = items.slice();
  const take = Math.min(count, copy.length);
  for (let index = 0; index < take; index += 1) {
    const span = copy.length - index;
    const swap = index + uniformIndex(span, rng);
    const current = copy[index]!;
    copy[index] = copy[swap]!;
    copy[swap] = current;
  }
  return copy.slice(0, take);
}

function uniformIndex(count: number, rng: Rng): number {
  if (count <= 1) return 0;
  const value = rng();
  const unit = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return Math.min(count - 1, Math.floor(unit * count));
}

function isStartColumn(column: number): column is ColumnIndex {
  return column === 0 || column === 1 || column === 2;
}
