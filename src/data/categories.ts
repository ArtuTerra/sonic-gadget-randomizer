/** The 13 gadget categories from docs/PLAN.md §1.3. Ids are stable slugs. */
export const CATEGORY_IDS = [
  "ring-gain",
  "ring-ability",
  "technique-upgrade",
  "charge-upgrade",
  "stat-upgrade",
  "power-up",
  "support",
  "item-control",
  "upgrade-add-item",
  "standard-kit",
  "machine-type-kit",
  "character-type-kit",
  "advanced-kit",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];
