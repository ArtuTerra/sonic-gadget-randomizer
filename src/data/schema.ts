import { z } from "zod";
import { CATEGORY_IDS } from "./categories.ts";
import { FALLBACK_ICON_CREDIT, ICON_CREDIT } from "./credits.ts";
import { GADGET_TAGS } from "./tags.ts";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const statType = z.enum([
  "speed",
  "acceleration",
  "handling",
  "power",
  "boost",
]);

const kitAffinitySchema = z
  .object({
    machineType: statType.optional(),
    characterType: statType.optional(),
  })
  .strict();

const festivalSchema = z
  .object({
    name: z.string().min(1),
    points: z.number().int().nonnegative(),
    expired: z.boolean(),
  })
  .strict();

const shopSchema = z
  .object({
    currency: z.literal("donpa-ticket"),
    cost: z.number().int().nonnegative(),
    requires: z.string().min(1),
  })
  .strict();

const unlockSchema = z
  .object({
    type: z.enum([
      "start",
      "grand-prix",
      "plate",
      "races",
      "world-match",
      "festival",
      "shop",
      "upcoming",
    ]),
    plate: z.enum(["bronze", "silver", "gold", "master"]).nullable(),
    races: z.number().int().nonnegative().nullable(),
    worldMatchRank: z.string().min(1).nullable(),
    festival: festivalSchema.nullable(),
    shop: shopSchema.nullable(),
    text: z.string().min(1),
    inferred: z.boolean(),
  })
  .strict();

const effectSchema = z
  .object({
    key: z.string().min(1),
    kind: z.enum([
      "cap",
      "threshold",
      "recurring",
      "payout",
      "charge-level",
      "stat",
      "unique",
    ]),
    stacking: z.enum(["additive", "max-wins", "unknown"]),
    value: z.number().nullable(),
    confidence: z.enum(["wiki", "community-unverified", "in-game-verified"]),
  })
  .strict();

const gadgetSchema = z
  .object({
    id: slug,
    code: z.number().int().nonnegative(),
    name: z.string().min(1),
    names: z
      .object({
        ja: z.string().min(1).nullable(),
        pt: z.string().min(1).nullable(),
      })
      .strict(),
    category: z.enum(CATEGORY_IDS),
    slots: z.literal([1, 2, 3]),
    isKit: z.boolean(),
    kitType: z
      .enum(["standard", "machine", "character", "advanced"])
      .nullable(),
    kitAffinity: kitAffinitySchema.nullable(),
    description: z.string().min(1),
    tags: z.array(z.enum(GADGET_TAGS)),
    unlock: unlockSchema,
    status: z.enum(["released", "upcoming", "removed"]),
    addedIn: z.string().min(1).nullable(),
    timeTrialValid: z.boolean().nullable(),
    stacksWith: z.array(slug),
    effects: z.array(effectSchema),
    kitContains: z.array(slug),
    icon: z
      .object({
        src: z.string().min(1).nullable(),
        sourceUrl: z.string().min(1).nullable(),
        credit: z.string().min(1),
        fallback: z
          .object({
            glyph: z.string().min(1),
            color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          })
          .strict(),
      })
      .strict(),
    lastVerified: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    notes: z.string(),
  })
  .strict();

