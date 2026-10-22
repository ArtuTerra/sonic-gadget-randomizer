import { useRef } from "react";
import {
  PLATE_SLOT_COUNTS,
  PLATE_TIERS,
  isPlateTier,
  type PlateTier,
} from "../core/plate.ts";
import type { Gadget } from "../data/types.ts";
import { OwnedPicker } from "./OwnedPicker.tsx";

function plateLabel(tier: PlateTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function BuildOptions({
  plate,
  onPlateChange,
  includeUpcoming,
  onIncludeUpcomingChange,
  pickerGadgets,
  unowned,
  onUnownedChange,
}: {
  plate: PlateTier;
  onPlateChange: (next: PlateTier) => void;
  includeUpcoming: boolean;
  onIncludeUpcomingChange: (next: boolean) => void;
  pickerGadgets: readonly Gadget[];
  unowned: ReadonlySet<string>;
  onUnownedChange: (next: Set<string>) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="gear-button"
        aria-label="Build options"
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.14 12.94a7.5 7.5 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.3 7.3 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.5 7.5 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.24 1.13-.55 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
          />
        </svg>
      </button>
      <dialog
        ref={dialog}
        className="options-sheet"
        aria-labelledby="options-heading"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="options-body">
          <div className="options-head">
            <h2 id="options-heading">Build options</h2>
            <button
              type="button"
              className="options-close"
              aria-label="Close"
              onClick={() => {
                dialog.current?.close();
              }}
            >
              ×
            </button>
          </div>

          <label className="options-field">
            <span>Plate</span>
            <select
              value={plate}
              onChange={(event) => {
                const next = event.target.value;
                if (isPlateTier(next)) onPlateChange(next);
              }}
            >
              {PLATE_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {plateLabel(tier)} · {PLATE_SLOT_COUNTS[tier]} slots
                </option>
              ))}
            </select>
          </label>

          <label className="switch-row">
            <span>Upcoming gadgets</span>
            <input
              type="checkbox"
              role="switch"
              className="switch"
              checked={includeUpcoming}
              onChange={(event) => {
                onIncludeUpcomingChange(event.target.checked);
              }}
            />
          </label>

          <div className="options-field">
            <span>Owned gadgets</span>
            <OwnedPicker
              gadgets={pickerGadgets}
              unowned={unowned}
              onChange={onUnownedChange}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
