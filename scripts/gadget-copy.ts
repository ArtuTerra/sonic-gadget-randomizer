import type { GadgetTag } from "../src/data/tags.ts";

/**
 * Original short blurbs for the importer.
 * Do not paste Sonic Wiki Zone sentences into this file. If a game update
 * adds a gadget, write a new blurb here before the import will accept it.
 */
export interface GadgetCopy {
  description: string;
  tags: GadgetTag[];
  notes?: string;
}

const SAME_AS_TUNER_1 =
  "The wiki states the same effect for Tuner 2 as for Tuner 1.";

export const GADGET_COPY: Record<string, GadgetCopy> = {
  "Champion Bounty": {
    description: "Earn rings while you are running in the top three.",
    tags: ["rings"],
  },
  "Route Planner Bounty": {
    description:
      "Choosing a Travel Ring pays 100 rings and raises your ring cap.",
    tags: ["rings"],
  },
  "Starting Boost Bounty": {
    description: "A clean start pays rings.",
    tags: ["rings", "start", "boost"],
  },
  "Air Trick Bounty": {
    description: "Each air-trick spin pays a few rings.",
    tags: ["rings", "air-trick"],
  },
  "Item Attack Bounty": {
    description: "Hitting another racer with an item pays rings.",
    tags: ["rings", "items", "attack"],
  },
  "Runoff Bounty": {
    description:
      "Speed items keep paying rings while you cross a slowdown zone.",
    tags: ["rings", "items"],
  },
  "Slipstream Bounty": {
    description: "Rings keep coming in for as long as a slipstream lasts.",
    tags: ["rings", "slipstream"],
  },
  "Travel Ring Bounty": {
    description: "Passing through a Travel Ring pays rings.",
    tags: ["rings"],
  },
  "Morph Action Bounty": {
    description: "A Charge Dash on the water or in the air pays rings.",
    tags: ["rings", "water", "flight"],
  },
  "Perfect Charge Bounty": {
    description:
      "Letting go of a drift the instant a charge level completes pays rings.",
    tags: ["rings", "drift", "charge"],
  },
  "Dash Panel Bounty": {
    description: "Dash Panels and Dash Gates pay rings.",
    tags: ["rings"],
  },
  "Dash Panel Mini Bounty": {
    description: "Dash Panels and Dash Gates pay a smaller handful of rings.",
    tags: ["rings"],
  },
  "Dash Panel Combo Bounty": {
    description: "One Dash Panel pays 3 rings, and a chain of them pays more.",
    tags: ["rings"],
  },
  "Ring Doubler": {
    description: "Ring pickups are doubled. Team Matches ignore this.",
    tags: ["rings"],
  },
  "Less is More": {
    description: "Top speed climbs when you are holding fewer rings.",
    tags: ["rings", "stats"],
  },
  "Ring Engine": {
    description:
      "While you hold at least one ring, every stat is +12, and rings drain slowly.",
    tags: ["rings", "stats"],
  },
  "Hyper Ring Engine": {
    description:
      "Stats rise with how many rings you hold, and those rings drain slowly.",
    tags: ["rings", "stats"],
  },
  "130 Ring Limit": {
    description: "Your ring cap becomes 130.",
    tags: ["rings"],
  },
  "200 Ring Limit": {
    description: "Your ring cap becomes 200.",
    tags: ["rings"],
  },
  "Mini Ring Thief": {
    description: "A collision takes a few rings from the other machine.",
    tags: ["rings", "collision"],
  },
  "Ring Thief": {
    description: "A collision takes rings from the other machine.",
    tags: ["rings", "collision"],
  },
  "Ring Gain Mini Boost": {
    description: "Picking up rings gives you a small speed burst.",
    tags: ["rings", "boost"],
  },
  "Ring Gain Boost": {
    description: "Picking up rings gives you a speed burst.",
    tags: ["rings", "boost"],
  },
  "Ring Range UP": {
    description: "You can collect rings from farther away.",
    tags: ["rings"],
  },
  "Hit and Run": {
    description:
      "Landing an item hit starts a boost that ignores runoff slowdown.",
    tags: ["items", "attack", "boost"],
  },
  "Extended Slipstream": {
    description: "You pick up a slipstream more often.",
    tags: ["slipstream"],
  },
  "Air Drift Mobility UP": {
    description: "Air drifts turn tighter while you are in flight form.",
    tags: ["drift", "flight"],
  },
  "Charge Jump Mobility UP": {
    description:
      "Sideways air tricks during a water Charge Jump travel farther.",
    tags: ["charge", "air-trick", "water"],
  },
  "Ultimate Air Trick": {
    description: "More than three air tricks makes you briefly invincible.",
    tags: ["air-trick", "defense"],
  },
  "Perfect Landing": {
    description: "Accelerating the moment you land gives you a speed burst.",
    tags: ["boost"],
  },
  "Air Trick Adept": {
    description:
      "Air tricks come out faster. This pairs with Air Trick Expert.",
    tags: ["air-trick"],
  },
  "Air Trick Expert": {
    description:
      "Air tricks come out much faster. This pairs with Air Trick Adept.",
    tags: ["air-trick"],
  },
  "Collision Mini Boost": {
    description: "Bumping another machine gives you a small boost.",
    tags: ["collision", "boost"],
  },
  "Collision Boost": {
    description: "Bumping another machine gives you a boost.",
    tags: ["collision", "boost"],
  },
  "Spin Drift": {
    description: "A drift spins you fast enough to shove other machines aside.",
    tags: ["drift", "collision"],
  },
  "Mini Lv1 Quick Charge": {
    description: "Level 1 drift charge builds a little faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Lv1 Quick Charge": {
    description: "Level 1 drift charge builds faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Lv2 Quick Charge": {
    description: "Level 2 drift charge builds faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Lv3 Quick Charge": {
    description: "Level 3 drift charge builds faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Lv4 Quick Charge": {
    description:
      "Adds a fourth drift-charge level, and that level builds faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Ultimate Charge": {
    description:
      "Adds a fourth drift-charge level. A level-4 charge boost makes you invincible.",
    tags: ["drift", "charge", "boost", "defense"],
  },
  "Boundless Charge": {
    description:
      "Adds a fourth drift-charge level. A level-4 charge boost ignores runoff slowdown.",
    tags: ["drift", "charge", "boost"],
  },
  "Collision Charge": {
    description:
      "Bumping a rival while you drift fills the drift gauge a little faster.",
    tags: ["drift", "charge", "collision"],
  },
  "Perfect Charge Boost": {
    description:
      "Releasing a drift the instant a level completes makes that boost faster.",
    tags: ["drift", "charge", "boost"],
  },
  "Break Charge": {
    description: "Braking during a drift fills the drift gauge faster.",
    tags: ["drift", "charge"],
  },
  "Friction Drift": {
    description:
      "Drifting on land slows you down, but the drift gauge fills much faster.",
    tags: ["drift", "charge"],
  },
  "Technical Drift": {
    description:
      "Drifting on land charges faster, and you are more likely to slide out.",
    tags: ["drift", "charge"],
    notes:
      'The wiki spells this "land from". The other drift gadgets say land form.',
  },
  "Flawless Counter Drift": {
    description: "A Counter Drift keeps the entire charge.",
    tags: ["drift", "charge"],
  },
  "Refined Counter Drift": {
    description: "A Counter Drift keeps more of the charge.",
    tags: ["drift", "charge"],
  },
  "Counter Quick Charge": {
    description: "The first land-form Counter Drift fills one gauge level.",
    tags: ["drift", "charge", "boost"],
  },
  "Speed Mod": {
    description: "Cuts your highest stat and raises Speed by a lot.",
    tags: ["stats"],
  },
  "Acceleration Mod": {
    description: "Cuts your highest stat and raises Acceleration by a lot.",
    tags: ["stats"],
  },
  "Handling Mod": {
    description: "Cuts your highest stat and raises Handling by a lot.",
    tags: ["stats"],
  },
  "Power Mod": {
    description: "Cuts your highest stat and raises Power by a lot.",
    tags: ["stats"],
  },
  "Boost Mod": {
    description: "Cuts your highest stat and raises Boost by a lot.",
    tags: ["stats", "boost"],
  },
  "Speed Tuner 1": {
    description:
      "A small Speed increase. Speed machines also get extra stat changes.",
    tags: ["stats"],
  },
  "Speed Tuner 2": {
    description:
      "A small Speed increase. Speed machines also get extra stat changes.",
    tags: ["stats"],
    notes: SAME_AS_TUNER_1,
  },
  "Acceleration Tuner 1": {
    description:
      "A small Acceleration increase. Acceleration machines also get extra stat changes.",
    tags: ["stats"],
  },
  "Acceleration Tuner 2": {
    description:
      "A small Acceleration increase. Acceleration machines also get extra stat changes.",
    tags: ["stats"],
    notes: SAME_AS_TUNER_1,
  },
  "Handling Tuner 1": {
    description:
      "A small Handling increase. Handling machines also get extra stat changes.",
    tags: ["stats"],
  },
  "Handling Tuner 2": {
    description:
      "A small Handling increase. Handling machines also get extra stat changes.",
    tags: ["stats"],
    notes: SAME_AS_TUNER_1,
  },
  "Power Tuner 1": {
    description:
      "A small Power increase. Power machines also get extra stat changes.",
    tags: ["stats"],
  },
  "Power Tuner 2": {
    description:
      "A small Power increase. Power machines also get extra stat changes.",
    tags: ["stats"],
    notes: SAME_AS_TUNER_1,
  },
  "Boost Tuner 1": {
    description:
      "A small Boost increase. Boost machines also get extra stat changes.",
    tags: ["stats", "boost"],
  },
  "Boost Tuner 2": {
    description:
      "A small Boost increase. Boost machines also get extra stat changes.",
    tags: ["stats", "boost"],
    notes: SAME_AS_TUNER_1,
  },
  "Air Trick Evolution": {
    description: "Two air tricks change every stat by +1.",
    tags: ["air-trick", "stats"],
  },
  "Damage Evolution": {
    description: "Taking damage changes every stat by +7.",
    tags: ["stats"],
  },
  "Item Hit Evolution": {
    description: "Landing an item hit changes every stat by +7.",
    tags: ["items", "attack", "stats"],
  },
  "Collision Evolution": {
    description: "Bumping other machines changes every stat by +1.",
    tags: ["collision", "stats"],
  },
  "Ring Evolution": {
    description: "Collecting 10 rings changes every stat by +1.",
    tags: ["rings", "stats"],
  },
  "Quick Starter": {
    description: "Every stat is +20 during lap 1.",
    tags: ["start", "stats"],
  },
  "Super Quick Starter": {
    description: "Every stat is +60 during lap 1.",
    tags: ["start", "stats"],
  },
  "Slow Starter": {
    description: "Every stat is +20 during lap 3.",
    tags: ["lap3", "stats"],
  },
  "Super Slow Starter": {
    description: "Every stat is +60 during lap 3.",
    tags: ["lap3", "stats"],
  },
  "Substitute Item": {
    description:
      "A homing-item hit drops your held items and makes you invincible.",
    tags: ["items", "defense"],
  },
  "Ring Mercy": {
    description: "Taking damage pays you rings.",
    tags: ["rings", "defense"],
  },
  "Damage Mercy": {
    description: "Taking damage makes you invincible for a short time.",
    tags: ["defense"],
  },
  "Item Mercy": {
    description: "Taking damage gives you an item.",
    tags: ["items", "defense"],
  },
  "Maximum Traction": {
    description: "Sand and ice no longer make you slip.",
    tags: [],
  },
  "Second Wind": {
    description: "Falling off the course gives you a Boost item.",
    tags: ["items", "boost"],
  },
  "Bumper Guard": {
    description: "Bumping a wall no longer drops your rings.",
    tags: ["rings", "defense"],
  },
  "Invincible Start": {
    description: "You are invincible for a while after the race begins.",
    tags: ["start", "defense"],
  },
  "Strong Finish": {
    description: "You are briefly invincible on lap 3.",
    tags: ["lap3", "defense"],
  },
  "Invincible Finish": {
    description: "You become invincible when you are close to the finish line.",
    tags: ["defense"],
  },
  "Item Keeper": {
    description: "Your items are not dropped.",
    tags: ["items", "defense"],
  },
  "Quick Recovery": {
    description: "You get back up from attacks sooner.",
    tags: ["defense"],
  },
  "Mini Quick Recovery": {
    description: "You move a little faster after you take a hit.",
    tags: ["defense"],
  },
  "Power Through": {
    description: "Runoff zones slow you down less.",
    tags: [],
  },
  "Crash Pads": {
    description: "Damage costs half as many rings.",
    tags: ["rings", "defense"],
  },
  "Summon Item Box": {
    description: "Spend 40 rings to call an item.",
    tags: ["items", "rings"],
  },
  "Lucky Pair": {
    description: "You sometimes receive twice as many items.",
    tags: ["items"],
  },
  "Double Down": {
    description: "Your stats drop, and every item pickup is doubled.",
    tags: ["items", "stats"],
  },
  "Inventory Swap": {
    description: "A button press swaps the order of your held items.",
    tags: ["items"],
  },
  "Inventory Plus": {
    description: "You can hold 3 items instead of 2.",
    tags: ["items"],
  },
  "Hazard Item Chance UP": {
    description: "Hazard items show up more often.",
    tags: ["items"],
  },
  "Attack Item Chance UP": {
    description: "Attack items show up more often.",
    tags: ["items", "attack"],
  },
  "Defense Item Chance UP": {
    description: "Defense items show up more often.",
    tags: ["items", "defense"],
  },
  "Boost Item Chance UP": {
    description: "Boost items show up more often.",
    tags: ["items", "boost"],
  },
  "Wisp Chance UP": {
    description: "Wisp items show up more often.",
    tags: ["items"],
  },
  "Go Go Omochao": {
    description: "Omochao hands out rings for longer and shows up more often.",
    tags: ["items", "rings"],
  },
  "Boost Starter": {
    description: "You start the race holding a Boost.",
    tags: ["items", "start", "boost"],
  },
  "Double Boost Specialist": {
    description:
      "You start holding a Double Boost, and Double Boost can appear in item boxes.",
    tags: ["items", "start", "boost"],
  },
  "Dark Chao Starter": {
    description: "You start the race holding a Dark Chao.",
    tags: ["items", "start"],
  },
  "Warp Ring Specialist": {
    description:
      "You start holding a Warp Ring, and Warp Rings can appear in item boxes.",
    tags: ["items", "start"],
  },
  "Giant Rocket Punch": {
    description: "Rocket Punch is larger and shows up more often.",
    tags: ["items", "attack"],
  },
  "Giant Spiked Iron Ball": {
    description: "The Spiked Iron Ball is larger and shows up more often.",
    tags: ["items", "attack"],
  },
  "Short Fuse": {
    description: "Bombs charge faster and show up more often.",
    tags: ["items", "attack"],
  },
  "Monster Truck Starter": {
    description: "You start the race holding a Monster Truck.",
    tags: ["items", "start"],
  },
  "Drift Charge Kit": {
    description:
      "The drift gauge builds faster, and handling is a little higher.",
    tags: ["kit", "drift", "charge"],
  },
  "Item Hoarder Kit": {
    description: "Hold up to 3 items, and finishing a lap grants items.",
    tags: ["kit", "items"],
  },
  "Damage Support Kit": {
    description:
      "You are invincible for a while at the start, and falling off grants a Boost item.",
    tags: ["kit", "defense", "start", "items", "boost"],
  },
  "Speed Machine Kit": {
    description:
      "Built around gaining rings and speeding up with them. Speed machines get stat changes.",
    tags: ["kit", "rings", "stats"],
  },
  "Acceleration Machine Kit": {
    description:
      "Softens the hit of taking damage. Acceleration machines get stat changes.",
    tags: ["kit", "defense", "stats"],
  },
  "Handling Machine Kit": {
    description:
      "A level-4 charge boost makes you invincible. Handling machines get stat changes.",
    tags: ["kit", "charge", "boost", "defense", "stats"],
  },
  "Power Machine Kit": {
    description:
      "Colliding with another machine starts a boost. Power machines get stat changes.",
    tags: ["kit", "collision", "boost", "stats"],
  },
  "Boost Machine Kit": {
    description:
      "A charge boost pays a few rings. Boost machines get stat changes.",
    tags: ["kit", "rings", "charge", "boost", "stats"],
  },
  "Speed Character Kit": {
    description:
      "Invincible at the start, and a clean start pays rings. Speed characters get stat changes.",
    tags: ["kit", "start", "rings", "defense", "stats"],
  },
  "Acceleration Character Kit": {
    description:
      "Built around catching rivals and gaining rings. Acceleration characters get stat changes.",
    tags: ["kit", "rings", "stats"],
  },
  "Handling Character Kit": {
    description:
      "Built around collisions that take rings. Handling characters get stat changes.",
    tags: ["kit", "collision", "rings", "stats"],
  },
  "Power Character Kit": {
    description:
      "Catch rivals, then boost when you collide with them. Power characters get stat changes.",
    tags: ["kit", "collision", "boost", "stats"],
  },
  "Boost Character Kit": {
    description:
      "Air tricks help you accelerate. Boost characters get stat changes.",
    tags: ["kit", "air-trick", "stats"],
  },
  "Perfect Charge Kit": {
    description:
      "Strengthens a perfect-timing charge boost, and that timing also pays rings.",
    tags: ["kit", "charge", "boost", "rings"],
  },
  "4th Stage Charge Kit": {
    description:
      "Raises the charge cap to 4 and makes charging easier. A level-4 charge boost grants invincibility.",
    tags: ["kit", "charge", "drift", "defense"],
  },
  "Air Trick Action Kit": {
    description:
      "Speeds up air tricks. More than three tricks grants a short invincibility.",
    tags: ["kit", "air-trick", "defense"],
  },
  "Slipstream Kit": {
    description:
      "Strengthens slipstreams. Bumping another machine adds +1 to every stat.",
    tags: ["kit", "slipstream", "collision", "stats"],
  },
  "Spin Dash Kit": {
    description:
      "Drift charge becomes holding drift and tapping accelerate. It builds slower and lasts longer.",
    tags: ["kit", "drift", "charge"],
  },
  "Speedy Shortcut Kit": {
    description:
      "Start with a Boost and a Double Boost. Speed items pay rings inside slowdown zones.",
    tags: ["kit", "start", "boost", "rings", "items"],
  },
  "Item Buster Kit": {
    description:
      "Attack items appear more often, and attacking rivals pays rings.",
    tags: ["kit", "items", "attack", "rings"],
  },
  "Drift Spinner Kit": {
    description:
      "Level 1 drift charge builds a little faster, and drifts spin rivals away.",
    tags: ["kit", "drift", "charge"],
  },
  "Panel Combo Kit": {
    description:
      "Dash Panels pay rings, chains pay more, and Power and Handling rise.",
    tags: ["kit", "rings", "stats"],
  },
  "Comeback Kit": {
    description: "Raises the ring cap to 110, and lap 3 grants two items.",
    tags: ["kit", "rings", "items", "lap3"],
  },
  "Ace Pilot Kit": {
    description:
      "Better performance in flight form, and Dash Panels or Gates pay rings.",
    tags: ["kit", "flight", "rings"],
  },
  "Sea Dog Kit": {
    description:
      "Better performance in water form, and air tricks come out much faster.",
    tags: ["kit", "water", "air-trick"],
  },
  "All-Rounder Kit": {
    description:
      "Weakens slowdown zones and slippery roads, and greatly raises water and flight stats.",
    tags: ["kit", "water", "flight", "stats"],
  },
  "Wisp Hoarder Kit": {
    description:
      "Built around using many Wisp items. Finishing a lap grants items.",
    tags: ["kit", "items"],
  },
};