export const databankSchema = z
  .object({
    schemaVersion: z.literal(1),
    /**
     * True only on the old M0 example seed. The real databank omits this.
     * The importer still recognizes it so a re-run does not treat those five
     * example rows as gadgets that were removed.
     */
    placeholder: z.boolean().optional(),
    gameVersion: z.string().min(1),
    source: z.string().min(1),
    notes: z.string().optional(),
    gadgets: z.array(gadgetSchema),
  })
  .strict()
  .superRefine((databank, ctx) => {
    const ids = new Set<string>();
    const codes = new Set<number>();

    databank.gadgets.forEach((gadget, index) => {
      if (ids.has(gadget.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate gadget id "${gadget.id}".`,
          path: ["gadgets", index, "id"],
        });
      }
      ids.add(gadget.id);

      if (codes.has(gadget.code)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate gadget code ${gadget.code}. Codes are never reused.`,
          path: ["gadgets", index, "code"],
        });
      }
      codes.add(gadget.code);

      if (gadget.isKit) {
        if (gadget.kitType === null) {
          ctx.addIssue({
            code: "custom",
            message: "A kit must set kitType.",
            path: ["gadgets", index, "kitType"],
          });
        }
        if (gadget.slots !== 3) {
          ctx.addIssue({
            code: "custom",
            message: "Kits take 3 slots and fill a whole row.",
            path: ["gadgets", index, "slots"],
          });
        }
      } else if (gadget.kitType !== null || gadget.kitAffinity !== null) {
        ctx.addIssue({
          code: "custom",
          message: "Only kits can set kitType or kitAffinity.",
          path: ["gadgets", index, "isKit"],
        });
      }

      if (gadget.kitType === "machine") {
        if (
          gadget.kitAffinity?.machineType === undefined ||
          gadget.kitAffinity.characterType !== undefined
        ) {
          ctx.addIssue({
            code: "custom",
            message: "A machine kit sets machineType and no characterType.",
            path: ["gadgets", index, "kitAffinity"],
          });
        }
      } else if (gadget.kitType === "character") {
        if (
          gadget.kitAffinity?.characterType === undefined ||
          gadget.kitAffinity.machineType !== undefined
        ) {
          ctx.addIssue({
            code: "custom",
            message: "A character kit sets characterType and no machineType.",
            path: ["gadgets", index, "kitAffinity"],
          });
        }
      } else if (gadget.kitAffinity !== null) {
        ctx.addIssue({
          code: "custom",
          message: "Only machine and character kits set kitAffinity.",
          path: ["gadgets", index, "kitAffinity"],
        });
      }

      checkUnlock(gadget, index, ctx);
      checkIcon(gadget, index, ctx);

      if (gadget.addedIn !== null && !/^\d+\.\d+\.\d+$/.test(gadget.addedIn)) {
        ctx.addIssue({
          code: "custom",
          message: "addedIn must look like 1.4.1.",
          path: ["gadgets", index, "addedIn"],
        });
      }

      if (
        gadget.description.includes("[[") ||
        gadget.description.includes("''")
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Descriptions must be original text, not wiki markup.",
          path: ["gadgets", index, "description"],
        });
      }

      if (new Set(gadget.tags).size !== gadget.tags.length) {
        ctx.addIssue({
          code: "custom",
          message: "Tags must be unique on a gadget.",
          path: ["gadgets", index, "tags"],
        });
      }
    });

    for (const [index, gadget] of databank.gadgets.entries()) {
      for (const partner of gadget.stacksWith) {
        if (!ids.has(partner)) {
          ctx.addIssue({
            code: "custom",
            message: `stacksWith references unknown id "${partner}".`,
            path: ["gadgets", index, "stacksWith"],
          });
        }
      }
      for (const part of gadget.kitContains) {
        if (!ids.has(part)) {
          ctx.addIssue({
            code: "custom",
            message: `kitContains references unknown id "${part}".`,
            path: ["gadgets", index, "kitContains"],
          });
        }
      }
    }
  });

