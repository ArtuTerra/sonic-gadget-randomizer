import { useState } from "react";
import type { Gadget } from "../data/types.ts";

const GLYPH_LABEL: Record<string, string> = {
  ring: "R",
  drift: "Dr",
  air: "Air",
  item: "It",
  kit: "Kit",
  stat: "St",
  shield: "Sh",
  power: "Pw",
};

export function GadgetIcon({
  gadget,
  size = 56,
}: {
  gadget: Gadget;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (gadget.icon.src && !failed) {
    return (
      <img
        className="gadget-icon"
        src={gadget.icon.src}
        alt=""
        width={size}
        height={size}
        onError={() => {
          setFailed(true);
        }}
      />
    );
  }

  return (
    <span
      className="gadget-fallback"
      style={{
        background: gadget.icon.fallback.color,
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      {GLYPH_LABEL[gadget.icon.fallback.glyph] ?? "?"}
    </span>
  );
}
