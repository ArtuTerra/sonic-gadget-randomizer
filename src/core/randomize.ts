import type { Build, PlateTier } from "./plate.ts";

/** Input for a uniform roll. Filters and weights come in later milestones. */
export interface RandomizeInput {
  plate: PlateTier;
  /** Seed for the deterministic PRNG, so a roll can be repeated in tests and URLs. */
  seed: number;
}

/**
 * Roll one valid build. Not implemented yet — milestone M5 in docs/PLAN.md.
 * The sampler will live in this module so it can run in the browser, the PWA,
 * and a future Android shell without React.
 */
export function randomize(input: RandomizeInput): Build {
  void input;
  throw new Error("The randomizer is not implemented yet (milestone M5).");
}
