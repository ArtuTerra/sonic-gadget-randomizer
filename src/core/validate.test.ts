import { describe, expect, it } from "vitest";
import { databank } from "../data/index.ts";
import type { PoolGadget } from "./pool.ts";
import type { Build } from "./plate.ts";
import { isValid, validateBuild } from "./validate.ts";

const gadgets: PoolGadget[] = [
  { id: "one-a", code: 1, slots: 1 },
  { id: "one-b", code: 2, slots: 1 },
  { id: "one-c", code: 3, slots: 1 },
  { id: "two-a", code: 4, slots: 2 },
  { id: "two-b", code: 5, slots: 2 },
  { id: "two-c", code: 6, slots: 2 },
  { id: "three-a", code: 7, slots: 3 },
  { id: "three-b", code: 8, slots: 3 },
  { id: "soon", code: 9, slots: 1, status: "upcoming" },
  { id: "gone", code: 10, slots: 1, status: "removed" },
];

function build(
  plate: Build["plate"],
  top: Build["rows"][0],
  bottom: Build["rows"][1] = [],
): Build {
  return { v: 1, plate, rows: [top, bottom] };
}

describe("isValid", () => {
  it("accepts a full build on every plate tier", () => {
    expect(
      isValid(build("normal", [{ id: "two-a", col: 0 }]), { gadgets }),
    ).toBe(true);
    expect(
      isValid(build("bronze", [{ id: "three-a", col: 0 }]), { gadgets }),
    ).toBe(true);
    expect(
      isValid(
        build("silver", [{ id: "three-a", col: 0 }], [{ id: "one-a", col: 0 }]),
        { gadgets },
      ),
    ).toBe(true);
    expect(
      isValid(
        build("gold", [{ id: "three-a", col: 0 }], [{ id: "two-a", col: 0 }]),
        { gadgets },
      ),
    ).toBe(true);
    expect(
      isValid(
        build(
          "master",
          [
            { id: "two-a", col: 0 },
            { id: "one-a", col: 2 },
          ],
          [{ id: "three-a", col: 0 }],
        ),
        { gadgets },
      ),
    ).toBe(true);
  });

  it("allows empty cells and an empty plate", () => {
    expect(isValid(build("master", [], []), { gadgets })).toBe(true);
    expect(
      isValid(build("master", [{ id: "one-a", col: 0 }]), { gadgets }),
    ).toBe(true);
  });

  it("rejects three 2-slot gadgets", () => {
    const threeTwos = build(
      "master",
      [{ id: "two-a", col: 0 }],
      [
        { id: "two-b", col: 0 },
        { id: "two-c", col: 1 },
      ],
    );
    expect(isValid(threeTwos, { gadgets })).toBe(false);
    expect(validateBuild(threeTwos, { gadgets }).join(" ")).toMatch(
      /overlap|does not fit/i,
    );
  });

  it("rejects duplicates, overlaps, and gadgets that leave their row", () => {
    expect(
      isValid(
        build("bronze", [
          { id: "one-a", col: 0 },
          { id: "one-a", col: 1 },
        ]),
        { gadgets },
      ),
    ).toBe(false);
    expect(
      isValid(
        build("bronze", [
          { id: "two-a", col: 0 },
          { id: "one-a", col: 1 },
        ]),
        { gadgets },
      ),
    ).toBe(false);
    expect(
      isValid(build("master", [{ id: "two-a", col: 2 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("normal", [], [{ id: "one-a", col: 0 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("normal", [{ id: "one-a", col: 2 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("normal", [{ id: "three-a", col: 0 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("silver", [], [{ id: "two-a", col: 0 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("gold", [], [{ id: "two-a", col: 1 }]), { gadgets }),
    ).toBe(false);
  });

  it("rejects unknown, upcoming, and removed gadgets", () => {
    expect(
      isValid(build("bronze", [{ id: "missing", col: 0 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("bronze", [{ id: "soon", col: 0 }]), { gadgets }),
    ).toBe(false);
    expect(
      isValid(build("bronze", [{ id: "gone", col: 0 }]), { gadgets }),
    ).toBe(false);
  });

  it("allows a duplicate only when the rule says so", () => {
    const doubled = build("bronze", [
      { id: "one-a", col: 0 },
      { id: "one-a", col: 1 },
    ]);
    expect(isValid(doubled, { gadgets, allowDuplicates: true })).toBe(true);
  });

  it("allows overlapping effects from different gadgets", () => {
    const pool = databank.gadgets.map((gadget) => ({
      id: gadget.id,
      code: gadget.code,
      slots: gadget.slots,
      status: gadget.status,
    }));
    const overlapping = build(
      "master",
      [
        { id: "air-trick-expert", col: 0 },
        { id: "air-trick-adept", col: 2 },
      ],
      [
        { id: "130-ring-limit", col: 0 },
        { id: "200-ring-limit", col: 1 },
      ],
    );
    expect(validateBuild(overlapping, { gadgets: pool })).toEqual([]);
  });
});
