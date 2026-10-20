import { describe, expect, it } from "vitest";
import { databank } from "../data/index.ts";
import {
  ShareCodeError,
  decodeBuild,
  encodeBuild,
  shareHash,
} from "./encode.ts";
import type { PoolGadget } from "./pool.ts";
import { PLATE_TIERS, type Build, type PlateTier } from "./plate.ts";
import { randomize } from "./randomize.ts";

const gadgets: PoolGadget[] = [
  { id: "one-a", code: 1, slots: 1 },
  { id: "one-b", code: 2, slots: 1 },
  { id: "two-a", code: 4, slots: 2 },
  { id: "three-a", code: 7, slots: 3 },
  { id: "soon", code: 9, slots: 1, status: "upcoming" },
  { id: "gone", code: 10, slots: 1, status: "removed" },
];

const released = databank.gadgets.map((gadget) => ({
  id: gadget.id,
  code: gadget.code,
  slots: gadget.slots,
  status: gadget.status,
}));

function build(
  plate: PlateTier,
  top: Build["rows"][0],
  bottom: Build["rows"][1] = [],
): Build {
  return { v: 1, plate, rows: [top, bottom] };
}

describe("share codes", () => {
  it("round-trips seeded rolls for every tier", () => {
    for (const plate of PLATE_TIERS) {
      for (let seed = 0; seed < 40; seed += 1) {
        const rolled = randomize({ plate, gadgets: released, seed });
        const hash = shareHash(rolled, released);
        expect(hash.startsWith("#b=1.")).toBe(true);
        expect(decodeBuild(hash, released)).toEqual(rolled);
        expect(
          decodeBuild(`https://play.example/tools${hash}`, released),
        ).toEqual(rolled);
        expect(decodeBuild(encodeBuild(rolled, released), released)).toEqual(
          rolled,
        );
      }
    }
  });

  it("encodes the real Lv1 Quick Charge example from the plan's format", () => {
    const example = build(
      "master",
      [
        { id: "lv1-quick-charge", col: 0 },
        { id: "ring-range-up", col: 2 },
      ],
      [{ id: "drift-charge-kit", col: 0 }],
    );
    expect(encodeBuild(example, released)).toBe("1.11-0o.31.pmaster");
    expect(shareHash(example, released)).toBe("#b=1.11-0o.31.pmaster");
    expect(decodeBuild("#b=1.11-0O.31.Pmaster", released)).toEqual(example);
  });

  it("keeps an empty cell between gadgets and drops locked cells", () => {
    const gapped = build("master", [
      { id: "one-a", col: 0 },
      { id: "one-b", col: 2 },
    ]);
    expect(encodeBuild(gapped, gadgets)).toBe("1.01----02..pmaster");
    expect(decodeBuild("1.01----02..pmaster", gadgets)).toEqual(gapped);

    const normal = build("normal", [{ id: "two-a", col: 0 }]);
    expect(encodeBuild(normal, gadgets)).toBe("1.04..pnormal");
    expect(decodeBuild("#b=1.04..pnormal", gadgets)).toEqual(normal);
  });

  it("infers the smallest plate when the suffix is missing, and keeps character ids", () => {
    const normal = build("normal", [{ id: "two-a", col: 0 }]);
    expect(decodeBuild("1.04.", gadgets)).toEqual(normal);

    const bronze = build("bronze", [{ id: "three-a", col: 0 }]);
    expect(
      decodeBuild(
        encodeBuild(bronze, gadgets).replace(".pbronze", ""),
        gadgets,
      ),
    ).toEqual(bronze);

    const shared = build(
      "gold",
      [{ id: "three-a", col: 0 }],
      [{ id: "two-a", col: 0 }],
    );
    shared.character = "sonic";
    shared.machine = "blue-star";
    expect(encodeBuild(shared, gadgets)).toBe(
      "1.07.04.pgold.csonic.mblue-star",
    );
    expect(decodeBuild(shareHash(shared, gadgets), gadgets)).toEqual(shared);
  });

  it("rejects a broken, unknown, or unreleased code", () => {
    expect(() => decodeBuild("#b=nope", gadgets)).toThrow(ShareCodeError);
    expect(() => decodeBuild("#b=2.01.", gadgets)).toThrow(/Unsupported/);
    expect(() => decodeBuild("#b=1.2r..pmaster", gadgets)).toThrow(/Unknown/);
    expect(() => decodeBuild("#b=1.07..pnormal", gadgets)).toThrow(
      /does not fit/,
    );
    expect(() => decodeBuild("#b=1.01-01..pmaster", gadgets)).toThrow(
      /no longer valid/,
    );
    expect(() => decodeBuild("#b=1.0a..pmaster", gadgets)).toThrow(
      /no longer valid/,
    );
    expect(() => decodeBuild("#b=1.09..pmaster", gadgets)).toThrow(
      /no longer valid/,
    );
    expect(() =>
      encodeBuild(build("master", [{ id: "gone", col: 0 }]), gadgets),
    ).toThrow(ShareCodeError);
  });
});
