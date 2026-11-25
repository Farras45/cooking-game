// The Sizzling Ladle — hand-in program (Node 22, standard library only).
// This program copies the static game in game/ and the screenshots in
// screenshots/ from beside this file into the output directory, then writes
// /output/dossier.json with the kit's vendored dossier builder, so the sealed
// scorer can check the game and the judge can read its dossier.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  if (!existsSync(from)) return false;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  return true;
}

mkdirSync(out, { recursive: true });
copyTree(join(here, 'game'), join(out, 'game'));
copyTree(join(here, 'screenshots'), join(out, 'screenshots'));

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
if (!dossier || dossier.length === 0) throw new Error('buildDossier wrote nothing');
const parsed = JSON.parse(new TextDecoder().decode(dossier));
if (parsed.schema !== 'makefun/dossier/v1') throw new Error('unexpected dossier schema');
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`wrote ${join(out, 'dossier.json')} (${dossier.length} bytes, ${parsed.images?.length ?? 0} screenshots)`);

