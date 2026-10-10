// Make the film of any film description, the way the page's "Make the film" does
// (src/pipeline.js's makeFilm with keepGoing: pass 1, then each scene's pass 2 and
// filming, a scene that fails reported and the next one tried), and say what happened
// at each step: ok or FAILED, how many frames each scene filmed and whether it hit the
// cap (a scene that never ends), the error and the first lines of Lisp's backtrace, and
// any repair notes the revival's extensions left in the glass box or while filming.
// Pass 1's choices that pass 2 can't use as they are, (not X) and none, are listed, and
// apart from them those it never reads (a none on an attraction).
// Usage: node tools/run-story.mjs <story.lisp> [--extensions a,b] [--frames 600] [--fps 4]
//                                  [--scenes s1,s2] [--out file.json] [--no-backtrace]
//   --extensions  the revival's extensions to load (src/pipeline.js EXTENSIONS); none
//                 by default, which is Ani as in 1978
//   --frames      the most frames a scene is filmed for: 600, as the page films at 4
//                 frames a second (two and a half minutes; Ken's runs stopped at 1,000)
//   --scenes      make only these scenes (pass 1 always runs)
//   --out         also write what happened as JSON
//   --no-backtrace  a step that fails is not run again for its backtrace
// A failed step is run again, on the same files, with Lisp's backtrace on (makeFilm runs
// without one, as the page does, since it costs time). Exits 1 if any step failed or
// any scene never ended.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { makeFilmSteps, storyOutline, storyPlan, pass1, pass2, film, isAppearanceChoice, choosesLooks } from "../src/pipeline.js";
import { Lisp } from "../src/maclisp/index.js";
import { printString } from "../src/maclisp/printer.js";

const args = process.argv.slice(2);
const valued = new Set(["--extensions", "--frames", "--fps", "--scenes", "--out"]);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const storyPath = args.find((a, i) => !a.startsWith("--") && !valued.has(args[i - 1]));
if (!storyPath) {
  console.log("Usage: node tools/run-story.mjs <story.lisp> [--extensions a,b] [--frames 600] [--fps 4] [--scenes s1,s2] [--out file.json] [--no-backtrace]");
  process.exit(2);
}
const list = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
const extensions = list(opt("--extensions", ""));
const frames = Number(opt("--frames", 600));
const fps = Number(opt("--fps", 4));
const only = list(opt("--scenes", ""));
const outPath = opt("--out", null);
const backtraces = !args.includes("--no-backtrace");

// the page's editor gives Ani lines ending in LF
const description = readFileSync(storyPath, "utf8").replace(/\r\n/g, "\n");
const root = fileURLToPath(new URL("..", import.meta.url));
const fs = makeProjectFileSystem(root);
// as makeFilmSteps makes it, for running a failed step again
const plan = storyPlan(storyOutline(description), { looks: choosesLooks(extensions) });

// Each step boots its own Lisp (src/pipeline.js boot), which first loads KEN;LISP; the
// last one booted is the step that stopped, and what it typed (Ken's warnings, and the
// name in "... is not defined as an actor") says more than the error alone.
let lisp = null;
const load = Lisp.prototype.load;
Lisp.prototype.load = function (...a) { lisp = this; return load.apply(this, a); };
const typed = () => (lisp ? lisp.ttyText.join("").replace(/\r/g, "").trim().split("\n").filter((l) => l.trim()).slice(-8) : []);

const seconds = (t0) => Math.round((Date.now() - t0) / 100) / 10;
const oneLine = (s, n = 220) => s.replace(/\s+/g, " ").slice(0, n);
const result = { story: storyPath, extensions, fps, frames, pass1: null, scenes: [] };
let at = { step: null, scene: null, t0: Date.now() };

// The forms on Lisp's stack when it stopped, innermost first: the first few, then the
// sends that led there (what was asked of whom), as tools/run-pass2.mjs prints them.
const isSend = (s) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE|DEFINE-FUNCTION) /.test(s);
function backtraceOf(step) {
  if (!backtraces) return null;
  try {
    step();
    return { again: "the step succeeded when run again with the backtrace on" };
  } catch (e) {
    const forms = (e.lispBacktrace || []).map((f) => oneLine(printString(f)));
    return {
      error: `${e.message}${e.where ? ` (at ${e.where})` : ""}`,
      innermost: forms.slice(0, 6),
      sends: forms.filter(isSend).slice(0, 20),
      stack: forms.length || /^break/.test(e.message || "") ? undefined : (e.stack || "").split("\n").slice(0, 6),
    };
  }
}

