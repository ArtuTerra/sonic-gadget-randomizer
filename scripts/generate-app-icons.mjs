import sharp from "sharp";
const logo = "public/icons/sonic-racing-crossworlds-logo.webp";
const bg = { r: 14, g: 21, b: 32, alpha: 1 };
async function make(size, scale, out) {
  const w = Math.round(size * scale);
  const img = await sharp(logo).resize({ width: w }).toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: img, gravity: "center" }])
    .png()
    .toFile(out);
}
await make(192, 0.92, "public/icons/icon-192.png");
await make(512, 0.92, "public/icons/icon-512.png");
await make(512, 0.74, "public/icons/icon-maskable-512.png");
await make(180, 0.86, "public/apple-touch-icon.png");
await make(32, 1.0, "public/favicon-32.png");

// Tab favicon: the full logo is unreadable at 32px, so use just the "SONIC" word.
const word = await sharp(logo)
  .extract({ left: 40, top: 0, width: 1500, height: 360 })
  .resize({ width: 31 })
  .toBuffer();
await sharp({ create: { width: 32, height: 32, channels: 4, background: bg } })
  .composite([{ input: word, gravity: "center" }])
  .png()
  .toFile("public/favicon-32.png");
