// Check that Ani as in 1978 still makes exactly what she made, with or without some of
// the revival's extensions (src/pipeline.js EXTENSIONS) that must not change her
// Cinderella. It runs the whole pipeline on the project's files, as the film page does
// (pass 1, then each scene's pass 2 and filming at 4 frames a second), and asserts:
//   - pass 1 writes KEN;CP 30: CP 29's 102 choices, each in its place, and byte for
//     byte as reports/pass1-choices.txt has CP 29's content as our pass 1 writes it;
//     and its choice points, with their reasons, are those of app/data/pass1.json;
//   - tools/run-pass1.mjs --glass-box --save --save-all, the way pass 1's goldens are
//     made (each attempt at a choice recorded, every choice point saved with its
//     reasons), run alongside in a process of its own, writes app/data/pass1.json (its
//     story, attempts and choice points), reports/pass1-choices.txt and
//     reports/pass1-reasons.txt as they are;
//   - each scene's program (KEN;INTROD UCTION, ...), summary (KEN1;INTROD MINI, ...) and
//     printout (KEN1;INTROD PRINT, ...) are byte for byte those of reports/pass2/, and
//     its glass box is reports/pass2/<scene>.glass.json (tools/run-pass2.mjs --glass-box);
//   - each scene's film has the frames and events of reports/film/<scene>.film.json
//     (tools/run-scene.mjs --record), and leaves the characters where
//     reports/pass2/ken1-<movie>.posit has them;
//   - each job loads the files it loaded in 1978 mode, in the same order, as often
//     (reports/loaded-files.json), besides the extensions' own;
//   - with extensions, no job leaves a repair note: not pass 1, not pass 2 (its glass
//     box), not the filming.
// Usage: node tools/check-1978.mjs [--extensions a,b] [--quick] [--fps 24] [--save-loads]
//   --quick       skip the filming (each pass 2 starts from reports/pass2's positions)
//   --fps 24      film at 24 frames a second, as the film was shot, and check each
//                 scene's glass box, frames and events against reports/film/24fps
//                 (tools/run-film.mjs --fps 24) instead. Each scene after the first is
//                 then planned from where the 24-frames run left the characters, so its
//                 files are not reports/pass2's, and only its glass box is checked. About
//                 15 minutes, for occasional use.
//   --save-loads  with no extensions, write reports/loaded-files.json from this run
// Prints each check with ok or FAIL and its time; exits non-zero if any fails.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdtempSync, openSync, closeSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, FILE_NAMES, extensionsFor, pass1, pass2, film } from "../src/pipeline.js";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const chosen = extensionsFor((opt("--extensions") || "").split(",").filter(Boolean));
const extensions = chosen.map((e) => e.id);
const quick = args.includes("--quick");
const fps = opt("--fps") === null ? 4 : Number(opt("--fps"));
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24, the two frame rates with goldens (reports/film, reports/film/24fps)");
if (fps === 24 && quick) throw new Error("--quick skips the filming, so --fps 24 would check nothing");
// as tools/run-film.mjs films at 24: a scene takes six times the frames it takes at 4
const frames = fps === 24 ? 6000 : 1000;
const saveLoads = args.includes("--save-loads");
if (saveLoads && (extensions.length || fps !== 4)) throw new Error("--save-loads records 1978 mode at 4 frames a second: run it with no extensions and no --fps");
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
// A file's text, or "" if there is none, so that a missing file is a difference.
const textIn = (fs, dir, fn1, fn2) => {
  const e = fs.find({ dir, fn1, fn2 });
  return e ? fs.textOf(e) : "";
};

