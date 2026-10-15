// DETAIL (src/director/revive/detail.lisp, dtwalk, dttend, dtrhym), a few of the "myriad
// details" of the thesis (AI-TR-540 pp. 183-187), one at a time: what each changes in
// Ken's Cinderella, for the written diff each comes with (reports/ext/detail/README.md).
// The chained film (pass 1, then each scene's pass 2 and filming, as the film page makes
// it) with MEND and one detail (the others turned off with :detail-off, REVIVE;DETAIL),
// for each detail, then with all of them, which should make the goldens of
// reports/ext/detail/ (tools/check-ext.mjs --extensions detail checks them file by
// file), and with the tendencies given to the convey methods too
// (:detail-tendencies-of-convey-methods, off in DETAIL, a decision for Ken), each beside
// Ken's 1978 Cinderella (reports/film, and reports/pass2's glass boxes and programs; at
// 24 frames a second reports/film/24fps): pass 1's CP and the choice points that differ
// from app/data/pass1.json, and for each scene its frames, the first frame that differs,
// its events, its program, its tasks whose current choice differs, its subscenes whose
// time differs, the notes left, by kind, and how each character turned as it walked
// (the mean of how far its heading turned from one frame to the next, in the frames it
// moved in, tools/one-by-one.mjs turning), with the detail and in 1978.
// Usage: node tools/check-detail.mjs [--only walk,tend,rhythm,tend-convey] [--fps 24] [--save]
//   --save   write what was found to reports/ext/detail/each.json (or each-24fps.json),
//            which reports/ext/detail/README.md quotes, instead of comparing with it
// Prints each check with ok or FAIL; exits non-zero if any fails.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { FILE_NAMES } from "../src/pipeline.js";
import { chained, describe } from "./one-by-one.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const fps = opt("--fps") === null ? 4 : Number(opt("--fps"));
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24");
const save = args.includes("--save");
// The details, as REVIVE;DETAIL names them for :detail-off, and the decision for Ken.
const DETAILS = [
  ["walk", "(f) deliberateness shapes a character's path in Director's walk (REVIVE;DTWALK)"],
  ["tend", "(c) a character's tendencies feed the best-when scores of ways of showing (REVIVE;DTTEND)"],
  ["rhythm", "B.2 (a) a scene's rhythm suggests changes of speed (REVIVE;DTRHYM)"],
];
const ALL = DETAILS.map(([d]) => d);
const only = opt("--only") === null ? [...ALL, "tend-convey"] : opt("--only").split(",").filter(Boolean);
for (const id of only) if (![...ALL, "tend-convey"].includes(id)) throw new Error(`no detail ${id}: known are ${ALL.join(", ")} and tend-convey`);
const DIR = "reports/ext/detail";
const goldenDir = fps === 24 ? `${DIR}/24fps` : DIR;

const read = (path) => readFileSync(path, "utf8");
const t0 = Date.now();
let failures = 0;
function check(what, problem) {
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}: ${problem}`);
  } else console.log(`ok     ${what}`);
}

const reference = {
  film: (scene) => `${fps === 24 ? "reports/film/24fps" : "reports/film"}/${scene}.film.json`,
  glass: (scene) => (fps === 24 ? null : `reports/pass2/${scene}.glass.json`),
  program: (scene) => { if (fps === 24) return null; const [fn1, fn2] = FILE_NAMES[scene].split(" "); return `reports/pass2/ken-${fn1.toLowerCase()}.${fn2.toLowerCase()}`; },
};
const setupWith = (off, convey = false) => (L) => {
  L.evalString(`(setq :detail-off '(${off.join(" ")}))`);
  if (convey) L.evalString("(setq :detail-tendencies-of-convey-methods t)");
};

const each = { about: `Ken's Cinderella with MEND and each of DETAIL's details alone, then with all of them, then with the tendencies given to the convey methods too (tend-convey, a decision for Ken), beside 1978's, chained at ${fps} frames a second (tools/check-detail.mjs): pass 1's CP and the choice points that differ from app/data/pass1.json; for each scene its frames (and 1978's, referenceFrames), the first frame that differs, its events ("same", or how many), its program, the tasks whose current choice differs (now, and as 1978 had it, was), the subscenes whose time, stretch or movements differ, and the notes left, by kind (at 24 frames a second there are no 1978 glass boxes or programs to set beside).`, fps, details: {} };
for (const [id, what] of DETAILS.filter(([d]) => only.includes(d))) {
  const t = Date.now();
  const r = chained({ extensions: ["detail"], setup: setupWith(ALL.filter((d) => d !== id)), fps, reference });
  each.details[id] = { what, ...r };
  console.log(`\n${what} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
  for (const line of describe(r)) console.log(`       ${line}`);
}
if (ALL.every((d) => only.includes(d))) {
  const t = Date.now();
  const r = chained({ extensions: ["detail"], fps, reference, golden: (scene) => `${goldenDir}/${scene}.film.json` });
  each.all = r;
  console.log(`\nAll of them (${((Date.now() - t) / 1000).toFixed(0)}s)`);
  for (const line of describe(r)) console.log(`       ${line}`);
  for (const s of r.scenes) check(`all of them, ${s.scene}: the film as ${goldenDir}/${s.scene}.film.json`, s.filmMatchesGolden === null ? "there is no such file (tools/check-ext.mjs --extensions detail --save makes it)" : s.filmMatchesGolden ? null : "it differs");
}
if (only.includes("tend-convey")) {
  const t = Date.now();
  const r = chained({ extensions: ["detail"], setup: setupWith([], true), fps, reference });
  each.tendConvey = { what: "all of them, and the tendencies given to the convey methods too (:detail-tendencies-of-convey-methods)", ...r };
  console.log(`\nAll of them, and the tendencies given to the convey methods too (${((Date.now() - t) / 1000).toFixed(0)}s)`);
  for (const line of describe(r)) console.log(`       ${line}`);
}

const name = fps === 24 ? "each-24fps.json" : "each.json";
const path = `${DIR}/${name}`;
const text = JSON.stringify(each, null, 1) + "\n";
if (only.length === ALL.length + 1) {
  if (save) {
    mkdirSync(DIR, { recursive: true });
    writeFileSync(path, text);
    console.log(`saved  ${path}`);
  } else check(`what was found as ${path}`, !existsSync(path) ? "there is no such file (make it with --save)" : text === read(path) ? null : "it differs (look at the differences, then make it again with --save)");
}

const total = ((Date.now() - t0) / 1000).toFixed(0);
console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
process.exit(failures ? 1 : 0);
