import { describe, expect, it } from "vitest";
import rawDatabank from "./gadgets.json" with { type: "json" };
import { databankSchema } from "./schema.ts";

describe("placeholder gadget databank", () => {
  it("matches the schema and is marked as a seed, not the full list", () => {
    const databank = databankSchema.parse(rawDatabank);

    expect(databank.placeholder).toBe(true);
    expect(databank.schemaVersion).toBe(1);
    expect(databank.gadgets.length).toBeGreaterThan(0);
    expect(databank.gadgets.length).toBeLessThan(20);
    expect(new Set(databank.gadgets.map((gadget) => gadget.slots))).toEqual(
      new Set([1, 2, 3]),
    );
  });

  it("rejects a reused gadget code", () => {
    const broken = structuredClone(rawDatabank);
    broken.gadgets[1]!.code = broken.gadgets[0]!.code;

    expect(() => databankSchema.parse(broken)).toThrow(/Duplicate gadget code/);
  });
});
