// SLIPS (src/director/revive/slips*.lisp), corrections of slips in Ken's files, one at
// a time: what each changes in Ken's Cinderella, for the written diff each comes with
// (Ken's decision 2 of 9 October, reports/chapter-x/PLAN.md), and the run that confirms
// the DICHAR/DISPLY speed inversion before S9 corrects it. Two parts, both by default:
//   --speed  Ken's Cinderella as in 1978 (no extensions), filmed: for every gradual
//            change Director runs (dichar.103:102-121), the ticks DICHAR gives it, the
//            time DISPLY's estimate gave it (disply.311:1098-1110), as ticks, their
//            ratio, and the frame the factor the change grows last changed; then the
//            same with SLIPS, where each change takes the ticks of its estimate. Checks
//            that in 1978 every change at high speed takes about four times its
//            estimate, every one at low speed about a quarter, and every one at medium
//            about its estimate (rounding to whole ticks), which is what confirms the
//            inversion; and that with SLIPS every change takes its estimate.
//   --each   the chained film (pass 1, then each scene's pass 2 and filming, as the film
//            page makes it) with KNOW and one correction of SLIPS's (the others turned
//            off with :slips-off, REVIVE;SLIPS), for each correction, and with all of
//            them: each set beside KNOW's own (reports/ext/know/, or its 24fps/): pass
//            1's choices and choice points that differ, and for each scene its frames,
//            the first frame that differs, its events, its program, its tasks whose
//            current choice differs, its subscenes whose time differs, and the notes
//            left, by kind. Checks that the set with all of them makes the goldens of
//            reports/ext/slips/ (tools/check-ext.mjs --extensions slips checks them file
//            by file).
// Usage: node tools/check-slips.mjs [--speed] [--each] [--only s1,s9] [--fps 24] [--save]
//   --only   only these corrections, with --each
//   --fps 24 film at 24 frames a second (--each against reports/ext/know/24fps)
//   --save   write what was found to reports/ext/slips/speed.json and each.json (or
//            each-24fps.json), which reports/ext/slips/README.md quotes, instead of
//            comparing with them
// Prints each check with ok or FAIL; exits non-zero if any fails.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { SCENES, FILE_NAMES, pass1, pass2, film } from "../src/pipeline.js";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const fps = opt("--fps") === null ? 4 : Number(opt("--fps"));
if (fps !== 4 && fps !== 24) throw new Error("--fps is 4 (the default) or 24");
const frames = fps === 24 ? 6000 : 1000;
const save = args.includes("--save");
const doSpeed = args.includes("--speed") || !args.includes("--each");
const doEach = args.includes("--each") || !args.includes("--speed");
// The corrections, as REVIVE;SLIPS names them for :slips-off.
const CORRECTIONS = [
  ["s1", "S1 and S2: is-not looks in the task's scene; is-described-as is a preference"],
  ["s3", "S3: friendly's attractions named as the elements are"],
  ["s6", "S6: a method's prerequisites read under the name they are kept by"],
  ["s7", "S7: MIDDLE compares itself with (not bottom)"],
  ["s8", "S8: a character's dynamics take their parent's factors once"],
  ["s9", "S9: a gradual change runs at the speed DISPLY estimates it at"],
  ["s10", "S10: a gradual change grows a factor once a tick"],
  ["s11", "S11: a gradual change takes as many steps as it counts"],
];
const only = opt("--only") === null ? CORRECTIONS.map(([id]) => id) : opt("--only").split(",").filter(Boolean);
for (const id of only) if (!CORRECTIONS.some(([c]) => c === id)) throw new Error(`no correction ${id}: known are ${CORRECTIONS.map(([c]) => c).join(", ")}`);
const DIR = "reports/ext/slips";
const knowDir = fps === 24 ? "reports/ext/know/24fps" : "reports/ext/know";
const slipsDir = fps === 24 ? `${DIR}/24fps` : DIR;

