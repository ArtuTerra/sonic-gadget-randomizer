import { describe, expect, it } from "vitest";
import { eligibleGadgets, parseIdList, serializeIdList } from "./filter.ts";
import type { PoolGadget } from "./pool.ts";
import { PLATE_SLOT_COUNTS } from "./plate.ts";
import { randomize } from "./randomize.ts";
import { validateBuild } from "./validate.ts";

const gadgets: PoolGadget[] = [
  { id: "a", slots: 1, status: "released" },
  { id: "b", slots: 1, status: "released" },
  { id: "c", slots: 2, status: "released" },
  { id: "u", slots: 1, status: "upcoming" },
  { id: "r", slots: 1, status: "removed" },
  { id: "d", slots: 3 },
];

const ids = (pool: PoolGadget[]) => pool.map((gadget) => gadget.id);

describe("eligibleGadgets", () => {
  it("defaults to released gadgets, all owned", () => {
    expect(ids(eligibleGadgets(gadgets))).toEqual(["a", "b", "c", "d"]);
  });

  it("drops unowned gadgets", () => {
    const pool = eligibleGadgets(gadgets, { unowned: new Set(["b", "d"]) });
    expect(ids(pool)).toEqual(["a", "c"]);
  });

  it("includes upcoming only when asked, relabelled as released", () => {
    const pool = eligibleGadgets(gadgets, { includeUpcoming: true });
    expect(ids(pool)).toEqual(["a", "b", "c", "u", "d"]);
    expect(pool.find((gadget) => gadget.id === "u")?.status).toBe("released");
  });

  it("never includes removed gadgets", () => {
    const pool = eligibleGadgets(gadgets, { includeUpcoming: true });
    expect(ids(pool)).not.toContain("r");
  });

  it("rolls only owned gadgets and stays valid", () => {
    const pool = eligibleGadgets(gadgets, {
      unowned: new Set(["a"]),
      includeUpcoming: true,
    });
    for (let seed = 1; seed <= 50; seed += 1) {
      const build = randomize({ plate: "master", gadgets: pool, seed });
      const placed = build.rows.flat().map((item) => item.id);
      expect(placed).not.toContain("a");
      expect(validateBuild(build, { gadgets: pool })).toEqual([]);
    }
  });

  it("fills what it can when the owned set is too small", () => {
    const pool = eligibleGadgets(gadgets, {
      unowned: new Set(["b", "c", "d"]),
    });
    const build = randomize({ plate: "master", gadgets: pool, seed: 7 });
    expect(build.rows.flat().map((item) => item.id)).toEqual(["a"]);
    expect(PLATE_SLOT_COUNTS.master).toBeGreaterThan(1);
  });

  it("returns an empty plate when nothing is owned", () => {
    const pool = eligibleGadgets(gadgets, {
      unowned: new Set(["a", "b", "c", "d"]),
    });
    const build = randomize({ plate: "master", gadgets: pool, seed: 1 });
    expect(build.rows.flat()).toEqual([]);
  });
});

describe("id list storage", () => {
  it("round-trips", () => {
    const set = new Set(["b", "a"]);
    expect(parseIdList(serializeIdList(set))).toEqual(new Set(["a", "b"]));
  });

  it("treats junk as empty", () => {
    expect(parseIdList(null).size).toBe(0);
    expect(parseIdList("not json").size).toBe(0);
    expect(parseIdList('{"a":1}').size).toBe(0);
    expect(parseIdList('["a", 3, ""]')).toEqual(new Set(["a"]));
  });
});
