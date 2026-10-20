import { describe, expect, it } from "vitest";
import { databank } from "../data/index.ts";
import type { PoolGadget } from "./pool.ts";
import {
  PLATE_ROW_CAPACITIES,
  PLATE_TIERS,
  type Build,
  type PlateTier,
} from "./plate.ts";
import { randomize } from "./randomize.ts";
import { validateBuild } from "./validate.ts";

const released = databank.gadgets.map((gadget) => ({
  id: gadget.id,
  code: gadget.code,
  slots: gadget.slots,
  status: gadget.status,
}));

const byId = new Map(released.map((gadget) => [gadget.id, gadget]));

function shapeKey(build: Build): string {
  return build.rows
    .map((row) =>
      [...row]
        .sort((left, right) => left.col - right.col)
        .map((item) => byId.get(item.id)?.slots ?? "?")
        .join(""),
    )
    .join("|");
}

function expectFullAndValid(build: Build, plate: PlateTier): void {
  expect(build.plate).toBe(plate);
  expect(build.v).toBe(1);
  expect(validateBuild(build, { gadgets: released })).toEqual([]);

  const ids = build.rows.flat().map((item) => item.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) {
    expect(byId.get(id)?.status).toBe("released");
  }

  const capacities = PLATE_ROW_CAPACITIES[plate];
  build.rows.forEach((row, rowIndex) => {
    const sorted = [...row].sort((left, right) => left.col - right.col);
    let cursor = 0;
    for (const item of sorted) {
      expect(item.col).toBe(cursor);
      cursor += byId.get(item.id)?.slots ?? 0;
    }
    expect(cursor).toBe(capacities[rowIndex]);
  });
}

describe("randomize", () => {
  it("fills every slot of every tier with a valid released build", () => {
    for (const plate of PLATE_TIERS) {
      for (let seed = 0; seed < 2000; seed += 1) {
        expectFullAndValid(
          randomize({ plate, gadgets: released, seed }),
          plate,
        );
      }
    }
  });

  it("repeats a seed and follows an injected rng", () => {
    const first = randomize({ plate: "master", gadgets: released, seed: 1 });
    const second = randomize({ plate: "master", gadgets: released, seed: 1 });
    expect(second).toEqual(first);
    expect(
      randomize({ plate: "master", gadgets: released, seed: 2 }),
    ).not.toEqual(first);

    const forced = randomize({
      plate: "master",
      gadgets: released,
      seed: 1,
      rng: () => 0,
    });
    expect(forced).toEqual(
      randomize({ plate: "master", gadgets: released, rng: () => 0 }),
    );
    expect(forced).not.toEqual(
      randomize({ plate: "master", gadgets: released, rng: () => 0.999 }),
    );
  });

  it("never equips an upcoming gadget or a repeated id from the pool", () => {
    const pool: PoolGadget[] = [
      { id: "only", slots: 1, code: 1, status: "released" },
      { id: "only", slots: 1, code: 2, status: "released" },
      { id: "later", slots: 3, code: 3, status: "upcoming" },
      { id: "retired", slots: 2, code: 4, status: "removed" },
    ];
    const build = randomize({ plate: "master", gadgets: pool, seed: 4 });
    expect(build.rows.flat().map((item) => item.id)).toEqual(["only"]);
    expect(validateBuild(build, { gadgets: pool })).toEqual([]);
  });

  it("fills as many slots as the pool allows when a full plate is impossible", () => {
    const twos: PoolGadget[] = [
      { id: "two-a", slots: 2, code: 1 },
      { id: "two-b", slots: 2, code: 2 },
    ];
    const bronze = randomize({ plate: "bronze", gadgets: twos, seed: 1 });
    expect(bronze.rows[1]).toEqual([]);
    expect(bronze.rows[0]).toHaveLength(1);
    expect(validateBuild(bronze, { gadgets: twos })).toEqual([]);

    const threes: PoolGadget[] = [
      { id: "three-a", slots: 3, code: 1 },
      { id: "three-b", slots: 3, code: 2 },
    ];
    const silver = randomize({ plate: "silver", gadgets: threes, seed: 2 });
    expect(silver.rows[1]).toEqual([]);
    expect(silver.rows[0]).toHaveLength(1);
    expect(["three-a", "three-b"]).toContain(silver.rows[0][0]?.id);
  });

  it("gives each fitting Normal shape a roughly even chance", () => {
    const rolls = 2000;
    let wide = 0;
    const seen = new Set<string>();
    for (let seed = 0; seed < rolls; seed += 1) {
      const build = randomize({ plate: "normal", gadgets: released, seed });
      const key = shapeKey(build);
      seen.add(key);
      if (key === "2|") wide += 1;
    }
    expect(seen).toEqual(new Set(["2|", "11|"]));
    expect(wide / rolls).toBeGreaterThan(0.42);
    expect(wide / rolls).toBeLessThan(0.58);
  });

  it("reaches every full Master shape without piling onto 1-slot builds", () => {
    const rolls = 800;
    const counts = new Map<string, number>();
    for (let seed = 0; seed < rolls; seed += 1) {
      const build = randomize({ plate: "master", gadgets: released, seed });
      const key = shapeKey(build);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const rowShapes = ["3", "21", "12", "111"];
    const expected = rowShapes.flatMap((top) =>
      rowShapes.map((bottom) => `${top}|${bottom}`),
    );
    expect([...counts.keys()].sort()).toEqual(expected.sort());
    expect(counts.get("111|111") ?? 0).toBeLessThan(rolls * 0.2);
    expect(counts.get("3|3") ?? 0).toBeGreaterThan(rolls * 0.02);

    let oneSlotGadgets = 0;
    let gadgets = 0;
    for (let seed = 0; seed < rolls; seed += 1) {
      const build = randomize({ plate: "master", gadgets: released, seed });
      for (const item of build.rows.flat()) {
        gadgets += 1;
        if (byId.get(item.id)?.slots === 1) oneSlotGadgets += 1;
      }
    }
    const share = oneSlotGadgets / gadgets;
    expect(share).toBeGreaterThan(0.5);
    expect(share).toBeLessThan(0.75);
  });

  it("weights shapes evenly on a small pool, so a kit row is not starved", () => {
    const pool: PoolGadget[] = [
      { id: "one-a", slots: 1 },
      { id: "one-b", slots: 1 },
      { id: "one-c", slots: 1 },
      { id: "two-a", slots: 2 },
      { id: "two-b", slots: 2 },
      { id: "three-a", slots: 3 },
      { id: "three-b", slots: 3 },
    ];
    const local = new Map(pool.map((gadget) => [gadget.id, gadget]));
    const rolls = 2000;
    let twoKits = 0;
    const seen = new Set<string>();
    for (let seed = 0; seed < rolls; seed += 1) {
      const build = randomize({ plate: "master", gadgets: pool, seed });
      expect(validateBuild(build, { gadgets: pool })).toEqual([]);
      const key = build.rows
        .map((row) =>
          [...row]
            .sort((left, right) => left.col - right.col)
            .map((item) => local.get(item.id)?.slots)
            .join(""),
        )
        .join("|");
      seen.add(key);
      if (key === "3|3") twoKits += 1;
      expect(key).not.toBe("111|111");
    }
    expect(seen.has("3|3")).toBe(true);
    expect(seen.has("111|3")).toBe(true);
    expect(seen.has("21|12")).toBe(true);
    expect(twoKits / rolls).toBeGreaterThan(0.05);
    expect(twoKits / rolls).toBeLessThan(0.14);
  });
});