// The files each job loads (its file system's resolveForLoad, as tools/build-ani-bundle.mjs
// notes them), by job: every load, in order.
const fs = makeProjectFileSystem();
const loads = {};
let job = null;
const resolve = fs.resolveForLoad.bind(fs);
fs.resolveForLoad = (spec, L) => {
  const r = resolve(spec, L);
  if (r && job) (loads[job] ||= []).push(`${r.truename.dir};${r.truename.fn1} ${r.truename.fn2}`);
  return r;
};
const loadsGolden = existsSync("reports/loaded-files.json") ? JSON.parse(read("reports/loaded-files.json")).jobs : null;
// Where a job's loads part from 1978 mode's: files it loaded that 1978 mode didn't and
// the other way round, or else the first load out of order (or loaded again, or not).
function loadDifference(ours, golden) {
  const extra = [...new Set(ours.filter((f) => !golden.includes(f)))];
  const missing = [...new Set(golden.filter((f) => !ours.includes(f)))];
  const problems = [extra.length ? `also loaded ${extra.join(", ")}` : "", missing.length ? `did not load ${missing.join(", ")}` : ""].filter(Boolean);
  if (problems.length) return problems.join("; ");
  let i = 0;
  while (i < ours.length && i < golden.length && ours[i] === golden[i]) i++;
  if (i === ours.length && i === golden.length) return null;
  return `load ${i + 1} was ${ours[i] || "none"}, where 1978 mode's was ${golden[i] || "none"}`;
}
function checkLoads(name) {
  const all = loads[name] || [];
  const isExtension = (f) => extensionFiles.has(f.slice(0, f.lastIndexOf(" ")));
  const ours = all.filter((f) => !isExtension(f));
  if (extensionFiles.size) {
    const missing = [...extensionFiles].filter((x) => !all.some((f) => f.startsWith(`${x} `)));
    check(`${name}: the extensions' ${extensionFiles.size} file${extensionFiles.size > 1 ? "s" : ""} loaded`, missing.length ? `did not load ${missing.join(", ")}` : null);
  }
  if (saveLoads) return;
  if (!loadsGolden || !loadsGolden[name]) return check(`${name}: the files loaded`, "reports/loaded-files.json has no list for it (make one with --save-loads)");
  const golden = loadsGolden[name];
  check(`${name}: the same ${golden.length} loads as in 1978 mode, in the same order`, loadDifference(ours, golden));
}
// With extensions, Cinderella needs no repairs: any note left is a failure.
function checkNoNotes(what, notes) {
  if (!extensions.length) return;
  check(`${what}: no repair notes`, notes.length ? `${notes.length}, the first ${JSON.stringify(notes[0])}` : null);
}

// ---------------------------------------------------------------- run-pass1, alongside
// tools/run-pass1.mjs makes pass 1's goldens: run it so, into a folder of the system's
// temporary files, in a process of its own while this one runs the pipeline.
const p1Dir = mkdtempSync(join(tmpdir(), "ani-check-1978-"));
const p1LogPath = join(p1Dir, "run-pass1.log");
const p1Log = openSync(p1LogPath, "w");
const p1Child = spawn(process.execPath, [fileURLToPath(new URL("./run-pass1.mjs", import.meta.url)), "--glass-box", "--save", "--save-all", "--no-backtrace",
  "--out", p1Dir, ...(extensions.length ? ["--extensions", extensions.join(",")] : [])], { cwd: process.cwd(), stdio: ["ignore", p1Log, p1Log] });
closeSync(p1Log); // the child has its own
const p1Done = new Promise((done) => {
  p1Child.on("exit", (code, signal) => done({ code, signal }));
  p1Child.on("error", (e) => done({ code: null, error: e.message }));
});

function finish() {
  if (p1Child.exitCode === null) p1Child.kill();
  if (saveLoads) {
    const old = loadsGolden || {};
    const text = JSON.stringify({ about: "The files each job of Ani's pipeline loads in 1978 mode, in the order it loads them, each time it loads one (tools/check-1978.mjs --save-loads).", jobs: { ...old, ...loads } }, null, 1);
    writeFileSync("reports/loaded-files.json", text + "\n");
    console.log(`wrote reports/loaded-files.json (${Object.keys(loads).length} jobs)`);
  }
  const total = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
  process.exit(failures ? 1 : 0);
}

console.log(`Ani as in 1978${extensions.length ? `, with the extensions ${extensions.join(", ")} (REVIVE;${[...extensionFiles].map((f) => f.slice(7)).join(", REVIVE;")})` : ""}${quick ? ", without filming" : fps === 24 ? ", filmed at 24 frames a second" : ""}\n`);

