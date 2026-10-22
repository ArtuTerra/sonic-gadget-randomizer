import { isGadgetSlotSize, type PoolGadget } from "./pool.ts";

export interface PoolFilter {
  /** Ids the player does not own. Everything else counts as owned. */
  unowned?: ReadonlySet<string>;
  /** Treat upcoming gadgets as rollable. Removed gadgets never are. */
  includeUpcoming?: boolean;
}

/**
 * Gadgets a roll may use. Upcoming rows are relabelled as released when
 * included, so the randomizer and validator accept them. Unowned ids drop out.
 * First id wins.
 */
export function eligibleGadgets(
  gadgets: readonly PoolGadget[],
  filter: PoolFilter = {},
): PoolGadget[] {
  const seen = new Set<string>();
  const out: PoolGadget[] = [];
  for (const gadget of gadgets) {
    if (!gadget.id || seen.has(gadget.id)) continue;
    if (!isGadgetSlotSize(gadget.slots)) continue;
    const status = gadget.status ?? "released";
    if (status === "removed") continue;
    if (status === "upcoming" && !filter.includeUpcoming) continue;
    seen.add(gadget.id);
    if (filter.unowned?.has(gadget.id)) continue;
    out.push(
      status === "upcoming" ? { ...gadget, status: "released" } : gadget,
    );
  }
  return out;
}

/** Parse a stored list of unowned ids. Bad input means "own everything". */
export function parseIdList(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    return new Set(
      value.filter((id): id is string => typeof id === "string" && id !== ""),
    );
  } catch {
    return new Set();
  }
}

export function serializeIdList(ids: ReadonlySet<string>): string {
  return JSON.stringify([...ids].sort());
}
