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

/** Wiki heading for each category id. The wording is the game's category name. */
export const CATEGORY_LABELS: Record<CategoryId, string> = {
  "ring-gain": "Ring Gain",
  "ring-ability": "Ring Ability",
  "technique-upgrade": "Technique Upgrade",
  "charge-upgrade": "Charge Upgrade",
  "stat-upgrade": "Stat Upgrade",
  "power-up": "Power Up",
  support: "Support",
  "item-control": "Item Control",
  "upgrade-add-item": "Upgrade/Add Item",
  "standard-kit": "Standard Kit",
  "machine-type-kit": "Machine Type Kit",
  "character-type-kit": "Character Type Kit",
  "advanced-kit": "Advanced Kit",
};

export function categoryIdForLabel(label: string): CategoryId | undefined {
  return CATEGORY_IDS.find((id) => CATEGORY_LABELS[id] === label);
}
