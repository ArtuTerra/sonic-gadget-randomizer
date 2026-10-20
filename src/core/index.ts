export {
  DUPLICATE_GADGETS_ALLOWED,
  GADGET_SLOT_SIZES,
  GRID_COLUMNS,
  GRID_ROWS,
  PLATE_ROW_CAPACITIES,
  PLATE_SLOT_COUNTS,
  PLATE_TIERS,
  type Build,
  type ColumnIndex,
  type GadgetSlotSize,
  type PlacedGadget,
  type PlateTier,
} from "./plate.ts";

export { isValid, type ValidationRules } from "./validate.ts";
export { randomize, type RandomizeInput } from "./randomize.ts";
export {
  SHARE_ENCODING_VERSION,
  SHARE_HASH_KEY,
  decodeBuild,
  encodeBuild,
} from "./encode.ts";