function printFailure(r) {
  if (r.typed && r.typed.length) {
    console.log("  Lisp typed, last:");
    for (const l of r.typed) console.log("    " + oneLine(l, 200));
  }
  const bt = r.backtrace;
  if (!bt) return;
  if (bt.again) { console.log(`  (${bt.again})`); return; }
  if (bt.error && !bt.error.startsWith(r.error)) console.log(`  run again with the backtrace on: ${bt.error}`);
  if (bt.innermost.length) {
    console.log("  innermost forms:");
    for (const f of bt.innermost) console.log("    " + f);
  }
  if (bt.sends.length) {
    console.log("  the sends that led there, innermost first:");
    for (const f of bt.sends) console.log("    " + f);
  }
  if (bt.stack) console.log("  " + bt.stack.join("\n  "));
}

// Choices pass 2 can't take as they are: (not X) and none (odd), and those it never
// reads (unread). A character's attractions (attraction-towards-friends, ...: ELEMNT's
// movement-tendency-elements, elemnt.1:96-105) are chosen in pass 1 and read nowhere
// after it: special dynamics take only the normal-movement elements (char.2:58-68), and
// the attractions' only other mention is a type list (nodes.38:102). So a none there
// does no harm, and is listed apart.
function oddChoices(choicePoints) {
  const odd = [], unread = [];
  for (const cp of choicePoints || []) {
    const v = cp.currentChoice;
    if (v !== "none" && !(Array.isArray(v) && v[0] === "not")) continue;
    const element = cp.elementName || (Array.isArray(cp.name) ? cp.name[2] : null);
    if (isAppearanceChoice(show(cp.name))) continue; // REVIVE;APPEAR reads its own (not X) and none
    (/^attraction-/.test(element || "") ? unread : odd).push({ choicePoint: cp.name, value: v });
  }
  return { odd, unread };
}
const show = (x) => (Array.isArray(x) ? `(${x.map(show).join(" ")})` : String(x));

// What Ani planned for each task of a scene, from its glass box: the task, and the
// methods chosen for it, or that it can't be done or is done by other tasks.
function planOf(glass) {
  return (glass.tasks || []).map((t) => {
    const v = t.variables;
    const m = /description (\(.*\)) for-who /.exec(v.task || "");
    return { task: t.name, description: m ? m[1] : v.task, status: v.status, choice: v["current-choice"] };
  });
}

// Repair notes as the glass box carries them, { actor, note } (src/pipeline.js
// repairNotes), or as text, or as actors whose items include (revival-repair: ...).
function repairNotes(repairs) {
  if (!repairs) return [];
  const notes = [];
  for (const r of Array.isArray(repairs) ? repairs : [repairs]) {
    if (typeof r === "string") notes.push(r);
    else if (r && typeof r.note === "string") notes.push(`${r.actor}: ${r.note}`);
    else if (r && Array.isArray(r.items)) {
      const items = r.items.filter((i) => /revival-repair/.test(i));
      for (const i of items.length ? items : r.items) notes.push(`${r.name}: ${i}`);
    } else notes.push(JSON.stringify(r));
  }
  return notes;
}

console.log(`${storyPath}: ${plan.scenes.length} scene${plan.scenes.length === 1 ? "" : "s"} (${plan.scenes.map((s) => s.id).join(", ")}), ${plan.cast.length} characters; extensions: ${extensions.length ? extensions.join(", ") : "none (Ani as in 1978)"}; ${fps} frames a second, at most ${frames} a scene`);

