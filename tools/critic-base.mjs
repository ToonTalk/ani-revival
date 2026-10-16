// Ken's Cinderella as Ani made it, at 4 frames a second, as a run that can be remade
// with criticism (src/pipeline.js remakeFilmSteps), built from the goldens rather than
// made again. As in 1978 (film1978): its files are those tools/check-1978.mjs holds the
// pipeline to (KEN;CP 30 as reports/pass1-choices.txt; each scene's program, summary and
// POSIT file as reports/pass2/ has them, as filesOf keeps them), its glass boxes
// reports/pass2/<scene>.glass.json, its films reports/film/<scene>.film.json and its
// choice points app/data/pass1.json's. With extensions whose goldens tools/check-ext.mjs
// keeps (filmWith: KNOW's in reports/ext/know, SLIPS's in reports/ext/slips), the scenes'
// files, glass boxes and films are those, and KEN;CP 30 is pass 1's as in 1978 (KNOW and
// SLIPS choose as Ken's Cinderella did, which check-ext checks). tools/check-critic.mjs
// and test/critic*.test.js remake them.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SCENES } from "../src/pipeline.js";

function film(root, filesDir, glassDir, filmDir, extensions) {
  const read = (p) => readFileSync(join(root, p), "utf8");
  const files = { "KEN;CP 30": read("reports/pass1-choices.txt") };
  for (const f of readdirSync(join(root, filesDir)).sort()) {
    const m = /^(ken1?)-([a-z0-9]+)\.([a-z0-9]+)$/.exec(f);
    if (m && m[3] !== "print") files[`${m[1].toUpperCase()};${m[2].toUpperCase()} ${m[3].toUpperCase()}`] = read(`${filesDir}/${f}`);
  }
  const pass1 = JSON.parse(read("app/data/pass1.json"));
  return {
    choices: pass1.choicePoints.length, choicePoints: pass1.choicePoints,
    scenes: SCENES.map((id) => ({ id, film: JSON.parse(read(`${filmDir}/${id}.film.json`)), glass: JSON.parse(read(`${glassDir}/${id}.glass.json`)) })),
    ...(extensions.length ? { extensions } : {}),
    files,
  };
}

export function film1978(root = process.cwd()) {
  return film(root, "reports/pass2", "reports/pass2", "reports/film", []);
}

// with: "know" (KNOW, with MEND) or "slips" (SLIPS, with KNOW and MEND)
export function filmWith(with_, root = process.cwd()) {
  const dir = `reports/ext/${with_}`;
  const extensions = { know: ["mend", "know"], slips: ["mend", "know", "slips"] }[with_];
  if (!extensions) throw new Error(`no goldens of a whole film with ${with_} to remake`);
  return film(root, dir, dir, dir, extensions);
}
