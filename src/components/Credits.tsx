import { databank } from "../data/index.ts";
import { ICON_CREDIT, LOGO_SOURCE } from "../data/credits.ts";

export function Credits() {
  const verified =
    databank.gadgets.find((gadget) => gadget.lastVerified)?.lastVerified ??
    "unknown";
  const iconCount = databank.gadgets.filter((gadget) => gadget.icon.src).length;

  return (
    <section className="credits" id="credits" aria-labelledby="credits-heading">
      <h2 id="credits-heading">Credits and sources</h2>
      <ul>
        <li>
          Names, categories, slot sizes, and unlock criteria come from{" "}
          <a href={databank.source}>
            Sonic Wiki Zone, Gadget (Sonic Racing: CrossWorlds)
          </a>
          . Checked {verified}. Wiki prose is CC BY-SA. The short effect lines
          on this page are original paraphrases, not that text.
        </li>
        <li>
          {iconCount} gadget icons: {ICON_CREDIT}. Each file page is stored on
          that gadget as <code>icon.sourceUrl</code>. The files in this project
          are local copies, not hotlinked.
        </li>
        <li>
          The header logo is a local copy of the official{" "}
          <a href={LOGO_SOURCE}>Sonic Racing: CrossWorlds logo</a>,{" "}
          {ICON_CREDIT}. It is not hotlinked.
        </li>
        <li>
          Gadgets with no file on the wiki use an original fallback mark. They
          are the upcoming rows.
        </li>
        <li>
          The list was cross-checked against the gadget table in{" "}
          <code>docs/PLAN.md</code>. Unlock cells marked † were blank on the
          wiki and filled from the row above. They are not checked in game.
        </li>
      </ul>
      <p>Fan project, not affiliated with SEGA.</p>
    </section>
  );
}
