import { GADGET_SLOT_SIZES, type GadgetSlotSize } from "./plate.ts";

/**
 * A gadget the randomizer, validator, and share codec can see.
 * `status` omitted means "treat as released", which keeps unit fixtures small.
 * Encoding needs `code`. Rolls and validity checks need `id` and `slots`.
 */
export interface PoolGadget {
  id: string;
  code?: number;
  slots: GadgetSlotSize;
  status?: "released" | "upcoming" | "removed";
}

export function isGadgetSlotSize(value: number): value is GadgetSlotSize {
  return (GADGET_SLOT_SIZES as readonly number[]).includes(value);
}

export function isReleasedGadget(gadget: PoolGadget): boolean {
  return (
    typeof gadget.id === "string" &&
    gadget.id.length > 0 &&
    isGadgetSlotSize(gadget.slots) &&
    (gadget.status === undefined || gadget.status === "released")
  );
}

/** Released gadgets only, first id wins. Upcoming and removed rows stay out of rolls. */
export function releasedGadgets(gadgets: readonly PoolGadget[]): PoolGadget[] {
  const seen = new Set<string>();
  const pool: PoolGadget[] = [];
  for (const gadget of gadgets) {
    if (!isReleasedGadget(gadget) || seen.has(gadget.id)) continue;
    seen.add(gadget.id);
    pool.push(gadget);
  }
  return pool;
}

export function indexById(
  gadgets: readonly PoolGadget[],
): Map<string, PoolGadget> {
  const map = new Map<string, PoolGadget>();
  for (const gadget of gadgets) {
    if (!map.has(gadget.id)) map.set(gadget.id, gadget);
  }
  return map;
}

export function indexByCode(
  gadgets: readonly PoolGadget[],
): Map<number, PoolGadget> {
  const map = new Map<number, PoolGadget>();
  for (const gadget of gadgets) {
    if (gadget.code === undefined || map.has(gadget.code)) continue;
    map.set(gadget.code, gadget);
  }
  return map;
}
