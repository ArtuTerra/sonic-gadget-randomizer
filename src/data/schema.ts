import { z } from "zod";
import { CATEGORY_IDS } from "./categories.ts";

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
    tags: z.array(z.string().min(1)),
    unlock: unlockSchema,
    status: z.enum(["released", "upcoming", "removed"]),
    addedIn: z.string().min(1).nullable(),
    timeTrialValid: z.boolean().nullable(),
    stacksWith: z.array(slug),
    effects: z.array(effectSchema),
    kitContains: z.array(slug),
    icon: z
      .object({
        src: z.string().min(1),
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
     * True while this file is the M0 example seed, not the full wiki list.
     * Milestone M2 can drop the flag once the real databank is in place.
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
    });
  });

export type Gadget = z.infer<typeof gadgetSchema>;
export type Databank = z.infer<typeof databankSchema>;
export type GadgetEffect = Gadget["effects"][number];
export type UnlockInfo = Gadget["unlock"];
export type KitType = NonNullable<Gadget["kitType"]>;
export type GadgetStatus = Gadget["status"];
