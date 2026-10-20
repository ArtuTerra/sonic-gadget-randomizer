import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Build } from "../core/plate.ts";
import { databank } from "../data/index.ts";
import type { Gadget } from "../data/types.ts";
import { BuildList } from "./BuildList.tsx";
import { GadgetIcon } from "./GadgetIcon.tsx";
import { Plate } from "./Plate.tsx";

const gadgetsById = new Map(
  databank.gadgets.map((gadget) => [gadget.id, gadget]),
);

function oneGadgetBuild(gadget: Gadget): Build {
  return {
    v: 1,
    plate: "master",
    rows: [[{ id: gadget.id, col: 0 }], []],
  };
}

describe("released gadget icons", () => {
  const released = databank.gadgets.filter(
    (gadget) => gadget.status === "released",
  );

  it("renders each released gadget's local icon in the plate and the build list", () => {
    expect(released).toHaveLength(118);

    for (const gadget of released) {
      const src = `/icons/gadgets/${gadget.id}.webp`;
      expect(gadget.icon.src, gadget.name).toBe(src);
      expect(existsSync(join("public", src.slice(1))), gadget.name).toBe(true);

      const icon = renderToStaticMarkup(
        createElement(GadgetIcon, { gadget, size: 44 }),
      );
      expect(icon, gadget.name).toContain(`src="${src}"`);
      expect(icon, gadget.name).not.toContain("gadget-fallback");

      const build = oneGadgetBuild(gadget);
      const plate = renderToStaticMarkup(
        createElement(Plate, { build, gadgetsById }),
      );
      const list = renderToStaticMarkup(
        createElement(BuildList, { build, gadgetsById }),
      );
      expect(plate, gadget.name).toContain(`src="${src}"`);
      expect(plate, gadget.name).not.toContain("gadget-fallback");
      expect(list, gadget.name).toContain(`src="${src}"`);
      expect(list, gadget.name).not.toContain("gadget-fallback");
    }
  });
});
