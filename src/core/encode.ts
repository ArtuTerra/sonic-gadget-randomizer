import type { Build } from "./plate.ts";

/**
 * Share links use the URL hash (`#b=1...`) so a static host and an offline
 * PWA can open them with no server rewrites. Encoding version 1.
 * The encoder itself is milestone M9 in docs/PLAN.md.
 */
export const SHARE_ENCODING_VERSION = 1;
export const SHARE_HASH_KEY = "b";

export function encodeBuild(build: Build): string {
  void build;
  throw new Error("Share encoding is not implemented yet (milestone M9).");
}

export function decodeBuild(hash: string): Build {
  void hash;
  throw new Error("Share decoding is not implemented yet (milestone M9).");
}
