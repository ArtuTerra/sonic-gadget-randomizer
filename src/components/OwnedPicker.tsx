import type { Gadget } from "../data/types.ts";
import { GadgetIcon } from "./GadgetIcon.tsx";

export function OwnedPicker({
  gadgets,
  unowned,
  onChange,
}: {
  gadgets: readonly Gadget[];
  unowned: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
}) {
  const owned = gadgets.filter((gadget) => !unowned.has(gadget.id)).length;
  const shownIds = gadgets.map((gadget) => gadget.id);

  function toggle(id: string) {
    const next = new Set(unowned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  return (
    <div className="owned-picker">
      <div className="owned-actions">
        <span className="owned-count">
          {owned}/{gadgets.length}
        </span>
        <button
          type="button"
          onClick={() => {
            const next = new Set(unowned);
            for (const id of shownIds) next.delete(id);
            onChange(next);
          }}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(new Set([...unowned, ...shownIds]));
          }}
        >
          None
        </button>
      </div>
      <ul className="owned-grid">
        {gadgets.map((gadget) => {
          const isOwned = !unowned.has(gadget.id);
          return (
            <li key={gadget.id}>
              <button
                type="button"
                className="owned-item"
                aria-pressed={isOwned}
                title={gadget.name}
                onClick={() => {
                  toggle(gadget.id);
                }}
              >
                <GadgetIcon gadget={gadget} size={40} />
                <span className="visually-hidden">{gadget.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
