#!/usr/bin/env node
/**
 * Converts JPG cinematic assets to WebP (quality 82).
 * Run from apps/web: node scripts/optimize-visual-assets.mjs
 * Requires: npm install sharp (dev)
 */
import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const dirs = ['hero', 'corridors', 'offices', 'live-rates', 'footer'];

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp: pnpm add -D sharp');
    process.exit(1);
  }

  for (const dir of dirs) {
    const folder = join(root, dir);
    let entries;
    try {
      entries = await readdir(folder);
    } catch {
      continue;
    }
    for (const file of entries.filter((f) => f.endsWith('.jpg'))) {
      const input = join(folder, file);
      const output = join(folder, file.replace(/\.jpg$/, '.webp'));
      await sharp(input).webp({ quality: 82, effort: 4 }).toFile(output);
      const { size: jpgSize } = await stat(input);
      const { size: webpSize } = await stat(output);
      console.log(`${dir}/${file} → .webp (${Math.round(jpgSize / 1024)}KB → ${Math.round(webpSize / 1024)}KB)`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
