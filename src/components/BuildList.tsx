import { GadgetIcon } from "./GadgetIcon.tsx";
import type { Build } from "../core/plate.ts";
import { CATEGORY_LABELS } from "../data/categories.ts";
import type { Gadget } from "../data/types.ts";

function slotLabel(slots: number): string {
  return slots === 1 ? "1 slot" : `${slots} slots`;
}

export function BuildList({
  build,
  gadgetsById,
}: {
  build: Build;
  gadgetsById: Map<string, Gadget>;
}) {
  const equipped = ([0, 1] as const).flatMap((row) =>
    [...build.rows[row]]
      .sort((left, right) => left.col - right.col)
      .map((placed) => ({ row, placed })),
  );
  const inferred = equipped.some(
    (item) => gadgetsById.get(item.placed.id)?.unlock.inferred,
  );

  if (equipped.length === 0) {
    return <p className="empty-build">Nothing equipped.</p>;
  }

  return (
    <>
      <ol className="build-list">
        {equipped.map((item, index) => {
          const gadget = gadgetsById.get(item.placed.id);
          if (!gadget) {
            return (
              <li key={`${item.row}-${item.placed.id}`} className="build-card">
                <div>
                  <h3>{item.placed.id}</h3>
                  <p className="gadget-meta">Unknown gadget</p>
                </div>
              </li>
            );
          }
          return (
            <li key={`${item.row}-${gadget.id}`} className="build-card">
              <GadgetIcon gadget={gadget} size={48} />
              <div>
                <h3>
                  <span className="build-index">{index + 1}</span>
                  {gadget.name}
                </h3>
                <p className="gadget-meta">
                  {slotLabel(gadget.slots)} · {CATEGORY_LABELS[gadget.category]}{" "}
                  · {item.row === 0 ? "Top row" : "Bottom row"}
                </p>
                <p>{gadget.description}</p>
                <p className="gadget-unlock">
                  Unlock: {gadget.unlock.text}
                  {gadget.unlock.inferred ? (
                    <abbr
                      className="inferred"
                      title="Copied from the wiki row above. Not checked in game."
                    >
                      †
                    </abbr>
                  ) : null}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {inferred ? (
        <p className="inferred-note">
          <abbr title="Copied from the wiki row above. Not checked in game.">
            †
          </abbr>{" "}
          This unlock was copied from a blank wiki cell. It has not been checked
          in game.
        </p>
      ) : null}
    </>
  );
}
