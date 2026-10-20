export interface WikiGadgetRow {
  categoryLabel: string;
  name: string;
  slots: 1 | 2 | 3;
  fileName: string;
  /** Unlock cell with wiki markup removed. */
  unlockPlain: string;
  /** True when that cell was blank and came from a rowspan above it. */
  unlockInferred: boolean;
}

interface Cell {
  attrs: Record<string, string>;
  text: string;
}

const COLUMN_COUNT = 5;

function parseAttrs(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/([a-z]+)\s*=\s*"([^"]*)"/gi)) {
    const key = match[1];
    const value = match[2];
    if (key && value !== undefined) {
      attrs[key.toLowerCase()] = value;
    }
  }
  return attrs;
}

/** Drop wiki links, templates, and italics. Leave the words. */
export function stripWiki(text: string): string {
  return text
    .replace(/\{\{[^{}]*\}\}/g, " ")
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1")
    .replace(/''+/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCells(body: string): Cell[] {
  const cells: { attrs: Record<string, string>; lines: string[] }[] = [];

  for (const line of body.split("\n")) {
    if (line.trim() === "") {
      continue;
    }

    const isCell = line.startsWith("|") || line.startsWith("!");
    if (!isCell) {
      const current = cells[cells.length - 1];
      if (!current) {
        throw new Error(`Table text is outside a cell: ${line}`);
      }
      current.lines.push(line);
      continue;
    }

    let attrs: Record<string, string> = {};
    let rest: string;
    if (line.startsWith("||")) {
      rest = line.slice(2);
    } else {
      rest = line.slice(1);
      const attrSplit =
        /^(\s*(?:colspan|rowspan|style|class|align)=[^|]*)\|(.*)$/s.exec(rest);
      if (attrSplit) {
        attrs = parseAttrs(attrSplit[1] ?? "");
        rest = attrSplit[2] ?? "";
      }
    }
    cells.push({ attrs, lines: [rest] });
  }

  return cells.map((cell) => ({
    attrs: cell.attrs,
    text: cell.lines.join("\n").trim(),
  }));
}

function takeRow(
  cells: Cell[],
  pending: ({ left: number; cell: Cell } | null)[],
): { cells: Cell[]; carried: boolean[] } {
  const filled: Cell[] = [];
  const carried: boolean[] = [];
  let next = 0;

  for (let column = 0; column < COLUMN_COUNT; column += 1) {
    const span = pending[column];
    if (span && span.left > 0) {
      filled.push(span.cell);
      carried.push(true);
      span.left -= 1;
      if (span.left === 0) {
        pending[column] = null;
      }
      continue;
    }

    const cell = cells[next];
    next += 1;
    if (!cell) {
      throw new Error("A gadget row ran out of cells.");
    }
    filled.push(cell);
    carried.push(false);
    const spanCount = Number(cell.attrs.rowspan ?? "1");
    if (spanCount > 1) {
      pending[column] = { left: spanCount - 1, cell };
    }
  }

  if (next !== cells.length) {
    throw new Error(
      `A gadget row has ${cells.length} cells after rowspan fill; expected ${COLUMN_COUNT}.`,
    );
  }

  return { cells: filled, carried };
}

/**
 * Read the gadget wikitable. Descriptions in the wiki are intentionally
 * dropped here so they cannot be copied into the databank.
 */
export function parseGadgetTable(wikitext: string): WikiGadgetRow[] {
  const start = wikitext.indexOf('{| class="wikitable"');
  const end = wikitext.indexOf("\n|}", start);
  if (start < 0 || end < 0) {
    throw new Error("The wiki page has no gadget wikitable.");
  }

  const chunks = wikitext.slice(start, end).split("\n|-").slice(1);
  const pending: ({ left: number; cell: Cell } | null)[] = Array.from(
    { length: COLUMN_COUNT },
    () => null,
  );
  const rows: WikiGadgetRow[] = [];
  let categoryLabel: string | null = null;

  for (const chunk of chunks) {
    const cells = parseCells(chunk);
    if (cells.length === 0 || cells.every((cell) => cell.text === "")) {
      continue;
    }

    if (cells.length === 1 && cells[0]?.attrs.colspan === "5") {
      if (pending.some((span) => span && span.left > 0)) {
        throw new Error(
          `A rowspan crossed into the category "${cells[0].text}".`,
        );
      }
      categoryLabel = cells[0].text.trim();
      continue;
    }

    if (!categoryLabel) {
      throw new Error("A gadget row appeared before a category heading.");
    }

    const filled = takeRow(cells, pending);
    const fileName = filled.cells[0]?.text.match(/\[\[File:([^|\]]+)/)?.[1];
    const name = stripWiki(filled.cells[1]?.text ?? "");
    const slots = Number(stripWiki(filled.cells[3]?.text ?? ""));
    const unlockPlain = stripWiki(filled.cells[4]?.text ?? "");
    const unlockInferred = filled.carried[4] === true;

    if (!fileName) {
      throw new Error(`No icon file for ${name || "a gadget row"}.`);
    }
    if (!name) {
      throw new Error(`Missing gadget name near ${fileName}.`);
    }
    if (slots !== 1 && slots !== 2 && slots !== 3) {
      throw new Error(`${name} has slot size ${slots}, expected 1, 2, or 3.`);
    }
    if (!unlockPlain) {
      throw new Error(`${name} has an empty unlock cell.`);
    }

    rows.push({
      categoryLabel,
      name,
      slots,
      fileName,
      unlockPlain,
      unlockInferred,
    });
  }

  if (pending.some((span) => span && span.left > 0)) {
    throw new Error("A rowspan was still open at the end of the table.");
  }

  return rows;
}
