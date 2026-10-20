import { indexByCode, indexById, type PoolGadget } from "./pool.ts";
import {
  GRID_COLUMNS,
  PLATE_ROW_CAPACITIES,
  PLATE_TIERS,
  isColumnIndex,
  isPlateTier,
  type Build,
  type PlateTier,
  type PlacedGadget,
} from "./plate.ts";
import { isValid } from "./validate.ts";

/**
 * Share links use the URL hash so a static host and an offline PWA can open
 * them with no server rewrites.
 *
 * `#b=1.<row1>.<row2>.p<plate>[.c<character>][.m<machine>]`
 *
 * Each row is dash-separated 2-character tokens. A token is a gadget `code`
 * in base 36 (`37` → `11`), or `--` for one empty open cell. Only the start
 * cell of a gadget is written; the rest of its width is implied by `slots`.
 * Locked cells are not written. The plate suffix is required when we encode,
 * because a full Normal build and a partial larger plate can hold the same
 * gadgets. Decoding a code with no `.p` suffix picks the smallest tier that
 * fits.
 *
 * docs/PLAN.md §6 shows `#b=1.11-0x.2f` with illustrative codes. Real codes
 * are the stable integers in the databank, so Lv1 Quick Charge plus Ring
 * Range UP plus Drift Charge Kit on Master is `#b=1.11-0o.31.pmaster`.
 */
export const SHARE_ENCODING_VERSION = 1;
export const SHARE_HASH_KEY = "b";

const CODE_TOKEN = /^[0-9a-z]{2}$/i;
const SLUG_TOKEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ShareCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShareCodeError";
  }
}

export function shareHash(
  build: Build,
  gadgets: readonly PoolGadget[],
): string {
  return `#${SHARE_HASH_KEY}=${encodeBuild(build, gadgets)}`;
}

export function encodeBuild(
  build: Build,
  gadgets: readonly PoolGadget[],
): string {
  if (!isValid(build, { gadgets })) {
    throw new ShareCodeError("This build is no longer valid (game update?).");
  }
  const byId = indexById(gadgets);
  const capacities = PLATE_ROW_CAPACITIES[build.plate];
  const row1 = encodeRow(build.rows[0], capacities[0], byId);
  const row2 = encodeRow(build.rows[1], capacities[1], byId);
  const parts = [String(SHARE_ENCODING_VERSION), row1, row2, `p${build.plate}`];
  if (build.character)
    parts.push(`c${requireSlug(build.character, "character")}`);
  if (build.machine) parts.push(`m${requireSlug(build.machine, "machine")}`);
  return parts.join(".");
}

export function decodeBuild(
  hash: string,
  gadgets: readonly PoolGadget[],
): Build {
  const code = extractShareCode(hash);
  const parts = code.split(".");
  if (parts[0] !== String(SHARE_ENCODING_VERSION)) {
    throw new ShareCodeError("Unsupported share code.");
  }
  if (parts.length < 3) {
    throw new ShareCodeError("Share code is missing a row.");
  }

  const suffixes = readSuffixes(parts.slice(3));
  const byCode = indexByCode(gadgets);
  const byId = indexById(gadgets);
  const plate = suffixes.plate ?? "master";
  const capacities = PLATE_ROW_CAPACITIES[plate];
  const rows: Build["rows"] = [
    decodeRow(parts[1] ?? "", capacities[0], byCode),
    decodeRow(parts[2] ?? "", capacities[1], byCode),
  ];
  const build: Build = {
    v: 1,
    plate: suffixes.plate ?? inferPlate(rows, byId),
    rows,
  };
  if (suffixes.character) build.character = suffixes.character;
  if (suffixes.machine) build.machine = suffixes.machine;

  if (!isValid(build, { gadgets })) {
    throw new ShareCodeError("This build is no longer valid (game update?).");
  }
  return build;
}

function requireSlug(value: string, label: string): string {
  if (!SLUG_TOKEN.test(value)) {
    throw new ShareCodeError(`The ${label} id cannot go in a share code.`);
  }
  return value;
}

function extractShareCode(input: string): string {
  const trimmed = input.trim();
  const hashAt = trimmed.indexOf("#");
  const fragment = hashAt >= 0 ? trimmed.slice(hashAt + 1) : trimmed;
  const prefix = `${SHARE_HASH_KEY}=`;
  if (fragment.startsWith(prefix)) return fragment.slice(prefix.length);
  const fromQuery = new URLSearchParams(fragment).get(SHARE_HASH_KEY);
  if (fromQuery) return fromQuery;
  if (
    fragment === String(SHARE_ENCODING_VERSION) ||
    fragment.startsWith(`${SHARE_ENCODING_VERSION}.`)
  ) {
    return fragment;
  }
  throw new ShareCodeError("Missing share code.");
}