function checkUnlock(
  gadget: z.infer<typeof gadgetSchema>,
  index: number,
  ctx: z.RefinementCtx,
): void {
  const unlock = gadget.unlock;
  const detail = {
    plate: unlock.plate !== null,
    races: unlock.races !== null,
    worldMatchRank: unlock.worldMatchRank !== null,
    festival: unlock.festival !== null,
    shop: unlock.shop !== null,
  };

  const allow = {
    plate: false,
    races: false,
    worldMatchRank: false,
    festival: false,
    shop: false,
  };

  switch (unlock.type) {
    case "plate":
      allow.plate = true;
      if (unlock.plate === null) {
        ctx.addIssue({
          code: "custom",
          message: "A plate unlock must name the plate.",
          path: ["gadgets", index, "unlock", "plate"],
        });
      }
      break;
    case "races":
      allow.races = true;
      if (unlock.races === null) {
        ctx.addIssue({
          code: "custom",
          message: "A race unlock must say how many races.",
          path: ["gadgets", index, "unlock", "races"],
        });
      }
      break;
    case "world-match":
      allow.worldMatchRank = true;
      if (
        unlock.worldMatchRank === null ||
        !/^[A-Z][+-]?$/.test(unlock.worldMatchRank)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "World Match rank must look like E+, D-, or B.",
          path: ["gadgets", index, "unlock", "worldMatchRank"],
        });
      }
      break;
    case "festival":
      allow.festival = true;
      allow.shop = true;
      if (unlock.festival === null) {
        ctx.addIssue({
          code: "custom",
          message: "A festival unlock must name the festival.",
          path: ["gadgets", index, "unlock", "festival"],
        });
      }
      break;
    case "shop":
      allow.shop = true;
      if (unlock.shop === null) {
        ctx.addIssue({
          code: "custom",
          message: "A shop unlock must name the price.",
          path: ["gadgets", index, "unlock", "shop"],
        });
      }
      break;
    case "start":
    case "grand-prix":
    case "upcoming":
      break;
  }

  for (const key of Object.keys(allow) as (keyof typeof allow)[]) {
    if (!allow[key] && detail[key]) {
      ctx.addIssue({
        code: "custom",
        message: `${unlock.type} unlocks cannot set ${key}.`,
        path: ["gadgets", index, "unlock", key],
      });
    }
  }

  const upcoming = gadget.status === "upcoming";
  if (upcoming !== (unlock.type === "upcoming")) {
    ctx.addIssue({
      code: "custom",
      message: "status upcoming and unlock type upcoming must match.",
      path: ["gadgets", index, "status"],
    });
  }
}

function checkIcon(
  gadget: z.infer<typeof gadgetSchema>,
  index: number,
  ctx: z.RefinementCtx,
): void {
  if (gadget.icon.src) {
    if (gadget.icon.src !== `/icons/gadgets/${gadget.id}.webp`) {
      ctx.addIssue({
        code: "custom",
        message: "Local icon path must be /icons/gadgets/<id>.webp.",
        path: ["gadgets", index, "icon", "src"],
      });
    }
    if (
      gadget.icon.sourceUrl === null ||
      !gadget.icon.sourceUrl.startsWith("https://sonic.fandom.com/wiki/File:")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "An icon must record its Sonic Wiki Zone file page.",
        path: ["gadgets", index, "icon", "sourceUrl"],
      });
    }
    if (gadget.icon.credit !== ICON_CREDIT) {
      ctx.addIssue({
        code: "custom",
        message: `Icon credit must be ${ICON_CREDIT}.`,
        path: ["gadgets", index, "icon", "credit"],
      });
    }
    return;
  }

  if (gadget.icon.sourceUrl !== null) {
    ctx.addIssue({
      code: "custom",
      message: "A missing icon does not record a source URL.",
      path: ["gadgets", index, "icon", "sourceUrl"],
    });
  }
  if (gadget.icon.credit !== FALLBACK_ICON_CREDIT) {
    ctx.addIssue({
      code: "custom",
      message: "A missing icon must use the fallback credit.",
      path: ["gadgets", index, "icon", "credit"],
    });
  }
}

export type Gadget = z.infer<typeof gadgetSchema>;
export type Databank = z.infer<typeof databankSchema>;
export type GadgetEffect = Gadget["effects"][number];
export type UnlockInfo = Gadget["unlock"];
export type KitType = NonNullable<Gadget["kitType"]>;
export type GadgetStatus = Gadget["status"];
