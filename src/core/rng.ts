/** Uniform float in [0, 1). Mulberry32 and injected tests both use this shape. */
export type Rng = () => number;

/**
 * Small deterministic PRNG. The same seed always yields the same sequence,
 * so a roll can be repeated in tests. UI code can seed it from
 * `crypto.getRandomValues` via {@link randomSeed}.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh 32-bit seed. Uses the platform CSPRNG when it exists. */
export function randomSeed(): number {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    cryptoObject.getRandomValues(buffer);
    return buffer[0] ?? 0;
  }
  return Math.floor(Math.random() * 0x1_0000_0000);
}
