import { useMemo, useState } from "react";
import { CATEGORY_LABELS, type CategoryId } from "../data/categories.ts";
import type { Gadget } from "../data/types.ts";

const GLYPH_LABEL: Record<string, string> = {
  ring: "R",
  drift: "Dr",
  air: "Air",
  item: "It",
  kit: "Kit",
  stat: "St",
  shield: "Sh",
  power: "Pw",
};

function GadgetMark({ gadget }: { gadget: Gadget }) {
  const [failed, setFailed] = useState(false);
  if (gadget.icon.src && !failed) {
    return (
      <img
        className="gadget-icon"
        src={gadget.icon.src}
        alt=""
        width={56}
        height={56}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }

  return (
    <span
      className="gadget-fallback"
      style={{ background: gadget.icon.fallback.color }}
      aria-hidden="true"
    >
      {GLYPH_LABEL[gadget.icon.fallback.glyph] ?? "?"}
    </span>
  );
}

function slotLabel(slots: Gadget["slots"]): string {
  return slots === 1 ? "1 slot" : `${slots} slots`;
}

export function DatabankList({ gadgets }: { gadgets: readonly Gadget[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Gadget["status"]>("all");

  const released = gadgets.filter(
    (gadget) => gadget.status === "released",
  ).length;
  const upcoming = gadgets.filter(
    (gadget) => gadget.status === "upcoming",
  ).length;
  const withIcon = gadgets.filter((gadget) => gadget.icon.src).length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return gadgets.filter((gadget) => {
      if (status !== "all" && gadget.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const haystack = [
        gadget.name,
        gadget.description,
        gadget.unlock.text,
        CATEGORY_LABELS[gadget.category],
        ...gadget.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [gadgets, query, status]);

  const groups: { category: CategoryId; gadgets: Gadget[] }[] = [];
  for (const gadget of visible) {
    const last = groups[groups.length - 1];
    if (!last || last.category !== gadget.category) {
      groups.push({ category: gadget.category, gadgets: [gadget] });
    } else {
      last.gadgets.push(gadget);
    }
  }

  return (
    <section
      className="databank"
      id="databank"
      aria-labelledby="databank-heading"
    >
      <div className="panel-heading">
        <h2 id="databank-heading">Gadget databank</h2>
        <p>
          {gadgets.length} gadgets · {released} released · {upcoming} upcoming
        </p>
      </div>
      <p className="seed-note">
        {withIcon} local icons, {gadgets.length - withIcon} fallback marks. A{" "}
        <abbr title="The wiki left this unlock cell blank. The value was copied from the row above and has not been checked in game.">
          †
        </abbr>{" "}
        means that unlock was copied from the wiki row above.
      </p>

      <div className="filters">
        <label className="filter-search">
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Name, effect, unlock"
          />
        </label>
        <fieldset className="filter-status">
          <legend>Status</legend>
          {(
            [
              ["all", "All"],
              ["released", "Released"],
              ["upcoming", "Upcoming"],
            ] as const
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="gadget-status"
                value={value}
                checked={status === value}
                onChange={() => {
                  setStatus(value);
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>

      {groups.length === 0 ? (
        <p className="empty-build">No gadgets match.</p>
      ) : (
        groups.map((group) => (
          <section
            key={group.category}
            aria-labelledby={`cat-${group.category}`}
          >
            <h3 id={`cat-${group.category}`}>
              {CATEGORY_LABELS[group.category]}
            </h3>
            <ul className="gadget-list">
              {group.gadgets.map((gadget) => (
                <li key={gadget.id} className="gadget-card">
                  <GadgetMark gadget={gadget} />
                  <div>
                    <h4>{gadget.name}</h4>
                    <p className="gadget-meta">
                      {slotLabel(gadget.slots)} ·{" "}
                      {CATEGORY_LABELS[gadget.category]}
                      {gadget.status === "upcoming" ? (
                        <span className="badge">Upcoming</span>
                      ) : null}
                    </p>
                    <p>{gadget.description}</p>
                    <p className="gadget-unlock">
                      {gadget.unlock.text}
                      {gadget.unlock.inferred ? (
                        <abbr
                          className="inferred"
                          title="Copied from the wiki row above. Not checked in game."
                        >
                          †
                        </abbr>
                      ) : null}
                    </p>
                    {gadget.tags.length > 0 ? (
                      <ul className="tag-list">
                        {gadget.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  );
}
