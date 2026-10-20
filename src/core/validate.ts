import type { Build } from "./plate.ts";

/**
 * Options for {@link isValid}. The milestone M4 validator will use these.
 * Duplicates stay forbidden unless a future mode says otherwise.
 */
export interface ValidationRules {
  allowDuplicates: boolean;
}

/**
 * Shared validity check for the randomizer, the editor, and share-link decoding.
 * Not implemented yet — milestone M4 in docs/PLAN.md.
 */
export function isValid(build: Build, rules?: ValidationRules): boolean {
  void build;
  void rules;
  throw new Error("Build validation is not implemented yet (milestone M4).");
}
