import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
      return [];
    }
    return [path];
  });
}

const forbidden = [
  /from\s+["']react["']/,
  /from\s+["']react-dom["']/,
  /from\s+["'][^"']*\/components\//,
  /from\s+["'][^"']*\/data\//,
  /\bdocument\b/,
  /\bwindow\b/,
  /\blocalStorage\b/,
  /\bfetch\s*\(/,
];

describe("src/core", () => {
  it("stays free of React, the DOM, and the network", () => {
    const files = sourceFiles("src/core");
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(source, `${file} matches ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
