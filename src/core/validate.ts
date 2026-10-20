import { indexById, type PoolGadget } from "./pool.ts";
import {
  GRID_COLUMNS,
  PLATE_ROW_CAPACITIES,
  isColumnIndex,
  isPlateTier,
  type Build,
  type ColumnIndex,
} from "./plate.ts";

/**
 * Options for {@link isValid}.
 * Duplicates stay forbidden unless a future mode opts in.
 * Pass `gadgets` so slot size and release status can be checked.
 */
export interface ValidationRules {
  allowDuplicates?: boolean;
  gadgets?: readonly PoolGadget[];
}

/**
 * Shared validity check for the randomizer, the editor, and share-link decoding.
 *
 * A build is valid when:
 * - the plate tier is one of Normal through Master
 * - every gadget is in the catalog and released (when a catalog is passed)
 * - each gadget lies inside its row's open cells and does not cross rows
 * - gadgets in a row do not cover the same cell
 * - the same gadget id is not equipped twice, unless `allowDuplicates` is set
 *
 * Empty cells are allowed. Overlapping *effects* (a kit plus one of its parts,
 * two ring limits, and so on) are allowed, because this check only looks at
 * ids and geometry.
 */
export function isValid(build: Build, rules?: ValidationRules): boolean {
  return validateBuild(build, rules).length === 0;
}

export function validateBuild(build: Build, rules?: ValidationRules): string[] {
  const issues: string[] = [];
  if (build.v !== 1) {
    issues.push("Only build version 1 is supported.");
  }
  if (!isPlateTier(build.plate)) {
    issues.push("Unknown plate tier.");
    return issues;
  }
  if (!Array.isArray(build.rows) || build.rows.length !== 2) {
    issues.push("A build needs a top row and a bottom row.");
    return issues;
  }

  const catalog = rules?.gadgets ? indexById(rules.gadgets) : null;
  const seen = new Set<string>();
  const capacities = PLATE_ROW_CAPACITIES[build.plate];

  build.rows.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) {
      issues.push(`Row ${rowIndex + 1} is missing.`);
      return;
    }
    const capacity = capacities[rowIndex] ?? 0;
    const occupied: (string | null)[] = [null, null, null];

    for (const placed of row) {
      if (!placed || typeof placed.id !== "string" || placed.id.length === 0) {
        issues.push(`Row ${rowIndex + 1} has a gadget with no id.`);
        continue;
      }
      if (!isColumnIndex(placed.col)) {
        issues.push(`${placed.id} does not start on a real column.`);
        continue;
      }

      const known = catalog?.get(placed.id);
      if (catalog && !known) {
        issues.push(`${placed.id} is not in the gadget catalog.`);
        continue;
      }
      if (known && known.status && known.status !== "released") {
        issues.push(`${placed.id} is not a released gadget.`);
        continue;
      }

      if (seen.has(placed.id) && !rules?.allowDuplicates) {
        issues.push(`${placed.id} is equipped more than once.`);
      }
      seen.add(placed.id);

      const slots = known?.slots;
      if (slots === undefined) {
        issues.push(`${placed.id} has no known slot size.`);
        continue;
      }
      coverCells(
        issues,
        occupied,
        placed.id,
        placed.col,
        slots,
        capacity,
        rowIndex,
      );
    }
  });

  return issues;
}

function coverCells(
  issues: string[],
  occupied: (string | null)[],
  id: string,
  col: ColumnIndex,
  slots: number,
  capacity: number,
  rowIndex: number,
): void {
  for (let offset = 0; offset < slots; offset += 1) {
    const cell = col + offset;
    if (cell >= GRID_COLUMNS || cell >= capacity) {
      issues.push(
        `${id} does not fit in row ${rowIndex + 1} (capacity ${capacity}).`,
      );
      return;
    }
    const already = occupied[cell];
    if (already) {
      issues.push(`${id} overlaps ${already} in row ${rowIndex + 1}.`);
      return;
    }
    occupied[cell] = id;
  }
}
