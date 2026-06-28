import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(
  path.resolve(import.meta.dirname, "../../Monzi-2.1/package.json")
);
const sharp = require("sharp");

const root = path.resolve(import.meta.dirname, "..");
const webAssets = path.resolve(root, "../Monzi-2.1/src/assets");
const mobileAssets = path.resolve(root, "assets");
const imagesDir = path.join(mobileAssets, "images");

const iconSource = path.join(webAssets, "monzi-icon.png");
const logoSource = path.join(webAssets, "logo-mozi.png");

async function writeIcon(image, filename) {
  const target = path.join(imagesDir, filename);
  await image.png().toFile(target);
  const meta = await sharp(target).metadata();
  console.log(`wrote ${filename} (${meta.width}x${meta.height})`);
}

async function main() {
  await fs.mkdir(imagesDir, { recursive: true });

  await fs.copyFile(logoSource, path.join(mobileAssets, "logo-mozi.png"));
  await fs.copyFile(iconSource, path.join(mobileAssets, "monzi-icon.png"));
  console.log("copied logo-mozi.png and monzi-icon.png");

  const source = sharp(iconSource).ensureAlpha();
  const resize = (size) =>
    source
      .clone()
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });

  await writeIcon(resize(1024), "icon.png");
  await writeIcon(resize(1024), "android-icon-foreground.png");
  await writeIcon(resize(1024).grayscale(), "android-icon-monochrome.png");
  await writeIcon(resize(512), "splash-icon.png");
  await writeIcon(resize(48), "favicon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
