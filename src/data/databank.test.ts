import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import rawDatabank from "./gadgets.json" with { type: "json" };
import { crossCheckPlan } from "./planCrosscheck.ts";
import { databankSchema } from "./schema.ts";
import { GADGET_TAGS } from "./tags.ts";

const plan = readFileSync("docs/PLAN.md", "utf8");

const WIKI_SENTENCES = [
  "Get Rings while in 1st through 3rd place.",
  "increase maximum Ring Limit.",
  "Not counted for Team Matches.",
  "slowly lose Rings over time.",
  "Prevents slipping on sand and ice.",
  "always get double the items.",
  "Perform Air Tricks faster.",
  "Slipstreams occur more often.",
];

describe("gadget databank", () => {
  const databank = databankSchema.parse(rawDatabank);

  it("matches the schema and is the real list, not the M0 seed", () => {
    expect(databank.placeholder).toBeUndefined();
    expect(databank.schemaVersion).toBe(1);
    expect(databank.gameVersion).toBe("1.4.1");
    expect(databank.gadgets).toHaveLength(135);
  });

  it("has unique ids and codes, with slot sizes 1, 2, or 3", () => {
    const ids = databank.gadgets.map((gadget) => gadget.id);
    const codes = databank.gadgets.map((gadget) => gadget.code);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(codes).size).toBe(codes.length);
    expect(
      databank.gadgets.every((gadget) => [1, 2, 3].includes(gadget.slots)),
    ).toBe(true);
  });

  it("counts 118 released and 17 upcoming, with the released slot mix from the plan", () => {
    const released = databank.gadgets.filter(
      (gadget) => gadget.status === "released",
    );
    const upcoming = databank.gadgets.filter(
      (gadget) => gadget.status === "upcoming",
    );

    expect(released).toHaveLength(118);
    expect(upcoming).toHaveLength(17);
    expect(
      databank.gadgets.filter((gadget) => gadget.status === "removed"),
    ).toHaveLength(0);

    expect(released.filter((gadget) => gadget.slots === 1)).toHaveLength(49);
    expect(released.filter((gadget) => gadget.slots === 2)).toHaveLength(31);
    expect(released.filter((gadget) => gadget.slots === 3)).toHaveLength(38);
  });

  it("agrees with docs/PLAN.md Appendix A", () => {
    expect(crossCheckPlan(databank.gadgets, plan)).toEqual([]);
  });

  it("keeps the stable codes from the M0 examples", () => {
    const codeOf = new Map(
      databank.gadgets.map((gadget) => [gadget.id, gadget.code]),
    );
    expect(codeOf.get("lv1-quick-charge")).toBe(37);
    expect(codeOf.get("air-trick-adept")).toBe(31);
    expect(codeOf.get("air-trick-expert")).toBe(32);
    expect(codeOf.get("ring-range-up")).toBe(24);
    expect(codeOf.get("drift-charge-kit")).toBe(109);
  });

  it("stores a local icon for every released gadget and a fallback for the rest", () => {
    const iconDir = "public/icons/gadgets";
    const files = new Set(readdirSync(iconDir));

    for (const gadget of databank.gadgets) {
      if (gadget.status === "released") {
        expect(gadget.icon.src, gadget.name).toBe(
          `/icons/gadgets/${gadget.id}.webp`,
        );
        expect(files.has(`${gadget.id}.webp`), gadget.name).toBe(true);
      } else {
        expect(gadget.icon.src, gadget.name).toBeNull();
        expect(files.has(`${gadget.id}.webp`), gadget.name).toBe(false);
      }
    }

    expect(files.size).toBe(118);
  });

  it("optimizes icons to small webp files", async () => {
    const iconDir = "public/icons/gadgets";
    for (const file of readdirSync(iconDir)) {
      const path = join(iconDir, file);
      const bytes = readFileSync(path);
      expect(bytes.subarray(0, 4).toString("ascii"), file).toBe("RIFF");
      expect(bytes.length, file).toBeLessThan(30_000);
      const meta = await sharp(bytes).metadata();
      expect(meta.format, file).toBe("webp");
      expect(meta.width ?? 0, file).toBeLessThanOrEqual(128);
      expect(meta.height ?? 0, file).toBeLessThanOrEqual(128);
    }
  });

  it("does not paste wiki sentences into descriptions", () => {
    const blob = JSON.stringify(databank);
    for (const sentence of WIKI_SENTENCES) {
      expect(blob).not.toContain(sentence);
    }
    for (const gadget of databank.gadgets) {
      expect(gadget.description.length).toBeGreaterThan(10);
      expect(gadget.description.length).toBeLessThan(240);
      expect(gadget.tags.every((tag) => GADGET_TAGS.includes(tag))).toBe(true);
    }
  });

  it("records only the wiki-confirmed Air Trick stack, and leaves unknown fields empty", () => {
    const byId = new Map(databank.gadgets.map((gadget) => [gadget.id, gadget]));
    expect(byId.get("air-trick-adept")?.stacksWith).toEqual([
      "air-trick-expert",
    ]);
    expect(byId.get("air-trick-expert")?.stacksWith).toEqual([
      "air-trick-adept",
    ]);

    for (const gadget of databank.gadgets) {
      expect(gadget.effects).toEqual([]);
      expect(gadget.kitContains).toEqual([]);
      expect(gadget.timeTrialValid).toBeNull();
      if (gadget.id !== "air-trick-adept" && gadget.id !== "air-trick-expert") {
        expect(gadget.stacksWith, gadget.id).toEqual([]);
      }
    }
  });

  it("marks spanned unlock cells and the unversioned upcoming row", () => {
    const byName = new Map(
      databank.gadgets.map((gadget) => [gadget.name, gadget]),
    );
    const itemAttack = byName.get("Item Attack Bounty");
    expect(itemAttack?.unlock.inferred).toBe(true);
    expect(itemAttack?.unlock.plate).toBe("master");
    expect(itemAttack?.notes).toContain("spanned cell");

    const collisionCharge = byName.get("Collision Charge");
    expect(collisionCharge?.status).toBe("upcoming");
    expect(collisionCharge?.unlock.inferred).toBe(true);
    expect(collisionCharge?.unlock.text).toContain("2.0");

    const airTrickEvolution = byName.get("Air Trick Evolution");
    expect(airTrickEvolution?.status).toBe("upcoming");
    expect(airTrickEvolution?.unlock.inferred).toBe(false);
    expect(airTrickEvolution?.unlock.text).toBe("Upcoming");
    expect(airTrickEvolution?.notes).toContain("does not name version 2.0");

    expect(
      databank.gadgets.filter((gadget) => gadget.unlock.inferred),
    ).toHaveLength(35);
  });

  it("rejects a reused gadget code", () => {
    const broken = structuredClone(rawDatabank);
    broken.gadgets[1]!.code = broken.gadgets[0]!.code;

    expect(() => databankSchema.parse(broken)).toThrow(/Duplicate gadget code/);
  });

  it("rejects a hotlinked icon", () => {
    const broken = structuredClone(rawDatabank);
    broken.gadgets[0]!.icon.src = "https://sonic.fandom.com/icon.webp";

    expect(() => databankSchema.parse(broken)).toThrow(/Local icon path/);
  });

  it("points every referenced icon file at something on disk", () => {
    for (const gadget of databank.gadgets) {
      if (!gadget.icon.src) {
        continue;
      }
      const relative = gadget.icon.src.replace(/^\//, "");
      expect(existsSync(join("public", relative)), gadget.id).toBe(true);
    }
  });
});
