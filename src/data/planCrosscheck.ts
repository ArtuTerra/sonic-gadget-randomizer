import { categoryIdForLabel } from "./categories.ts";

/**
 * Facts we can read off one Appendix A cell in docs/PLAN.md.
 * The importer's job is to match these facts. Wording of `unlock.text`
 * can differ; the structured fields cannot.
 */
interface PlanExpectation {
  code: number;
  name: string;
  categoryLabel: string;
  slots: number;
  inferred: boolean;
  addedIn: string | null;
  status: "released" | "upcoming";
  unlockType:
    | "start"
    | "grand-prix"
    | "plate"
    | "races"
    | "world-match"
    | "festival"
    | "upcoming";
  plate: "bronze" | "silver" | "gold" | "master" | null;
  races: number | null;
  worldMatchRank: string | null;
  festivalName: string | null;
  festivalPoints: number | null;
  shop: boolean;
  namesVersion: boolean;
}

export interface CrossCheckGadget {
  code: number;
  name: string;
  category: string;
  slots: number;
  status: string;
  addedIn: string | null;
  unlock: {
    type: string;
    plate: string | null;
    races: number | null;
    worldMatchRank: string | null;
    festival: { name: string; points: number; expired: boolean } | null;
    shop: { cost: number } | null;
    text: string;
    inferred: boolean;
  };
}

function classifyPlanCell(
  code: number,
  categoryLabel: string,
  name: string,
  slots: number,
  cell: string,
): PlanExpectation | string {
  const inferred = cell.includes("†");
  const addedIn = cell.match(/added (\d+\.\d+\.\d+)/)?.[1] ?? null;
  const body = cell
    .replace(/\(added [\d.]+\)/g, "")
    .replace("†", "")
    .replace(/\s+/g, " ")
    .trim();

  const base = {
    code,
    name,
    categoryLabel,
    slots,
    inferred,
    addedIn,
    plate: null,
    races: null,
    worldMatchRank: null,
    festivalName: null,
    festivalPoints: null,
    shop: false,
    namesVersion: false,
  };

  if (/^UPCOMING\b/i.test(body)) {
    return {
      ...base,
      status: "upcoming",
      unlockType: "upcoming",
      namesVersion: body.includes("v2.0"),
    };
  }

  const plate = body.match(/^Reach (Bronze|Silver|Gold|Master) Plate$/);
  if (plate?.[1]) {
    return {
      ...base,
      status: "released",
      unlockType: "plate",
      plate: plate[1].toLowerCase() as PlanExpectation["plate"],
    };
  }

  const races = body.match(/^Finish (\d+) races$/);
  if (races?.[1]) {
    return {
      ...base,
      status: "released",
      unlockType: "races",
      races: Number(races[1]),
    };
  }

  if (body === "Finish a Grand Prix") {
    return { ...base, status: "released", unlockType: "grand-prix" };
  }

  if (body === "Available from the start") {
    return { ...base, status: "released", unlockType: "start" };
  }

  const rank = body.match(/^World Match Rank ([A-Z][+-]?)$/);
  if (rank?.[1]) {
    return {
      ...base,
      status: "released",
      unlockType: "world-match",
      worldMatchRank: rank[1],
    };
  }

  const festival = body.match(
    /^(.+ Festival), (\d+) pts \(expired\)(?:; 100 Donpa Tickets after Master Plate)?$/,
  );
  if (festival?.[1] && festival[2]) {
    return {
      ...base,
      status: "released",
      unlockType: "festival",
      festivalName: festival[1],
      festivalPoints: Number(festival[2]),
      shop: body.includes("Donpa Tickets"),
    };
  }

  return `Appendix row ${code} (${name}) has an unlock cell the cross-check cannot read: ${cell}`;
}

/** Read the gadget table in docs/PLAN.md Appendix A. */
export function parsePlanAppendix(markdown: string): PlanExpectation[] {
  const start = markdown.indexOf("## Appendix A");
  if (start < 0) {
    throw new Error("docs/PLAN.md has no Appendix A.");
  }
  const section = markdown.slice(start);
  const rows: PlanExpectation[] = [];
  const pattern =
    /^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| (\d+) \| ([^|]+?) \|$/gm;

  for (const match of section.matchAll(pattern)) {
    const code = Number(match[1]);
    const categoryLabel = match[2]?.trim() ?? "";
    const name = match[3]?.trim() ?? "";
    const slots = Number(match[4]);
    const cell = match[5]?.trim() ?? "";
    const parsed = classifyPlanCell(code, categoryLabel, name, slots, cell);
    if (typeof parsed === "string") {
      throw new Error(parsed);
    }
    rows.push(parsed);
  }

  return rows;
}

