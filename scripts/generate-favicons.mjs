/**
 * Gera ícones do site a partir de public/icon-source.png
 * - Use uma imagem com fundo transparente (só o desenho)
 * - Gera: icon.png (32x32) e apple-touch-icon.png (180x180)
 * - Fundo sempre transparente, desenho centralizado no quadrado
 * Rode: npm run favicons  ou  node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const inputPath = join(publicDir, "icon-source.png");

async function main() {
  if (!existsSync(inputPath)) {
    console.error("Coloque sua imagem (fundo transparente) em public/icon-source.png e rode de novo: npm run favicons");
    process.exit(1);
  }

  const image = sharp(inputPath);
  const meta = await image.metadata();
  const w = meta.width || 1;
  const h = meta.height || 1;
  const size = Math.max(w, h);

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

  await square.clone().resize(32, 32).png().toFile(join(publicDir, "icon.png"));
  console.log("Wrote public/icon.png (32x32)");
  await square.clone().resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));
  console.log("Wrote public/apple-touch-icon.png (180x180)");
  console.log("Pronto. Ícones com fundo transparente.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
