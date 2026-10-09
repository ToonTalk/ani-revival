// Check that Ani as in 1978 still makes exactly what she made, with or without some of
// the revival's extensions (src/pipeline.js EXTENSIONS) that must not change her
// Cinderella. It runs the whole pipeline on the project's files, as the film page does
// (pass 1, then each scene's pass 2 and filming at 4 frames a second), and asserts:
//   - pass 1 writes CP 29: 102 of 102 choices, each in its place; and its choice
//     points, with their reasons, are those of app/data/pass1.json;
//   - each scene's program (KEN;INTROD UCTION, ...) and summary (KEN1;INTROD MINI, ...)
//     are byte for byte those of reports/pass2/, and its glass box is
//     reports/pass2/<scene>.glass.json (tools/run-pass2.mjs --glass-box);
//   - each scene's film has the frames and events of reports/film/<scene>.film.json
//     (tools/run-scene.mjs --record), and leaves the characters where
//     reports/pass2/ken1-<movie>.posit has them;
//   - each job loads the files it loaded in 1978 mode (reports/loaded-files.json),
//     besides the extensions' own.
// Usage: node tools/check-1978.mjs [--extensions a,b] [--quick] [--save-loads]
//   --quick       skip the filming (each pass 2 starts from reports/pass2's positions)
//   --save-loads  with no extensions, write reports/loaded-files.json from this run
// Prints each check with ok or FAIL and its time; exits non-zero if any fails.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, FILE_NAMES, extensionsFor, pass1, pass2, film } from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";

const args = process.argv.slice(2);
const extAt = args.indexOf("--extensions");
const chosen = extensionsFor(extAt >= 0 ? (args[extAt + 1] || "").split(",").filter(Boolean) : []);
const extensions = chosen.map((e) => e.id);
const quick = args.includes("--quick");
const saveLoads = args.includes("--save-loads");
if (saveLoads && extensions.length) throw new Error("--save-loads records 1978 mode: run it with no extensions");
for (const e of chosen.filter((e) => e.changes1978)) console.log(`note: ${e.id} is meant to change Ken's Cinderella, so this check should fail with it`);
const extensionFiles = new Set(chosen.flatMap((e) => e.files).map((f) => `REVIVE;${f.toUpperCase()}`));

const read = (path) => readFileSync(path, "utf8");
const t0 = Date.now();
let failures = 0;
// One check: problem is null if it passed; seconds, if given, is how long its step took.
function check(what, problem, seconds = null) {
  const time = seconds === null ? "" : ` (${seconds.toFixed(1)}s)`;
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}${time}: ${problem}`);
  } else console.log(`ok     ${what}${time}`);
}
// Run a step, timed. A step that stops ends the check, since the later ones need it.
function run(what, f) {
  const t = Date.now();
  try {
    return { value: f(), seconds: (Date.now() - t) / 1000 };
  } catch (e) {
    check(what, `stopped: ${e.message}${e.where ? ` (at ${e.where})` : ""}`, (Date.now() - t) / 1000);
    return finish();
  }
}
// The first place two texts differ, for a FAIL line.
function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return `they differ at character ${i} of ${a.length} (expected ${b.length}): ${JSON.stringify(a.slice(Math.max(0, i - 30), i + 50))}`;
}
const same = (a, b) => (a === b ? null : firstDifference(a, b));

// The files each job loads (its file system's resolveForLoad, as tools/build-ani-bundle.mjs
// notes them), by job.
const fs = makeProjectFileSystem();
const loads = {};
let job = null;
const resolve = fs.resolveForLoad.bind(fs);
fs.resolveForLoad = (spec, L) => {
  const r = resolve(spec, L);
  if (r && job) (loads[job] ||= new Set()).add(`${r.truename.dir};${r.truename.fn1} ${r.truename.fn2}`);
  return r;
};
const loadsGolden = existsSync("reports/loaded-files.json") ? JSON.parse(read("reports/loaded-files.json")).jobs : null;
function checkLoads(name) {
  const all = [...(loads[name] || [])];
  const isExtension = (f) => extensionFiles.has(f.slice(0, f.lastIndexOf(" ")));
  const ours = all.filter((f) => !isExtension(f)).sort();
  if (extensionFiles.size) {
    const missing = [...extensionFiles].filter((x) => !all.some((f) => f.startsWith(`${x} `)));
    check(`${name}: the extensions' ${extensionFiles.size} file${extensionFiles.size > 1 ? "s" : ""} loaded`, missing.length ? `did not load ${missing.join(", ")}` : null);
  }
  if (saveLoads) return;
  if (!loadsGolden || !loadsGolden[name]) return check(`${name}: the files loaded`, "reports/loaded-files.json has no list for it (make one with --save-loads)");
  const golden = loadsGolden[name];
  const extra = ours.filter((f) => !golden.includes(f));
  const missing = golden.filter((f) => !ours.includes(f));
  const problems = [extra.length ? `also loaded ${extra.join(", ")}` : "", missing.length ? `did not load ${missing.join(", ")}` : ""].filter(Boolean);
  check(`${name}: the same ${golden.length} files loaded as in 1978 mode`, problems.join("; ") || null);
}