const read = (path) => readFileSync(path, "utf8");
const t0 = Date.now();
let failures = 0;
function check(what, problem) {
  if (problem) {
    failures++;
    console.log(`FAIL   ${what}: ${problem}`);
  } else console.log(`ok     ${what}`);
}
const textIn = (fs, d, fn1, fn2) => {
  const e = fs.find({ dir: d, fn1, fn2 });
  return e ? fs.textOf(e) : "";
};
const kindOf = (note) => (/^\(revival-repair: what (\S+)/.exec(note) || [])[1];
const kinds = (notes) => {
  const out = {};
  for (const n of notes) out[kindOf(n.note)] = (out[kindOf(n.note)] || 0) + 1;
  return out;
};
// What was found, compared with or saved as a JSON file of reports/ext/slips.
function report(name, value) {
  const path = `${DIR}/${name}`;
  const text = JSON.stringify(value, null, 1) + "\n";
  if (save) {
    mkdirSync(DIR, { recursive: true });
    writeFileSync(path, text);
    return console.log(`saved  ${path}`);
  }
  check(`what was found as ${path}`, !existsSync(path) ? "there is no such file (make it with --save)" : text === read(path) ? null : "it differs (look at the differences, then make it again with --save)");
}

// ---------------------------------------------------------------- the speed
// The changes Director runs, as a film's setup records them: an extension of Ken's
// gradual change (installed after DICHAR, before his receiver) that notes each one, and
// a click handler that reads the factor each grows, frame by frame.
const WEIGHT = { low: 0.5, short: 0.5, medium: 1, high: 2, long: 2 };
function speedRun(extensions) {
  const fs = makeProjectFileSystem();
  pass1(fs, { extensions });
  const setup = (L) => {
    L.evalString("(setq :speed-check nil)");
    L.evalString(`(defun speed-check-install () (let ((:insert-methods-at-end nil))
       (define-extension-method (gradually change by ?factor factor for ?element at ?speed speed %followup) director-character
         (setq :speed-check (cons (list (ask movie ask your current-movie to recall your frame-count) :self element factor speed
                                        :frames-per-second :ticks-per-frame (ask dynamic-constants recall your time-to-grow-e-times)
                                        (ask :self recall your special-dynamics-for-current-scene))
                                  :speed-check))
         (ask-old :self gradually change by ,factor factor for ,element at ,speed speed !,followup))))`);
    L.evalString("(+after-load '|ken;dichar >| '(speed-check-install))");
  };
  const out = [];
  for (const scene of SCENES) {
    pass2(fs, scene, { extensions });
    let watch = [];
    const values = [];
    const onClick = (frame, L) => {
      const known = L.toArray(L.evalString(":speed-check"));
      if (known.length > watch.length) {
        watch = known.slice().reverse().map((x) => {
          const [f, who, element, factor, speed, fpsL, tpf, tge, sd] = L.toArray(x);
          return { frame: f, who: L.print(who).toLowerCase(), element: L.print(element).toLowerCase(), factor: L.num.val(factor), speed: L.print(speed).toLowerCase(), fps: L.num.val(fpsL), tpf: L.num.val(tpf), tge: L.num.val(tge), sd };
        });
      }
      values[frame] = watch.map((w) => {
        L.intern("*SPEED-CHECK-SD*").value = w.sd;
        const v = L.evalString(`(ask ,*speed-check-sd* recall your (${w.element} factor))`);
        return v === L.NIL ? 1 : L.num.val(v);
      });
    };
    const f = film(fs, scene, { extensions, fps, frames, setup, onClick }).film;
    for (const [k, w] of watch.entries()) {
      // Ken's ticks (dichar.103:105-117) and DISPLY's estimate (disply.311:1104-1107)
      const kensTicks = Math.round(w.tge * WEIGHT[w.speed] * w.fps * w.tpf * Math.abs(Math.log(w.factor)));
      const estimate = (w.tge / WEIGHT[w.speed]) * Math.abs(Math.log(w.factor));
      let last = null;
      for (let fr = w.frame + 1; fr < values.length; fr++) if (values[fr] && values[fr - 1] && values[fr][k] !== values[fr - 1][k]) last = fr;
      const end = values.length ? values[values.length - 1][k] : null;
      out.push({
        scene, frame: w.frame, character: w.who, element: w.element, factor: Math.round(w.factor * 1e6) / 1e6, speed: w.speed,
        directorTicks: kensTicks, estimateSeconds: Math.round(estimate * 1e4) / 1e4, estimateTicks: Math.round(estimate * w.fps * w.tpf * 100) / 100,
        ratio: Math.round((kensTicks / (estimate * w.fps * w.tpf)) * 100) / 100,
        lastChangedAt: last, factorAtTheEnd: end === null ? null : Math.round(end * 1e4) / 1e4, filmFrames: f.frames.length,
      });
    }
  }
  return out;
}

const found = {};
if (doSpeed) {
  console.log(`The speed of a gradual change, at ${fps} frames a second: Ken's Cinderella as in 1978\n`);
  const kens = speedRun([]);
  for (const c of kens) console.log(`       ${c.scene} frame ${c.frame}: ${c.character} ${c.element} by ${c.factor} at ${c.speed} speed: Director ${c.directorTicks} ticks, DISPLY's estimate ${c.estimateSeconds} s = ${c.estimateTicks} ticks, ratio ${c.ratio}; the factor last changed at frame ${c.lastChangedAt}, ${c.factorAtTheEnd} at the end (${c.filmFrames} frames)`);
  // at medium, rounding to whole ticks; a change of a tick or two rounds furthest
  const near = (r, want) => Math.abs(r - want) <= want * 0.25 + 0.1;
  for (const [speed, want] of [["high", 4], ["low", 0.25], ["medium", 1]]) {
    const these = kens.filter((c) => c.speed === speed);
    check(`1978: the ${these.length} changes at ${speed} speed take ${want === 1 ? "about their estimate" : `about ${want === 4 ? "four times" : "a quarter of"} their estimate`} (ratios ${[...new Set(these.map((c) => c.ratio))].join(", ")})`,
      !these.length ? "there are none" : these.every((c) => near(c.ratio, want)) ? null : "not all");
  }
  // with SLIPS (S9), each takes its estimate: Director's ticks are those of its estimate
  console.log(`\nThe same with SLIPS (and KNOW, which it requires)\n`);
  const slips = speedRun(["slips"]);
  for (const c of slips) console.log(`       ${c.scene} frame ${c.frame}: ${c.character} ${c.element} by ${c.factor} at ${c.speed} speed: estimate ${c.estimateTicks} ticks; the factor last changed at frame ${c.lastChangedAt}, ${c.factorAtTheEnd} at the end`);
  // the corrected change counts round(estimate in ticks) steps, and takes them from the
  // frame it begins: its factor's last step is that many ticks on (one a tick, at 4
  // frames a second a tick a frame); a change of no steps changes nothing
  if (fps === 4) {
    const off = slips.filter((c) => Math.round(c.estimateTicks) > 0 && c.lastChangedAt !== null && c.lastChangedAt < c.filmFrames - 1 && Math.abs(c.lastChangedAt - c.frame - Math.round(c.estimateTicks)) > 1);
    check(`SLIPS: each of the ${slips.length} changes grows its factor for the ticks of its estimate, where the film runs that long`, off.length ? `${off.length}, the first ${JSON.stringify(off[0])}` : null);
  }
  found.speed = { about: "Every gradual change Director runs in Ken's Cinderella (dichar.103:102-121), filmed as in 1978 and with SLIPS: the ticks DICHAR gives it (as in 1978), DISPLY's estimate (disply.311:1104-1107) in seconds and ticks, their ratio, the frame its factor last changed and the factor then (tools/check-slips.mjs --speed).", fps, kens, slips };
}

// ---------------------------------------------------------------- each correction
// The chained film with these corrections off, beside KNOW's goldens.
function chained(off) {
  const fs = makeProjectFileSystem();
  const setup = (L) => L.evalString(`(setq :slips-off '(${off.join(" ")}))`);
  const extensions = ["slips"];
  const p1 = pass1(fs, { extensions, setup });
  const cp = textIn(fs, "KEN", "CP", "30");
  const goldenCPs = JSON.parse(read("app/data/pass1.json")).choicePoints;
  const differentCPs = p1.choicePoints.filter((c, k) => JSON.stringify(c) !== JSON.stringify(goldenCPs[k])).map((c) => c.name);
  const result = {
    pass1: { cp: cp === read("reports/pass1-choices.txt") ? "CP 29" : "differs", choicePointsDiffering: differentCPs, notes: kinds(p1.repairs || []) },
    scenes: [],
  };
  for (const scene of SCENES) {
    const [fn1, fn2] = FILE_NAMES[scene].split(" ");
    const lower = fn1.toLowerCase();
    const { glass } = pass2(fs, scene, { extensions, setup });
    const f = film(fs, scene, { extensions, fps, frames, setup }).film;
    const golden = JSON.parse(read(`${knowDir}/${scene}.film.json`));
    const goldenGlass = JSON.parse(read(`${knowDir}/${scene}.glass.json`));
    let first = null;
    for (let i = 0; i < Math.max(f.frames.length, golden.frames.length); i++) if (JSON.stringify(f.frames[i]) !== JSON.stringify(golden.frames[i])) { first = i; break; }
    const byName = (xs) => new Map(xs.map((x) => [x.name, x]));
    const theirs = byName(goldenGlass.tasks);
    const tasks = glass.tasks.filter((t) => !theirs.has(t.name) || theirs.get(t.name).variables["current-choice"] !== t.variables["current-choice"] || theirs.get(t.name).variables.task !== t.variables.task)
      .map((t) => ({ task: t.name, description: t.variables.task, now: t.variables["current-choice"] || null, was: theirs.has(t.name) ? theirs.get(t.name).variables["current-choice"] || null : null }));
    const theirSubscenes = byName(goldenGlass.subscenes);
    const subscenes = glass.subscenes.filter((s) => !theirSubscenes.has(s.name) || ["running-time", "stretched-by", "movements"].some((v) => theirSubscenes.get(s.name).variables[v] !== s.variables[v]))
      .map((s) => ({ subscene: s.name, runningTime: s.variables["running-time"], stretchedBy: s.variables["stretched-by"], was: theirSubscenes.has(s.name) ? { runningTime: theirSubscenes.get(s.name).variables["running-time"], stretchedBy: theirSubscenes.get(s.name).variables["stretched-by"] } : null }));
    result.scenes.push({
      scene, frames: f.frames.length, knowFrames: golden.frames.length, firstFrameDiffering: first,
      events: JSON.stringify(f.events) === JSON.stringify(golden.events) ? "same" : f.events.length,
      program: textIn(fs, "KEN", fn1, fn2) === read(`${knowDir}/ken-${lower}.${fn2.toLowerCase()}`) ? "same" : "differs",
      tasks, subscenes, notes: kinds([...(glass.repairs || []), ...(f.repairs || [])]),
      ...(off.length ? {} : { filmMatchesGolden: existsSync(`${slipsDir}/${scene}.film.json`) ? JSON.stringify(f) === read(`${slipsDir}/${scene}.film.json`) : null }),
    });
  }
  return result;
}

if (doEach) {
  const each = { about: `Ken's Cinderella with KNOW and each correction of SLIPS alone, then with all of them, beside KNOW's (${knowDir}), chained at ${fps} frames a second (tools/check-slips.mjs --each): pass 1's CP and the choice points that differ from app/data/pass1.json; for each scene its frames (and KNOW's), the first frame that differs, its events ("same", or how many), its program, the tasks whose current choice differs (now and as KNOW had it), the subscenes whose time, stretch or movements differ, and the notes left, by kind.`, fps, corrections: {} };
  for (const [id, what] of CORRECTIONS.filter(([c]) => only.includes(c))) {
    const t = Date.now();
    const r = chained(CORRECTIONS.map(([c]) => c).filter((c) => c !== id));
    each.corrections[id] = { what, ...r };
    console.log(`\n${what} (${((Date.now() - t) / 1000).toFixed(0)}s)\n       pass 1: ${r.pass1.cp}, ${r.pass1.choicePointsDiffering.length} choice points differ, notes ${JSON.stringify(r.pass1.notes)}`);
    for (const s of r.scenes) console.log(`       ${s.scene}: ${s.frames} frames (KNOW ${s.knowFrames}), ${s.firstFrameDiffering === null ? "the same frames" : `differ from frame ${s.firstFrameDiffering}`}, events ${s.events}, program ${s.program}, ${s.tasks.length} tasks and ${s.subscenes.length} subscenes differ, notes ${JSON.stringify(s.notes)}`);
  }
  if (only.length === CORRECTIONS.length) {
    const t = Date.now();
    const r = chained([]);
    each.all = r;
    console.log(`\nAll of them (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    for (const s of r.scenes) {
      console.log(`       ${s.scene}: ${s.frames} frames (KNOW ${s.knowFrames}), notes ${JSON.stringify(s.notes)}`);
      check(`all of them, ${s.scene}: the film as ${slipsDir}/${s.scene}.film.json`, s.filmMatchesGolden === null ? "there is no such file (tools/check-ext.mjs --extensions slips --save makes it)" : s.filmMatchesGolden ? null : "it differs");
    }
  }
  report(fps === 24 ? "each-24fps.json" : "each.json", each);
}
if (doSpeed) report(fps === 24 ? "speed-24fps.json" : "speed.json", found.speed);

const total = ((Date.now() - t0) / 1000).toFixed(0);
console.log(failures ? `\n${failures} check${failures > 1 ? "s" : ""} FAILED (${total} s)` : `\nall checks ok (${total} s)`);
process.exit(failures ? 1 : 0);
