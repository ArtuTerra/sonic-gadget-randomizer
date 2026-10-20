import { GadgetIcon } from "./GadgetIcon.tsx";
import {
  GRID_COLUMNS,
  GRID_ROWS,
  PLATE_ROW_CAPACITIES,
  PLATE_SLOT_COUNTS,
  type Build,
} from "../core/plate.ts";
import type { Gadget } from "../data/types.ts";

function plateLabel(tier: Build["plate"]): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function LockIcon() {
  return (
    <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Plate({
  build,
  gadgetsById,
}: {
  build: Build;
  gadgetsById: Map<string, Gadget>;
}) {
  const label = plateLabel(build.plate);
  const cells = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const capacity = PLATE_ROW_CAPACITIES[build.plate][row];
    const placed = [...build.rows[row]].sort(
      (left, right) => left.col - right.col,
    );
    const covered = new Set<number>();
    for (const item of placed) {
      const slots = gadgetsById.get(item.id)?.slots ?? 1;
      for (let offset = 1; offset < slots; offset += 1) {
        covered.add(item.col + offset);
      }
    }

    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      if (covered.has(column)) continue;
      const start = placed.find((item) => item.col === column);
      const gadget = start ? gadgetsById.get(start.id) : undefined;
      if (gadget) {
        cells.push(
          <div
            key={`${row}-${column}`}
            className="tile"
            role="gridcell"
            data-gadget={gadget.id}
            data-slots={gadget.slots}
            data-category={gadget.category}
            aria-label={`${gadget.name}, ${gadget.slots === 1 ? "1 slot" : `${gadget.slots} slots`}`}
            style={{
              gridColumn: `${column + 1} / span ${gadget.slots}`,
              gridRow: row + 1,
            }}
          >
            <GadgetIcon gadget={gadget} size={gadget.slots === 1 ? 36 : 44} />
            <span className="tile-copy">
              <span className="tile-name">{gadget.name}</span>
              <span className="tile-pips" aria-hidden="true">
                {"●".repeat(gadget.slots)}
              </span>
            </span>
          </div>,
        );
        continue;
      }

      const locked = column >= capacity;
      cells.push(
        <div
          key={`${row}-${column}`}
          className={locked ? "plate-locked" : "plate-empty"}
          role="gridcell"
          data-locked={locked ? "true" : undefined}
          aria-label={
            locked
              ? `Row ${row + 1}, column ${column + 1}, locked`
              : `Row ${row + 1}, column ${column + 1}, empty`
          }
          style={{ gridColumn: column + 1, gridRow: row + 1 }}
        >
          {locked ? (
            <>
              <LockIcon />
              <span>Locked</span>
            </>
          ) : (
            <span className="plate-slot-mark" aria-hidden="true" />
          )}
        </div>,
      );
    }
  }

  return (
    <div className="plate-frame" data-tier={build.plate}>
      <div className="plate-rank">
        <span>{label} plate</span>
        <span>{PLATE_SLOT_COUNTS[build.plate]} slots</span>
      </div>
      <div
        className="plate"
        role="grid"
        aria-label={`${label} gadget plate, 2 rows of 3 slots`}
        style={{
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
