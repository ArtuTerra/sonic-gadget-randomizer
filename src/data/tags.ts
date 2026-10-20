/**
 * Our own filter words, not the game's categories.
 * Phase 2 is when the full tag browser arrives. Until then this list is the
 * allow-list the importer and the schema share.
 */
export const GADGET_TAGS = [
  "drift",
  "charge",
  "rings",
  "items",
  "attack",
  "defense",
  "air-trick",
  "start",
  "lap3",
  "collision",
  "slipstream",
  "water",
  "flight",
  "stats",
  "boost",
  "kit",
] as const;

export type GadgetTag = (typeof GADGET_TAGS)[number];
