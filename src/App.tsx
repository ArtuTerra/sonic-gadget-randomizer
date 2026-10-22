import { useEffect, useRef, useState } from "react";
import { BuildList } from "./components/BuildList.tsx";
import { Credits } from "./components/Credits.tsx";
import { DatabankList } from "./components/DatabankList.tsx";
import { BuildOptions } from "./components/BuildOptions.tsx";
import { Plate } from "./components/Plate.tsx";
import { PLATE_SLOT_COUNTS, type Build, type PlateTier } from "./core/plate.ts";
import {
  decodeBuild,
  eligibleGadgets,
  parseIdList,
  randomSeed,
  serializeIdList,
  randomize,
  shareHash,
  type PoolGadget,
} from "./core/index.ts";
import { databank, type Gadget } from "./data/index.ts";
import "./index.css";

const GAME_TITLE = "Sonic Racing: CrossWorlds";
const LOGO_SRC = "/icons/sonic-racing-crossworlds-logo.webp";

const catalog: PoolGadget[] = databank.gadgets.map((gadget) => ({
  id: gadget.id,
  code: gadget.code,
  slots: gadget.slots,
  status: gadget.status,
}));

/** Share links may hold upcoming gadgets, so decoding always accepts them. */
const pool: PoolGadget[] = eligibleGadgets(catalog, { includeUpcoming: true });

const UNOWNED_KEY = "sgr.unowned.v1";
const UPCOMING_KEY = "sgr.includeUpcoming.v1";

interface Settings {
  unowned: Set<string>;
  includeUpcoming: boolean;
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be full or blocked. Settings just won't persist.
  }
}

function readSettings(): Settings {
  return {
    unowned: parseIdList(readStored(UNOWNED_KEY)),
    includeUpcoming: readStored(UPCOMING_KEY) === "1",
  };
}

const gadgetsById = new Map<string, Gadget>(
  databank.gadgets.map((gadget) => [gadget.id, gadget]),
);

function shareUrlFor(build: Build): string {
  const url = new URL(window.location.href);
  url.hash = shareHash(build, pool).slice(1);
  return url.toString();
}

function roll(plate: PlateTier, settings: Settings): Build {
  return randomize({
    plate,
    gadgets: eligibleGadgets(catalog, settings),
    seed: randomSeed(),
  });
}

function shortfallNotice(build: Build): string | null {
  const used = build.rows
    .flat()
    .reduce((sum, item) => sum + (gadgetsById.get(item.id)?.slots ?? 0), 0);
  return used < PLATE_SLOT_COUNTS[build.plate]
    ? "Not enough owned gadgets to fill this plate."
    : null;
}

function readInitialRoll(settings: Settings): {
  build: Build;
  notice: string | null;
} {
  const hash = window.location.hash;
  if (hash.includes("b=")) {
    try {
      return { build: decodeBuild(hash, pool), notice: null };
    } catch {
      return {
        build: roll("master", settings),
        notice:
          "This build is no longer valid (game update?). Rolled a new Master build instead.",
      };
    }
  }
  const build = roll("master", settings);
  return { build, notice: shortfallNotice(build) };
}

export default function App() {
  const [settings, setSettings] = useState(readSettings);
  const [initial] = useState(() => readInitialRoll(settings));
  const [build, setBuild] = useState(initial.build);
  const [notice, setNotice] = useState(initial.notice);
  const [logoOk, setLogoOk] = useState(true);
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
    setNotice(shortfallNotice(next));
    setCopyState("idle");
  }

  async function copyShareLink() {
    window.history.replaceState(null, "", shareUrl);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
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

  function updateSettings(next: Settings) {
    setSettings(next);
    writeStored(UNOWNED_KEY, serializeIdList(next.unowned));
    writeStored(UPCOMING_KEY, next.includeUpcoming ? "1" : "0");
  }

  const pickerGadgets = databank.gadgets.filter(
    (gadget) =>
      gadget.status === "released" ||
      (settings.includeUpcoming && gadget.status === "upcoming"),
  );
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
        </div>
      </header>

      <main className="layout">
        <section className="panel plate-panel" aria-labelledby="plate-heading">
          <div className="plate-toolbar">
            <h2 id="plate-heading">Random Gadget Plate</h2>
            <BuildOptions
              plate={build.plate}
              onPlateChange={(next) => {
                if (next === build.plate) return;
                showBuild(roll(next, settings));
              }}
              includeUpcoming={settings.includeUpcoming}
              onIncludeUpcomingChange={(includeUpcoming) => {
                updateSettings({ ...settings, includeUpcoming });
              }}
              pickerGadgets={pickerGadgets}
              unowned={settings.unowned}
              onUnownedChange={(unowned) => {
                updateSettings({ ...settings, unowned });
              }}
            />
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
              showBuild(roll(build.plate, settings));
            }}
          >
            Randomize
          </button>
          <div className="share-row">
            <input
              ref={shareInput}
              className="share-link"
              readOnly
              value={shareUrl}
              aria-label="Share link"
              spellCheck={false}
              onFocus={(event) => {
                event.currentTarget.select();
              }}
            />
            <button
              type="button"
              className="copy-link"
              onClick={() => void copyShareLink()}
            >
              {copyState === "copied" ? "Copied!" : "Copy link"}
            </button>
          </div>
          {copyState === "manual" ? (
            <p className="share-fallback" role="status">
              Select the link and copy it.
            </p>
          ) : null}
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
