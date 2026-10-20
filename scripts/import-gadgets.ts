/**
 * Rebuild src/data/gadgets.json and public/icons/gadgets from Sonic Wiki Zone.
 *
 *   npm run import:gadgets
 *   npm run import:gadgets -- --parse-only
 *
 * --parse-only checks the wiki table and prints the plan diff. It does not
 * download icons or write the databank.
 *
 * Codes already in a real (non-placeholder) databank are kept. A gadget that
 * disappears from the wiki stays in the file with status "removed" so its
 * code is never reused. New gadgets get the next free code.
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { categoryIdForLabel, type CategoryId } from "../src/data/categories.ts";
import {
  FALLBACK_ICON_CREDIT,
  ICON_CREDIT,
  WIKI_GADGET_PAGE,
} from "../src/data/credits.ts";
import { crossCheckPlan } from "../src/data/planCrosscheck.ts";
import { databankSchema, type Gadget } from "../src/data/schema.ts";
import { GADGET_COPY, type GadgetCopy } from "./gadget-copy.ts";
import { parseGadgetTable, type WikiGadgetRow } from "./parse-gadget-table.ts";

const USER_AGENT =
  "CrossWorldsGadgetRandomizer/0.1 (personal fan project; gadget databank import)";
const API = "https://sonic.fandom.com/api.php";
const GAME_VERSION = "1.4.1";
const DATABANK_NOTES = [
  "Imported from the Sonic Wiki Zone gadget table.",
  "Descriptions are original short paraphrases, not wiki text.",
  "Unlock cells with inferred true were blank on that row and taken from the spanned cell above. They are not checked in game.",
  "kitContains is empty: the wiki describes kit effects but does not name component gadget ids.",
  "effects is empty: stacking beyond Air Trick Adept and Air Trick Expert is not recorded here.",
  "timeTrialValid is null: the wiki does not say which gadgets Time Trial rejects.",
  "Upcoming gadgets are not in the current game. Icons the wiki does not host use the fallback.",
].join(" ");

const STAT_TYPES = [
  "speed",
  "acceleration",
  "handling",
  "power",
  "boost",
] as const;

const CATEGORY_FALLBACK: Record<CategoryId, { glyph: string; color: string }> =
  {
    "ring-gain": { glyph: "ring", color: "#F0C14A" },
    "ring-ability": { glyph: "ring", color: "#E0A106" },
    "technique-upgrade": { glyph: "air", color: "#7DDE92" },
    "charge-upgrade": { glyph: "drift", color: "#3BA7FF" },
    "stat-upgrade": { glyph: "stat", color: "#F08A5D" },
    "power-up": { glyph: "power", color: "#FF8FA3" },
    support: { glyph: "shield", color: "#8EB8FF" },
    "item-control": { glyph: "item", color: "#C084FC" },
    "upgrade-add-item": { glyph: "item", color: "#E879F9" },
    "standard-kit": { glyph: "kit", color: "#67E8F9" },
    "machine-type-kit": { glyph: "kit", color: "#34D399" },
    "character-type-kit": { glyph: "kit", color: "#FBBF24" },
    "advanced-kit": { glyph: "kit", color: "#FB7185" },
  };

const STACKS: Record<string, string[]> = {
  "air-trick-adept": ["air-trick-expert"],
  "air-trick-expert": ["air-trick-adept"],
};

const root = join(import.meta.dirname, "..");
const dataPath = join(root, "src/data/gadgets.json");
const planPath = join(root, "docs/PLAN.md");
const iconDir = join(root, "public/icons/gadgets");

interface ImageFile {
  url: string;
  page: string;
}

type Draft = Omit<Gadget, "code">;

function gadgetId(name: string): string {
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Cannot make a stable id for "${name}".`);
  }
  return id;
}

function fileKey(name: string): string {
  return name.replace(/^File:/, "").replace(/_/g, " ");
}

function versionGreater(left: string, right: string): boolean {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    if (av !== bv) {
      return av > bv;
    }
  }
  return false;
}

function emptyUnlock(
  type: Gadget["unlock"]["type"],
  text: string,
  inferred: boolean,
): Gadget["unlock"] {
  return {
    type,
    plate: null,
    races: null,
    worldMatchRank: null,
    festival: null,
    shop: null,
    text,
    inferred,
  };
}

function parseUnlock(
  plain: string,
  inferred: boolean,
): { unlock: Gadget["unlock"]; addedIn: string | null } {
  const added = plain.match(/\(added in (\d+\.\d+\.\d+) update\)/i);
  const addedIn = added?.[1] ?? null;
  const core = plain
    .replace(/\s*\(added in \d+\.\d+\.\d+ update\)/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (/^upcoming\b/i.test(core)) {
    const namesVersion = /version 2\.0/i.test(core);
    return {
      addedIn,
      unlock: emptyUnlock(
        "upcoming",
        namesVersion ? "Upcoming in version 2.0" : "Upcoming",
        inferred,
      ),
    };
  }

  const festival = core.match(
    /Earn (\d+) points during the (.+?) Festival \(Expired\)/i,
  );
  if (festival?.[1] && festival[2]) {
    const points = Number(festival[1]);
    const festivalName = `${festival[2].trim()} Festival`;
    const hasShop = /100 Donpa Tickets/i.test(core);
    const text = hasShop
      ? `${festivalName}, ${points} points (expired); 100 Donpa Tickets after Master Plate`
      : `${festivalName}, ${points} points (expired)`;
    return {
      addedIn,
      unlock: {
        ...emptyUnlock("festival", text, inferred),
        festival: { name: festivalName, points, expired: true },
        shop: hasShop
          ? { currency: "donpa-ticket", cost: 100, requires: "master-plate" }
          : null,
      },
    };
  }

  const plate = core.match(/^Reach (Bronze|Silver|Gold|Master) Plate$/);
  if (plate?.[1]) {
    const label = plate[1];
    return {
      addedIn,
      unlock: {
        ...emptyUnlock(
          "plate",
          addedIn
            ? `Reach ${label} Plate (added in ${addedIn})`
            : `Reach ${label} Plate`,
          inferred,
        ),
        plate: label.toLowerCase() as "bronze" | "silver" | "gold" | "master",
      },
    };
  }

  const races = core.match(/^Finish (\d+) races$/);
  if (races?.[1]) {
    const count = Number(races[1]);
    return {
      addedIn,
      unlock: {
        ...emptyUnlock("races", `Finish ${count} races`, inferred),
        races: count,
      },
    };
  }

  if (core === "Finish a Grand Prix") {
    return {
      addedIn,
      unlock: emptyUnlock("grand-prix", "Finish a Grand Prix", inferred),
    };
  }

  if (core === "Available from the start") {
    return {
      addedIn,
      unlock: emptyUnlock("start", "Available from the start", inferred),
    };
  }

  const rank = core.match(/^Reach Rank ([A-Z][+-]?) in World Match$/);
  if (rank?.[1]) {
    return {
      addedIn,
      unlock: {
        ...emptyUnlock("world-match", `World Match rank ${rank[1]}`, inferred),
        worldMatchRank: rank[1],
      },
    };
  }

  throw new Error(`Unrecognized unlock text: ${plain}`);
}

function kitFields(
  category: CategoryId,
  name: string,
): Pick<Gadget, "isKit" | "kitType" | "kitAffinity"> {
  const kitType =
    category === "standard-kit"
      ? "standard"
      : category === "machine-type-kit"
        ? "machine"
        : category === "character-type-kit"
          ? "character"
          : category === "advanced-kit"
            ? "advanced"
            : null;

  if (kitType === null) {
    return { isKit: false, kitType: null, kitAffinity: null };
  }

  if (kitType === "standard" || kitType === "advanced") {
    return { isKit: true, kitType, kitAffinity: null };
  }

  const stat = STAT_TYPES.find((type) => name.toLowerCase().startsWith(type));
  if (!stat) {
    throw new Error(`${name} does not start with a machine or character type.`);
  }

  return {
    isKit: true,
    kitType,
    kitAffinity:
      kitType === "machine" ? { machineType: stat } : { characterType: stat },
  };
}

function notesFor(
  copy: GadgetCopy,
  unlock: Gadget["unlock"],
  fileMissing: boolean,
  fileName: string,
): string {
  const parts: string[] = [];
  if (copy.notes) {
    parts.push(copy.notes);
  }
  if (unlock.inferred) {
    parts.push(
      "Unlock was copied from the wiki row above (a spanned cell) and has not been checked in game.",
    );
  }
  if (unlock.type === "upcoming" && !unlock.text.includes("2.0")) {
    parts.push(
      "The wiki only says this gadget is upcoming. It does not name version 2.0.",
    );
  }
  if (fileMissing) {
    parts.push(
      `The wiki links File:${fileName}, but that file is not on the wiki.`,
    );
  }
  return parts.join(" ");
}

function toDraft(
  row: WikiGadgetRow,
  image: ImageFile | undefined,
  verifiedOn: string,
): Draft {
  const category = categoryIdForLabel(row.categoryLabel);
  if (!category) {
    throw new Error(`Unknown category "${row.categoryLabel}".`);
  }
  const copy = GADGET_COPY[row.name];
  if (!copy) {
    throw new Error(
      `Write an original description for "${row.name}" in scripts/gadget-copy.ts before importing it.`,
    );
  }
  const id = gadgetId(row.name);
  const { unlock, addedIn } = parseUnlock(row.unlockPlain, row.unlockInferred);
  if (addedIn && versionGreater(addedIn, GAME_VERSION)) {
    throw new Error(
      `${row.name} was added in ${addedIn}, which is newer than GAME_VERSION ${GAME_VERSION}. Update the constant after checking the wiki.`,
    );
  }

  return {
    id,
    name: row.name,
    names: { ja: null, pt: null },
    category,
    slots: row.slots,
    ...kitFields(category, row.name),
    description: copy.description,
    tags: copy.tags,
    unlock,
    status: unlock.type === "upcoming" ? "upcoming" : "released",
    addedIn,
    timeTrialValid: null,
    stacksWith: STACKS[id] ?? [],
    effects: [],
    kitContains: [],
    icon: image
      ? {
          src: `/icons/gadgets/${id}.webp`,
          sourceUrl: image.page,
          credit: ICON_CREDIT,
          fallback: CATEGORY_FALLBACK[category],
        }
      : {
          src: null,
          sourceUrl: null,
          credit: FALLBACK_ICON_CREDIT,
          fallback: CATEGORY_FALLBACK[category],
        },
    lastVerified: verifiedOn,
    notes: notesFor(copy, unlock, !image, row.fileName),
  };
}

async function fetchJson(url: URL): Promise<Record<string, unknown>> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${url.pathname}`);
      }
      return (await response.json()) as Record<string, unknown>;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

async function fetchBytes(url: string): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "image/webp,image/png,image/*",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${url}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 500) {
        throw new Error(`Image was only ${bytes.length} bytes: ${url}`);
      }
      return bytes;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

async function fetchWikitext(): Promise<string> {
  const url = new URL(API);
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", "Gadget_(Sonic_Racing:_CrossWorlds)");
  url.searchParams.set("prop", "wikitext");
  url.searchParams.set("format", "json");
  const body = await fetchJson(url);
  const parse = body.parse as
    { wikitext?: string | { "*"?: string } } | undefined;
  const wikitext = parse?.wikitext;
  const text = typeof wikitext === "string" ? wikitext : wikitext?.["*"];
  if (!text?.includes("wikitable")) {
    throw new Error("Wiki parse did not return the gadget table.");
  }
  return text;
}

async function fetchImages(
  fileNames: string[],
): Promise<Map<string, ImageFile>> {
  const found = new Map<string, ImageFile>();
  for (let index = 0; index < fileNames.length; index += 40) {
    const batch = fileNames.slice(index, index + 40);
    const url = new URL(API);
    url.searchParams.set("action", "query");
    url.searchParams.set(
      "titles",
      batch.map((name) => `File:${name}`).join("|"),
    );
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");
    url.searchParams.set("format", "json");
    const body = await fetchJson(url);
    const query = body.query as { pages?: unknown } | undefined;
    const pages = query?.pages;
    const list = Array.isArray(pages)
      ? pages
      : Object.values((pages ?? {}) as Record<string, unknown>);

    for (const page of list) {
      const record = page as {
        title?: string;
        missing?: boolean;
        imageinfo?: { url?: string; descriptionurl?: string }[];
      };
      const info = record.imageinfo?.[0];
      if (record.missing || !info?.url || !record.title) {
        continue;
      }
      if (!info.descriptionurl) {
        throw new Error(`Wiki file ${record.title} has no description page.`);
      }
      found.set(fileKey(record.title), {
        url: info.url,
        page: info.descriptionurl,
      });
    }
  }
  return found;
}

async function mapPool<T>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  async function run(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index] as T, index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    run(),
  );
  await Promise.all(workers);
}

function assignCodes(drafts: Draft[], previous: Gadget[] | null): Gadget[] {
  const keptById = new Map<string, Gadget>();
  if (previous) {
    for (const gadget of previous) {
      keptById.set(gadget.id, gadget);
    }
  }
  const used = new Set<number>(previous?.map((gadget) => gadget.code) ?? []);
  const active = new Set<string>();

  const gadgets: Gadget[] = drafts.map((draft, index) => {
    active.add(draft.id);
    const kept = keptById.get(draft.id);
    let code: number;
    if (kept) {
      code = kept.code;
    } else if (!previous) {
      code = index + 1;
    } else {
      code = 1;
      while (used.has(code)) {
        code += 1;
      }
    }
    if (used.has(code) && !kept) {
      throw new Error(`Code ${code} is already used.`);
    }
    used.add(code);
    return { ...draft, code };
  });

  if (previous) {
    for (const old of previous) {
      if (active.has(old.id)) {
        continue;
      }
      const retired =
        old.status === "removed"
          ? old.notes
          : [
              old.notes,
              "No longer listed on the wiki. The code is kept so old share links still resolve.",
            ]
              .filter((note) => note !== "")
              .join(" ");
      gadgets.push({ ...old, status: "removed", notes: retired });
    }
  }

  return gadgets;
}

function summarize(gadgets: readonly Gadget[]): Record<string, unknown> {
  const released = gadgets.filter((gadget) => gadget.status === "released");
  const slots = { 1: 0, 2: 0, 3: 0 };
  for (const gadget of released) {
    slots[gadget.slots] += 1;
  }
  const byCategory: Record<string, number> = {};
  for (const gadget of gadgets) {
    byCategory[gadget.category] = (byCategory[gadget.category] ?? 0) + 1;
  }
  return {
    total: gadgets.length,
    released: released.length,
    upcoming: gadgets.filter((gadget) => gadget.status === "upcoming").length,
    removed: gadgets.filter((gadget) => gadget.status === "removed").length,
    releasedSlots: slots,
    byCategory,
    icons: gadgets.filter((gadget) => gadget.icon.src).length,
    missingIcons: gadgets
      .filter((gadget) => gadget.icon.src === null)
      .map((gadget) => gadget.name),
    inferred: gadgets
      .filter((gadget) => gadget.unlock.inferred)
      .map((gadget) => gadget.name),
  };
}

async function main(): Promise<void> {
  const parseOnly = process.argv.includes("--parse-only");
  const verifiedOn = new Date().toISOString().slice(0, 10);
  const wikitext = await fetchWikitext();
  const rows = parseGadgetTable(wikitext);
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.name)) {
      throw new Error(`Duplicate wiki row "${row.name}".`);
    }
    seen.add(row.name);
  }
  const unusedCopy = Object.keys(GADGET_COPY).filter((name) => !seen.has(name));
  if (unusedCopy.length > 0) {
    throw new Error(
      `scripts/gadget-copy.ts has blurbs the wiki table does not list: ${unusedCopy.join(", ")}`,
    );
  }

  const images = await fetchImages(rows.map((row) => row.fileName));
  const drafts = rows.map((row) =>
    toDraft(row, images.get(fileKey(row.fileName)), verifiedOn),
  );

  const storedRaw = JSON.parse(await readFile(dataPath, "utf8")) as {
    placeholder?: boolean;
    gadgets?: Gadget[];
  };
  const previous =
    storedRaw.placeholder === true ? null : (storedRaw.gadgets ?? null);
  const gadgets = assignCodes(drafts, previous);
  const databank = databankSchema.parse({
    schemaVersion: 1,
    gameVersion: GAME_VERSION,
    source: WIKI_GADGET_PAGE,
    notes: DATABANK_NOTES,
    gadgets,
  });

  const plan = await readFile(planPath, "utf8");
  const mismatches = crossCheckPlan(databank.gadgets, plan);
  const report = {
    ...summarize(databank.gadgets),
    planMismatches: mismatches,
  };
  console.log(JSON.stringify(report, null, 2));
  if (mismatches.length > 0) {
    console.warn(
      `${mismatches.length} mismatch(es) with docs/PLAN.md Appendix A. The wiki table was still imported.`,
    );
  }

  if (parseOnly) {
    console.log("Parse only: no files written.");
    return;
  }

  await mkdir(iconDir, { recursive: true });
  let saved = 0;
  await mapPool(rows, 6, async (row) => {
    const image = images.get(fileKey(row.fileName));
    if (!image) {
      return;
    }
    const id = gadgetId(row.name);
    const bytes = await fetchBytes(image.url);
    await sharp(bytes)
      .resize(128, 128, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, alphaQuality: 90, effort: 6 })
      .toFile(join(iconDir, `${id}.webp`));
    saved += 1;
    if (saved % 20 === 0) {
      console.log(`Saved ${saved} icons...`);
    }
  });

  const keep = new Set(
    databank.gadgets
      .map((gadget) => gadget.icon.src)
      .filter((src): src is string => src !== null)
      .map((src) => src.split("/").pop() ?? src),
  );
  for (const file of await readdir(iconDir)) {
    if (!keep.has(file)) {
      await rm(join(iconDir, file));
    }
  }

  await writeFile(dataPath, `${JSON.stringify(databank, null, 2)}\n`);
  console.log(`Wrote ${databank.gadgets.length} gadgets and ${saved} icons.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