function readSuffixes(parts: readonly string[]): {
  plate: PlateTier | null;
  character?: string;
  machine?: string;
} {
  let plate: PlateTier | null = null;
  let character: string | undefined;
  let machine: string | undefined;

  for (const part of parts) {
    if (part.length < 2) {
      throw new ShareCodeError("Share code has an empty suffix.");
    }
    const kind = part[0]?.toLowerCase();
    const value = part.slice(1).toLowerCase();
    if (kind === "p") {
      if (plate || !isPlateTier(value)) {
        throw new ShareCodeError("Share code has a bad plate tier.");
      }
      plate = value;
    } else if (kind === "c") {
      if (character || !SLUG_TOKEN.test(value)) {
        throw new ShareCodeError("Share code has a bad character id.");
      }
      character = value;
    } else if (kind === "m") {
      if (machine || !SLUG_TOKEN.test(value)) {
        throw new ShareCodeError("Share code has a bad machine id.");
      }
      machine = value;
    } else {
      throw new ShareCodeError("Share code has an unknown suffix.");
    }
  }

  return { plate, character, machine };
}

function encodeRow(
  placed: readonly PlacedGadget[],
  capacity: number,
  byId: Map<string, PoolGadget>,
): string {
  const cells: Array<number | "covered" | null> = [null, null, null];
  for (const gadget of [...placed].sort(
    (left, right) => left.col - right.col,
  )) {
    const known = byId.get(gadget.id);
    if (!known || known.code === undefined) {
      throw new ShareCodeError(`${gadget.id} has no share code.`);
    }
    if (!isColumnIndex(gadget.col)) {
      throw new ShareCodeError(`${gadget.id} does not start on a real column.`);
    }
    cells[gadget.col] = known.code;
    for (let offset = 1; offset < known.slots; offset += 1) {
      const covered = gadget.col + offset;
      if (covered < GRID_COLUMNS) cells[covered] = "covered";
    }
  }

  const tokens: string[] = [];
  for (let column = 0; column < capacity; column += 1) {
    const cell = cells[column];
    if (cell === "covered") continue;
    tokens.push(cell === null ? "--" : encodeCode(cell));
  }
  while (tokens[tokens.length - 1] === "--") tokens.pop();
  return tokens.join("-");
}

function encodeCode(code: number): string {
  if (!Number.isInteger(code) || code < 0 || code > 1295) {
    throw new ShareCodeError(
      `Gadget code ${code} does not fit in two base-36 digits.`,
    );
  }
  return code.toString(36).padStart(2, "0");
}

function decodeRow(
  source: string,
  capacity: number,
  byCode: Map<number, PoolGadget>,
): PlacedGadget[] {
  const placed: PlacedGadget[] = [];
  let cursor = 0;
  for (const token of parseRowTokens(source)) {
    if (cursor >= capacity) {
      throw new ShareCodeError("A row has more slots than the plate allows.");
    }
    if (token === "--") {
      cursor += 1;
      continue;
    }
    if (!CODE_TOKEN.test(token)) {
      throw new ShareCodeError(`Bad slot token "${token}".`);
    }
    const code = Number.parseInt(token, 36);
    const gadget = byCode.get(code);
    if (!gadget) throw new ShareCodeError(`Unknown gadget code ${code}.`);
    if (cursor + gadget.slots > capacity) {
      throw new ShareCodeError("A gadget does not fit in the row.");
    }
    if (!isColumnIndex(cursor)) {
      throw new ShareCodeError("A gadget starts outside the row.");
    }
    placed.push({ id: gadget.id, col: cursor });
    cursor += gadget.slots;
  }
  return placed;
}

function parseRowTokens(source: string): string[] {
  if (source === "") return [];
  const tokens: string[] = [];
  let index = 0;
  while (index < source.length) {
    if (tokens.length > 0) {
      if (source[index] !== "-") {
        throw new ShareCodeError("A row is missing a slot separator.");
      }
      index += 1;
    }
    const token = source.slice(index, index + 2);
    if (token.length !== 2 || (token !== "--" && !CODE_TOKEN.test(token))) {
      throw new ShareCodeError(`Bad slot token "${token}".`);
    }
    tokens.push(token.toLowerCase() === "--" ? "--" : token.toLowerCase());
    index += 2;
  }
  return tokens;
}

function inferPlate(
  rows: Build["rows"],
  byId: Map<string, PoolGadget>,
): PlateTier {
  const used = rows.map((row) => {
    let span = 0;
    for (const gadget of row) {
      const slots = byId.get(gadget.id)?.slots ?? 0;
      span = Math.max(span, gadget.col + slots);
    }
    return span;
  });
  for (const tier of PLATE_TIERS) {
    const [top, bottom] = PLATE_ROW_CAPACITIES[tier];
    if ((used[0] ?? 0) <= top && (used[1] ?? 0) <= bottom) return tier;
  }
  return "master";
}
