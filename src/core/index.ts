export {
  DUPLICATE_GADGETS_ALLOWED,
  GADGET_SLOT_SIZES,
  GRID_COLUMNS,
  GRID_ROWS,
  PLATE_ROW_CAPACITIES,
  PLATE_SLOT_COUNTS,
  PLATE_TIERS,
  isColumnIndex,
  isPlateTier,
  type Build,
  type ColumnIndex,
  type GadgetSlotSize,
  type PlacedGadget,
  type PlateTier,
} from "./plate.ts";

export {
  indexByCode,
  indexById,
  isGadgetSlotSize,
  isReleasedGadget,
  releasedGadgets,
  type PoolGadget,
} from "./pool.ts";

export { mulberry32, randomSeed, type Rng } from "./rng.ts";

export { isValid, validateBuild, type ValidationRules } from "./validate.ts";
export { randomize, type RandomizeInput } from "./randomize.ts";
export {
  SHARE_ENCODING_VERSION,
  SHARE_HASH_KEY,
  ShareCodeError,
  decodeBuild,
  encodeBuild,
  shareHash,
} from "./encode.ts";
