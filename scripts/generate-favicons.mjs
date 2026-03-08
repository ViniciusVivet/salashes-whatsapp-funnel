/**
 * Generates favicon-safe assets from public/icon.png:
 * - Centers artwork on a square transparent canvas (no stretch/squash)
 * - Preserves aspect ratio
 * - Exports: 32x32, 48x48, 180x180, 512x512
 * Run: node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const inputPath = join(publicDir, "icon-source.png");

const SIZES = [32, 48, 180, 512];

async function main() {
  if (!existsSync(inputPath)) {
    console.error("Missing public/icon-source.png. Copy your source artwork there and run again.");
    process.exit(1);
  }

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const size = Math.max(w, h);

  // Center the image on a square transparent canvas (no stretch)
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);

  const squareBuffer = await image
    .resize(w, h)
    .extend({
      top,
      bottom: size - h - top,
      left,
      right: size - w - left,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const square = sharp(squareBuffer);

  for (const s of SIZES) {
    const outPath = s === 180 ? join(publicDir, "apple-touch-icon.png") : join(publicDir, `icon-${s}.png`);
    await square.clone().resize(s, s).png().toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }

  // Default favicon: use 32x32 as icon.png so existing metadata works, or we'll point to icon-32.png
  await sharp(squareBuffer).resize(32, 32).png().toFile(join(publicDir, "icon.png"));
  console.log("Wrote public/icon.png (32x32)");
  console.log("Done. Favicons are centered, square, and aspect-ratio preserved.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
