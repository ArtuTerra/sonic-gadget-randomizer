import { useState } from "react";
import { Plate } from "./components/Plate.tsx";
import { databank } from "./data/index.ts";
import "./index.css";

export default function App() {
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <header className="site-header">
        <p className="eyebrow">Sonic Racing: CrossWorlds</p>
        <h1>Gadget Randomizer</h1>
        <p className="lede">
          Press the button, get a random valid gadget build. This is the project
          skeleton, so the plate stays empty for now.
        </p>
      </header>

      <main className="layout">
        <section className="panel" aria-labelledby="plate-heading">
          <div className="panel-heading">
            <h2 id="plate-heading">Gadget plate</h2>
            <p>2 rows × 3 slots</p>
          </div>
          <Plate />
          <p className="rules">
            Gadgets take 1, 2, or 3 slots and have to fit on a single row. The
            same gadget cannot be equipped twice.
          </p>
          <button
            type="button"
            className="randomize"
            onClick={() => {
              setClicked(true);
            }}
          >
            Randomize
          </button>
          <p className="status" role="status">
            {clicked
              ? "No build was rolled. The randomizer arrives in a later milestone."
              : "The plate is empty. Randomize does not roll a build yet."}
          </p>
        </section>

        <aside className="panel">
          <h2>Your build</h2>
          <p className="empty-build">Nothing equipped.</p>
          <p className="seed-note">
            Databank: {databank.gadgets.length} placeholder gadgets. The real
            list is a later milestone, so these names are examples only.
          </p>
        </aside>
      </main>

      <footer className="site-footer">
        <p>Fan project, not affiliated with SEGA.</p>
      </footer>
    </>
  );
}
