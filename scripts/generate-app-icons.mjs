// Regenerate PWA, Apple, and tab icons from assets/app-icon-source.png.
// Run: node scripts/generate-app-icons.mjs
import sharp from "sharp";

const source = "assets/app-icon-source.png";
const bg = { r: 14, g: 21, b: 32, alpha: 1 };

async function make(size, scale, out, background = bg) {
  const inner = Math.round(size * scale);
  const img = await sharp(source)
    .trim()
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: img, gravity: "center" }])
    .png()
    .toFile(out);
}

await make(192, 0.84, "public/icons/icon-192.png");
await make(512, 0.84, "public/icons/icon-512.png");
await make(512, 0.66, "public/icons/icon-maskable-512.png");
await make(180, 0.8, "public/apple-touch-icon.png");
// Tab favicon: transparent so it sits on light or dark tab bars.
await make(32, 1, "public/favicon-32.png", { r: 0, g: 0, b: 0, alpha: 0 });
