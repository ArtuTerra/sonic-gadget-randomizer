import { GRID_COLUMNS, GRID_ROWS } from "../core/plate.ts";

/** Empty 2 × 3 plate. Tiles that span a gadget's slots arrive with the plate UI milestone. */
export function Plate() {
  const cells = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let column = 0; column < GRID_COLUMNS; column += 1) {
      cells.push(
        <div
          key={`${row}-${column}`}
          className="plate-slot"
          role="gridcell"
          aria-label={`Row ${row + 1}, column ${column + 1}, empty`}
        >
          <span className="plate-slot-mark" aria-hidden="true" />
        </div>,
      );
    }
  }

  return (
    <div
      className="plate"
      role="grid"
      aria-label="Empty gadget plate, 2 rows of 3 slots"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
      }}
    >
      {cells}
    </div>
  );
}