const steps = makeFilmSteps(fs, {
  description, keepGoing: true, frames, fps, extensions,
  scenes: only.length ? only : null,
  progress: (step, what, scene) => {
    at = { step, scene: scene || null, t0: step === "film" ? at.t0 : Date.now() }; // a scene's time is its pass 2's and its filming's
  },
  onPass1: (p) => {
    const { odd, unread } = oddChoices(p.choicePoints);
    result.pass1 = { ok: true, seconds: seconds(at.t0), choices: p.choices, odd, unread };
    if (p.repairs) result.pass1.repairs = repairNotes(p.repairs);
    console.log(`ok     pass 1 (${result.pass1.seconds}s): ${p.choices} choices${odd.length ? `, ${odd.length} that pass 2 can't use as ${odd.length === 1 ? "it is" : "they are"}:` : ""}`);
    for (const o of odd) console.log(`         ${show(o.choicePoint)} = ${show(o.value)}`);
    if (unread.length) console.log(`       ${unread.length} not read in pass 2 (on an attraction, which only pass 1 uses):`);
    for (const o of unread) console.log(`         ${show(o.choicePoint)} = ${show(o.value)}`);
    for (const n of result.pass1.repairs || []) console.log(`         repair: ${n}`);
    // how Ani chose each character's look (REVIVE;APPEAR)
    if (p.appearances) {
      result.pass1.looks = p.appearances.characters.map((c) => ({ character: c.character, ...c.look, elements: c.elements }));
      for (const c of p.appearances.characters) {
        console.log(`         ${c.character} looks: ${c.look.shape}, size ${c.look.aniSize} (${Object.entries(c.elements).map(([e, x]) => `${e} ${show(x.value)} from ${x.sources.join(", ")}`).join("; ")})`);
      }
      for (const f of p.appearances.findings) console.log(`         telling apart: ${f.items.join(" ")}`);
    }
  },
  onScene: (s) => {
    const r = { id: s.id, ok: !s.error, seconds: seconds(at.t0) };
    if (s.error) {
      r.failedIn = at.step; // pass2 or film
      r.error = s.error;
      r.typed = typed();
      console.log(`FAILED ${at.step === "film" ? "filming" : "pass 2"} ${s.id} (${r.seconds}s): ${s.error}`);
      // a scene starts where the one before it ended (its POSIT file) and may read an
      // earlier scene's decisions (its MINI file); a scene that failed wrote neither
      if (/(POSIT|MINI)\) \|does not exist\|/.test(s.error) && result.scenes.some((x) => !x.ok)) {
        r.knockOn = "an earlier scene failed, so a file this one starts from (POSIT or MINI) was never written";
        console.log(`  (${r.knockOn})`);
      } else {
        const opts = { plan, extensions, backtrace: true };
        r.backtrace = backtraceOf(() => (at.step === "film" ? film(fs, s.id, { ...opts, frames, fps }) : pass2(fs, s.id, opts)));
        printFailure(r);
      }
    } else {
      const n = s.film.frames.length;
      // (m frames) films frame 0 and then up to frames more (the page's test too)
      r.frames = n;
      r.capped = n > frames;
      r.subscenes = (s.glass.subscenes || []).length;
      r.plan = planOf(s.glass);
      console.log(`${r.capped ? "CAPPED" : "ok    "} ${s.id} (${r.seconds}s): ${n} frames (${(n / fps).toFixed(1)} s), ${r.subscenes} subscene${r.subscenes === 1 ? "" : "s"}${r.capped ? `; hit the cap of ${frames}: the scene never ended` : ""}`);
      for (const t of r.plan) {
        const what = t.status ? t.status : t.choice;
        console.log(`         ${t.task.padEnd(16)} ${oneLine(t.description, 70)}: ${oneLine(String(what), 110)}`);
      }
    }
    // pass 2's notes, in the glass box, then those left while the scene was filmed
    const notes = [...repairNotes(s.glass && s.glass.repairs), ...repairNotes(s.film && s.film.repairs).map((n) => `${n} (while filming)`)];
    if (notes.length) {
      r.repairs = notes;
      for (const n of r.repairs) console.log(`         repair: ${n}`);
    }
    result.scenes.push(r);
  },
});

const t0 = Date.now();
try {
  for (;;) if (steps.next().done) break;
} catch (e) {
  // pass 1 isn't covered by keepGoing: without its choices there is nothing to plan
  // (and an unknown extension stops the run before pass 1)
  const where = at.step === "pass1" ? "pass 1" : at.step ? `${at.step} ${at.scene}` : "before pass 1";
  console.log(`FAILED ${where}: ${(e && e.message) || e}`);
  const r = { ok: false, seconds: seconds(at.t0), error: String((e && e.message) || e), typed: at.step ? typed() : [] };
  if (at.step === "pass1") {
    r.backtrace = backtraceOf(() => pass1(fs, { extensions, backtrace: true }));
    result.pass1 = r;
  } else if (at.step) {
    result.scenes.push({ id: at.scene, failedIn: at.step, ...r });
  } else {
    result.pass1 = r;
  }
  printFailure(r);
}
const failed = (result.pass1 && !result.pass1.ok ? 1 : 0) + result.scenes.filter((s) => !s.ok).length;
const capped = result.scenes.filter((s) => s.capped).length;
console.log(`\n${failed ? `${failed} step${failed === 1 ? "" : "s"} failed` : "nothing failed"}${capped ? `, ${capped} scene${capped === 1 ? "" : "s"} never ended` : ""} (${seconds(t0)}s)`);
if (outPath) {
  writeFileSync(resolve(outPath), JSON.stringify(result, null, 1));
  console.log(`wrote ${outPath}`);
}
process.exit(failed || capped ? 1 : 0);