// ---------------------------------------------------------------- pass 1
job = "pass1";
const p1 = run("pass 1", () => pass1(fs, { extensions }));
{
  const cp = textIn(fs, "KEN", "CP", "30");
  const ours = cp ? choicesOfText(cp, "KEN;CP 30") : new Map();
  const theirs = choicesOfItsFile("original/7005017/cp.29");
  const c = compareChoices(theirs, ours);
  const a = [...theirs.keys()], b = [...ours.keys()];
  const inPlace = a.filter((k, i) => b[i] === k).length;
  const good = c.same === theirs.size && ours.size === theirs.size && inPlace === a.length;
  check(`pass 1: ${c.same} of ${theirs.size} choices as CP 29, ${inPlace} in place`,
    good ? null : `${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra`, p1.seconds);
  check("pass 1: KEN;CP 30 as reports/pass1-choices.txt", same(cp, read("reports/pass1-choices.txt")));
  const golden = JSON.parse(read("app/data/pass1.json")).choicePoints;
  check("pass 1: the choice points and their reasons as app/data/pass1.json has them", same(JSON.stringify(p1.value.choicePoints), JSON.stringify(golden)));
  // notes on choice points are in their reasons; pass 1's repairs has those on other
  // actors too (REVIVE;MEND8's on a comparison)
  checkNoNotes("pass 1", p1.value.repairs || []);
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
  const lower = fn1.toLowerCase();
  job = `pass2 ${scene}`;
  const p2 = run(`${scene}: pass 2`, () => pass2(fs, scene, { extensions }));
  if (fps === 4) {
    check(`${scene}: pass 2's KEN;${fn1} ${fn2} as reports/pass2`, same(textIn(fs, "KEN", fn1, fn2), read(`reports/pass2/ken-${lower}.${fn2.toLowerCase()}`)), p2.seconds);
    check(`${scene}: pass 2's KEN1;${fn1} MINI as reports/pass2`, same(textIn(fs, "KEN1", fn1, "MINI"), read(`reports/pass2/ken1-${lower}.mini`)));
    check(`${scene}: pass 2's KEN1;${fn1} PRINT as reports/pass2`, same(textIn(fs, "KEN1", fn1, "PRINT"), read(`reports/pass2/ken1-${lower}.print`)));
    check(`${scene}: the glass box as reports/pass2/${scene}.glass.json`, same(JSON.stringify(p2.value.glass, null, 1), read(`reports/pass2/${scene}.glass.json`)));
  } else {
    // tools/run-film.mjs saves each glass box as it is, on one line
    check(`${scene}: the glass box as reports/film/24fps/${scene}.glass.json`, same(JSON.stringify(p2.value.glass), read(`reports/film/24fps/${scene}.glass.json`)), p2.seconds);
  }
  checkLoads(job);
  const notes = [...(p2.value.glass.repairs || [])];
  if (quick) {
    checkNoNotes(`${scene}: pass 2`, notes);
    continue;
  }

  job = `film ${scene}`;
  const f = run(`${scene}: filming`, () => film(fs, scene, { extensions, fps, frames }));
  const goldenPath = `${fps === 24 ? "reports/film/24fps" : "reports/film"}/${scene}.film.json`;
  const golden = JSON.parse(read(goldenPath));
  const ours = f.value.film;
  check(`${scene}: ${ours.frames.length} frames as ${goldenPath} (${golden.frames.length})`,
    same(JSON.stringify(ours.frames), JSON.stringify(golden.frames)), f.seconds);
  check(`${scene}: the ${ours.events.length} events as ${goldenPath}`, same(JSON.stringify(ours.events), JSON.stringify(golden.events)));
  check(`${scene}: the picture as ${goldenPath}`, same(JSON.stringify(ours.picture), JSON.stringify(golden.picture)));
  if (fps === 4) {
    const movie = f.value.lisp.print(f.value.lisp.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
    check(`${scene}: KEN1;${movie.toUpperCase()} POSIT as reports/pass2`, same(textIn(fs, "KEN1", movie.toUpperCase(), "POSIT"), read(`reports/pass2/ken1-${movie}.posit`)));
  }
  checkLoads(job);
  // the notes left while filming (src/pipeline.js film), after pass 2's
  checkNoNotes(`${scene}: pass 2 and filming`, [...notes, ...(ours.repairs || [])]);
}

// ---------------------------------------------------------------- pass 1's goldens
// what tools/run-pass1.mjs wrote, running alongside
{
  job = null;
  const r = await p1Done;
  const ran = r.code === 0;
  check("tools/run-pass1.mjs: CP 29's choices, each in its place", ran ? null : `${r.error || `it exited with ${r.code}${r.signal ? ` (${r.signal})` : ""}`}; see ${p1LogPath}`);
  const written = (name) => (existsSync(join(p1Dir, name)) ? read(join(p1Dir, name)) : "");
  check("tools/run-pass1.mjs: the choices as reports/pass1-choices.txt", same(written("pass1-choices.txt"), read("reports/pass1-choices.txt")));
  check("tools/run-pass1.mjs: every choice point with its reasons as reports/pass1-reasons.txt", same(written("pass1-reasons.txt"), read("reports/pass1-reasons.txt")));
  // its about says which extensions it ran with; the rest is the glass box
  const data = JSON.parse(written("pass1.json") || "{}");
  const golden = JSON.parse(read("app/data/pass1.json"));
  for (const [key, what] of [["cp29", "CP 29's choices"], ["story", "the story"], ["attempts", `the ${golden.attempts.length} attempts at a choice`], ["choicePoints", "the choice points and their reasons"]]) {
    check(`tools/run-pass1.mjs: ${what} as app/data/pass1.json has them`, same(JSON.stringify(data[key]) || "", JSON.stringify(golden[key])));
  }
  if (!failures) rmSync(p1Dir, { recursive: true, force: true });
}
finish();
