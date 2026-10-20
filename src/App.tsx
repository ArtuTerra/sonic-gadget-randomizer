import { useEffect, useRef, useState } from "react";
import { BuildList } from "./components/BuildList.tsx";
import { Credits } from "./components/Credits.tsx";
import { DatabankList } from "./components/DatabankList.tsx";
import { Plate } from "./components/Plate.tsx";
import {
  PLATE_SLOT_COUNTS,
  PLATE_TIERS,
  isPlateTier,
  type Build,
  type PlateTier,
} from "./core/plate.ts";
import {
  decodeBuild,
  randomSeed,
  randomize,
  shareHash,
  type PoolGadget,
} from "./core/index.ts";
import { databank, type Gadget } from "./data/index.ts";
import "./index.css";

const pool: PoolGadget[] = databank.gadgets.map((gadget) => ({
  id: gadget.id,
  code: gadget.code,
  slots: gadget.slots,
  status: gadget.status,
}));

const gadgetsById = new Map<string, Gadget>(
  databank.gadgets.map((gadget) => [gadget.id, gadget]),
);

function plateLabel(tier: PlateTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function shareUrlFor(build: Build): string {
  const url = new URL(window.location.href);
  url.hash = shareHash(build, pool).slice(1);
  return url.toString();
}

function roll(plate: PlateTier): Build {
  return randomize({ plate, gadgets: pool, seed: randomSeed() });
}

function readInitialRoll(): { build: Build; notice: string | null } {
  const hash = window.location.hash;
  if (hash.includes("b=")) {
    try {
      return { build: decodeBuild(hash, pool), notice: null };
    } catch {
      return {
        build: roll("master"),
        notice:
          "This build is no longer valid (game update?). Rolled a new Master build instead.",
      };
    }
  }
  return { build: roll("master"), notice: null };
}

export default function App() {
  const [initial] = useState(readInitialRoll);
  const [build, setBuild] = useState(initial.build);
  const [notice, setNotice] = useState(initial.notice);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );
  const shareInput = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<number | null>(null);
  const shareUrl = shareUrlFor(build);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length > 1 && !hash.includes("b=")) return;
    if (shareUrl !== window.location.href) {
      window.history.replaceState(null, "", shareUrl);
    }
  }, [shareUrl]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (!hash.includes("b=")) return;
      try {
        setBuild(decodeBuild(hash, pool));
        setNotice(null);
        setCopyState("idle");
      } catch {
        setNotice("This build is no longer valid (game update?).");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function showBuild(next: Build) {
    setBuild(next);
    setNotice(null);
    setCopyState("idle");
  }

  async function copyShareLink() {
    window.history.replaceState(null, "", shareUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setCopyState("idle");
        copyTimer.current = null;
      }, 2000);
    } catch {
      setCopyState("manual");
      shareInput.current?.focus();
      shareInput.current?.select();
    }
  }

  const equipped = build.rows.flat().length;

  return (
    <>
      <header className="site-header">
        <div>
          <p className="eyebrow">Sonic Racing: CrossWorlds</p>
          <h1>Gadget Randomizer</h1>
          <p className="lede">
            Roll a random valid gadget build, then copy a link to share the same
            plate.
          </p>
        </div>
        <div className="plate-picker">
          <label htmlFor="plate-tier">Plate</label>
          <select
            id="plate-tier"
            value={build.plate}
            onChange={(event) => {
              const next = event.target.value;
              if (!isPlateTier(next) || next === build.plate) return;
              showBuild(roll(next));
            }}
          >
            {PLATE_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {plateLabel(tier)} · {PLATE_SLOT_COUNTS[tier]} slots
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="layout">
        <section className="panel" aria-labelledby="plate-heading">
          <div className="panel-heading">
            <h2 id="plate-heading">Gadget plate</h2>
            <p>
              {plateLabel(build.plate)} · {PLATE_SLOT_COUNTS[build.plate]} slots
            </p>
          </div>
          <Plate build={build} gadgetsById={gadgetsById} />
          <p className="rules">
            Gadgets take 1, 2, or 3 slots and stay inside one row. The same
            gadget is never equipped twice. Overlapping effects are allowed.
            {build.plate !== "master"
              ? " Locked cells are outside this plate."
              : ""}
          </p>
          <div className="actions">
            <button
              type="button"
              className="randomize"
              onClick={() => {
                showBuild(roll(build.plate));
              }}
            >
              Randomize
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => void copyShareLink()}
            >
              {copyState === "copied" ? "Copied" : "Copy share link"}
            </button>
          </div>
          <label className="share-link">
            Share link
            <input
              ref={shareInput}
              readOnly
              value={shareUrl}
              spellCheck={false}
              onFocus={(event) => {
                event.currentTarget.select();
              }}
            />
          </label>
          <p className="status" role="status">
            {notice
              ? notice
              : copyState === "manual"
                ? "Select the share link and copy it."
                : `${plateLabel(build.plate)} build, ${equipped} ${equipped === 1 ? "gadget" : "gadgets"}.`}
          </p>
        </section>

        <aside className="panel" aria-labelledby="build-heading">
          <div className="panel-heading">
            <h2 id="build-heading">Your build</h2>
            <p>
              {equipped} {equipped === 1 ? "gadget" : "gadgets"}
            </p>
          </div>
          <div className="build-scroll">
            <BuildList build={build} gadgetsById={gadgetsById} />
          </div>
        </aside>
      </main>

      <details className="all-gadgets" id="databank">
        <summary>
          All gadgets
          <span>
            {databank.gadgets.length} in the list,{" "}
            {
              databank.gadgets.filter((gadget) => gadget.status === "released")
                .length
            }{" "}
            released
          </span>
        </summary>
        <DatabankList gadgets={databank.gadgets} />
      </details>
      <Credits />

      <footer className="site-footer">
        <p>Fan project, not affiliated with SEGA.</p>
        <p>
          <a
            href="#databank"
            onClick={() => {
              const details = document.getElementById("databank");
              if (details instanceof HTMLDetailsElement) details.open = true;
            }}
          >
            All gadgets
          </a>
          {" · "}
          <a href="#credits">Credits</a>
        </p>
      </footer>
    </>
  );
}
