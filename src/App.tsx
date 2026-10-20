import { useEffect, useState } from "react";
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

const GAME_TITLE = "Sonic Racing: CrossWorlds";
const LOGO_SRC = "/icons/sonic-racing-crossworlds-logo.webp";

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
  const [logoOk, setLogoOk] = useState(true);
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
  }

  const equipped = build.rows.flat().length;

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <h1 className="game-title">
            {logoOk ? (
              <img
                className="game-logo"
                src={LOGO_SRC}
                alt=""
                width={1600}
                height={723}
                onError={() => {
                  setLogoOk(false);
                }}
              />
            ) : null}
            <span
              className={logoOk ? "visually-hidden" : "game-title-fallback"}
            >
              {GAME_TITLE}
            </span>
          </h1>
          <p className="app-kicker">Gadget Randomizer</p>
          <p className="lede">
            Roll a random valid gadget build. This page's address is a link to
            the same build.
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
        <section className="panel plate-panel" aria-labelledby="plate-heading">
          <div className="panel-heading">
            <h2 id="plate-heading">Gadget plate</h2>
            <p>
              {plateLabel(build.plate)} · {PLATE_SLOT_COUNTS[build.plate]} slots
            </p>
          </div>
          <Plate build={build} gadgetsById={gadgetsById} />
          {notice ? (
            <p className="notice" role="status">
              {notice}
            </p>
          ) : null}
          <button
            type="button"
            className="randomize"
            onClick={() => {
              showBuild(roll(build.plate));
            }}
          >
            Randomize
          </button>
        </section>

        <aside className="panel build-panel" aria-labelledby="build-heading">
          <div className="build-panel-fill">
            <div className="panel-heading">
              <h2 id="build-heading">Your build</h2>
              <p>
                {equipped} {equipped === 1 ? "gadget" : "gadgets"}
              </p>
            </div>
            <div className="build-scroll">
              <BuildList build={build} gadgetsById={gadgetsById} />
            </div>
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
