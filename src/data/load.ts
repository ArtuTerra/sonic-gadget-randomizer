import rawDatabank from "./gadgets.json" with { type: "json" };
import { databankSchema } from "./schema.ts";

/** Parsed gadget databank. Import this instead of the raw JSON. */
export const databank = databankSchema.parse(rawDatabank);