function finish() {
  if (saveLoads) {
    const jobs = {};
    for (const [name, set] of Object.entries(loads)) jobs[name] = [...set].sort();
    const old = loadsGolden || {};
    const text = JSON.stringify({ about: "The files each job of Ani's pipeline loads in 1978 mode (tools/check-1978.mjs --save-loads).", jobs: { ...old, ...jobs } }, null, 1);
    writeFileSync("reports/loaded-files.json", text + "\n");
    console.log(`wrote reports/loaded-files.json (${Object.keys(jobs).length} jobs)`);
  }
  const total = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
  process.exit(failures ? 1 : 0);
}

console.log(`Ani as in 1978${extensions.length ? `, with the extensions ${extensions.join(", ")} (REVIVE;${[...extensionFiles].map((f) => f.slice(7)).join(", REVIVE;")})` : ""}${quick ? ", without filming" : ""}\n`);

// ---------------------------------------------------------------- pass 1
job = "pass1";
const p1 = run("pass 1", () => pass1(fs, { extensions }));
{
  const cp = fs.find({ dir: "KEN", fn1: "CP", fn2: "30" });
  const ours = cp ? choicesOfText(fs.textOf(cp), "KEN;CP 30") : new Map();
  const theirs = choicesOfItsFile("original/7005017/cp.29");
  const c = compareChoices(theirs, ours);
  const a = [...theirs.keys()], b = [...ours.keys()];
  const inPlace = a.filter((k, i) => b[i] === k).length;
  const good = c.same === theirs.size && ours.size === theirs.size && inPlace === a.length;
  check(`pass 1: ${c.same} of ${theirs.size} choices as CP 29, ${inPlace} in place`,
    good ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra`, p1.seconds);
  const golden = JSON.parse(read("app/data/pass1.json")).choicePoints;
  check("pass 1: the choice points and their reasons as app/data/pass1.json has them", same(JSON.stringify(p1.value.choicePoints), JSON.stringify(golden)));
}
checkLoads("pass1");

// With --quick, each pass 2 starts from where the 1978 run's filming left the
// characters (tools/run-scene.mjs copied each POSIT file to reports/pass2/).
if (quick) {
  for (const f of readdirSync("reports/pass2")) {
    const m = /^ken1-([a-z0-9]+)\.posit$/.exec(f);
    if (m) fs.addFile("KEN1", m[1].toUpperCase(), "POSIT", { text: read(`reports/pass2/${f}`), origin: "reports/pass2" });
  }
}

// ---------------------------------------------------------------- each scene
for (const scene of SCENES) {
  const [fn1, fn2] = FILE_NAMES[scene].split(" ");
  job = `pass2 ${scene}`;
  const p2 = run(`${scene}: pass 2`, () => pass2(fs, scene, { extensions }));
  const text = (dir, a, b) => {
    const e = fs.find({ dir, fn1: a, fn2: b });
    return e ? fs.textOf(e) : "";
  };
  check(`${scene}: pass 2's KEN;${fn1} ${fn2} as reports/pass2`,
    same(text("KEN", fn1, fn2), read(`reports/pass2/ken-${fn1.toLowerCase()}.${fn2.toLowerCase()}`)), p2.seconds);
  check(`${scene}: pass 2's KEN1;${fn1} MINI as reports/pass2`,
    same(text("KEN1", fn1, "MINI"), read(`reports/pass2/ken1-${fn1.toLowerCase()}.mini`)));
  check(`${scene}: the glass box as reports/pass2/${scene}.glass.json`,
    same(JSON.stringify(p2.value.glass, null, 1), read(`reports/pass2/${scene}.glass.json`)));
  checkLoads(job);
  if (quick) continue;

  job = `film ${scene}`;
  const f = run(`${scene}: filming`, () => film(fs, scene, { extensions }));
  const golden = JSON.parse(read(`reports/film/${scene}.film.json`));
  const ours = f.value.film;
  check(`${scene}: ${ours.frames.length} frames as reports/film/${scene}.film.json (${golden.frames.length})`,
    same(JSON.stringify(ours.frames), JSON.stringify(golden.frames)), f.seconds);
  check(`${scene}: the ${ours.events.length} events as reports/film`, same(JSON.stringify(ours.events), JSON.stringify(golden.events)));
  check(`${scene}: the picture as reports/film`, same(JSON.stringify(ours.picture), JSON.stringify(golden.picture)));
  const movie = f.value.lisp.print(f.value.lisp.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
  check(`${scene}: KEN1;${movie.toUpperCase()} POSIT as reports/pass2`, same(text("KEN1", movie.toUpperCase(), "POSIT"), read(`reports/pass2/ken1-${movie}.posit`)));
  checkLoads(job);
}
finish();