/**
 * Compare the databank to Appendix A. An empty list means the wiki import
 * still agrees with the plan's gadget table.
 */
export function crossCheckPlan(
  gadgets: readonly CrossCheckGadget[],
  markdown: string,
): string[] {
  const rows = parsePlanAppendix(markdown);
  const mismatches: string[] = [];
  const byCode = new Map(gadgets.map((gadget) => [gadget.code, gadget]));

  if (rows.length !== gadgets.length) {
    mismatches.push(
      `Count: plan appendix has ${rows.length} rows, databank has ${gadgets.length}.`,
    );
  }

  for (const row of rows) {
    const gadget = byCode.get(row.code);
    if (!gadget) {
      mismatches.push(
        `Code ${row.code} (${row.name}) is missing from the databank.`,
      );
      continue;
    }

    const categoryId = categoryIdForLabel(row.categoryLabel);
    const problems: string[] = [];
    if (gadget.name !== row.name) {
      problems.push(`name "${gadget.name}" vs plan "${row.name}"`);
    }
    if (gadget.category !== categoryId) {
      problems.push(
        `category "${gadget.category}" vs plan "${row.categoryLabel}"`,
      );
    }
    if (gadget.slots !== row.slots) {
      problems.push(`slots ${gadget.slots} vs plan ${row.slots}`);
    }
    if (gadget.status !== row.status) {
      problems.push(`status ${gadget.status} vs plan ${row.status}`);
    }
    if (gadget.addedIn !== row.addedIn) {
      problems.push(`addedIn ${gadget.addedIn} vs plan ${row.addedIn}`);
    }
    if (gadget.unlock.inferred !== row.inferred) {
      problems.push(
        `inferred ${gadget.unlock.inferred} vs plan ${row.inferred}`,
      );
    }
    if (gadget.unlock.type !== row.unlockType) {
      problems.push(`unlock ${gadget.unlock.type} vs plan ${row.unlockType}`);
    }
    if (gadget.unlock.plate !== row.plate) {
      problems.push(`plate ${gadget.unlock.plate} vs plan ${row.plate}`);
    }
    if (gadget.unlock.races !== row.races) {
      problems.push(`races ${gadget.unlock.races} vs plan ${row.races}`);
    }
    if (gadget.unlock.worldMatchRank !== row.worldMatchRank) {
      problems.push(
        `rank ${gadget.unlock.worldMatchRank} vs plan ${row.worldMatchRank}`,
      );
    }
    if ((gadget.unlock.festival?.name ?? null) !== row.festivalName) {
      problems.push(
        `festival "${gadget.unlock.festival?.name ?? null}" vs plan "${row.festivalName}"`,
      );
    }
    if ((gadget.unlock.festival?.points ?? null) !== row.festivalPoints) {
      problems.push(
        `points ${gadget.unlock.festival?.points ?? null} vs plan ${row.festivalPoints}`,
      );
    }
    if (row.festivalName && gadget.unlock.festival?.expired !== true) {
      problems.push("festival is not marked expired");
    }
    if (row.shop !== (gadget.unlock.shop !== null)) {
      problems.push(`shop ${gadget.unlock.shop !== null} vs plan ${row.shop}`);
    }
    if (row.shop && gadget.unlock.shop?.cost !== 100) {
      problems.push(`shop cost ${gadget.unlock.shop?.cost ?? "none"} vs 100`);
    }
    if (row.unlockType === "upcoming") {
      const mentionsVersion = gadget.unlock.text.includes("2.0");
      if (mentionsVersion !== row.namesVersion) {
        problems.push(
          row.namesVersion
            ? "plan names version 2.0 and the unlock text does not"
            : "plan does not name version 2.0 but the unlock text does",
        );
      }
    }

    if (problems.length > 0) {
      mismatches.push(`${row.code} ${row.name}: ${problems.join("; ")}`);
    }
  }

  return mismatches;
}
