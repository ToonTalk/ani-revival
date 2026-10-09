// Run Ani's pass 1 the way KEN;DATEST did: load the Cinderella film description,
// make the choices about the characters' dynamics, and save the answers; then
// compare them with CP 29, the file pass 1 wrote in September 1978. Exits non-zero
// unless every choice is CP 29's, in its place.
// Usage: node tools/run-pass1.mjs [--trace] [--show] [--diff] [--save] [--save-all] [--glass-box]
//                                 [--extensions a,b] [--out folder] [--no-backtrace]
//   --save        copy the choices (KEN1;CP TEST: CP 29's content as our pass 1 writes
//                 it) to reports/pass1-choices.txt
//   --save-all    also save every choice point with its reasons, as RUN24 2 records
//                 them (save-it-all), and copy them to reports/pass1-reasons.txt
//   --glass-box   record each attempt at a choice, and write app/data/pass1.json and
//                 app/pass1.html, the glass-box view of pass 1
//   --extensions  also load the revival's extensions (src/pipeline.js EXTENSIONS).
//                 What --save, --save-all and --glass-box write goes to
//                 reports/ext/<a+b>/ instead (pass1-choices.txt, pass1-reasons.txt,
//                 pass1.json, pass1.html), so the 1978 ones stay as they are.
//   --out         write those files to this folder instead, under the same names
//                 (tools/check-1978.mjs uses it)
import { boot, extensionsFor } from "../src/pipeline.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { printString } from "../src/maclisp/printer.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";
import { installAttemptLog, collectChoicePoints, collectStory } from "../src/glassbox-pass1.js";
import { buildGlassBox } from "./build-glassbox.mjs";

const args = process.argv.slice(2);
const trace = args.includes("--trace");
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] || "" : null; };
const extensions = extensionsFor((opt("--extensions") || "").split(",").filter(Boolean)).map((e) => e.id); // an unknown one stops here
// where each file goes: Ani as in 1978's are the goldens the checks compare against
const outDir = opt("--out") || (extensions.length ? `reports/ext/${extensions.join("+")}` : null);
const out = outDir
  ? { choices: `${outDir}/pass1-choices.txt`, reasons: `${outDir}/pass1-reasons.txt`, data: `${outDir}/pass1.json`, page: `${outDir}/pass1.html` }
  : { choices: "reports/pass1-choices.txt", reasons: "reports/pass1-reasons.txt", data: "app/data/pass1.json", page: "app/pass1.html" };
if (outDir) mkdirSync(outDir, { recursive: true });
const fs = makeProjectFileSystem();
let L = null;

function step(what, src) {
  const t0 = Date.now();
  try {
    const v = typeof src === "function" ? src() : L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${(Array.isArray(v) ? v.join(" ") : L.print(v)).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    if (e.lispBacktrace) {
      console.log("  Lisp backtrace (innermost first):");
      for (const f of e.lispBacktrace.slice(0, trace ? 40 : 14)) console.log("    " + printString(f).slice(0, 160));
    } else if (!(e.message || "").includes("break")) {
      console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    }
    return false;
  }
}

const glassBox = args.includes("--glass-box");
let attempts = null;
const ok =
  // Director with the 1978 conventions (REVIVE;BRIDGE), as each step of the pipeline boots it
  step(`boot Director and REVIVE;BRIDGE${extensions.length ? `, with the extensions ${extensions.join(", ")}` : ""}`,
    () => { L = boot(fs, { backtrace: !args.includes("--no-backtrace"), extensions }); return []; }) &&
  step("load DATEST", "(load '|ken;datest >|)") &&
  step("(init nil): load CINDY, study descriptor use", "(init nil)") &&
  (glassBox ? (attempts = installAttemptLog(L), true) : true) &&
  step("(z): make the choices", "(z)") &&
  step("(save-answers ...)", "(save-answers '((ken1) cp test))") &&
  (!args.includes("--save-all") || step("(save-it-all ...): every choice point with its reasons", "(save-it-all '((ken1) run test))"));

if (ok && glassBox) {
  const data = {
    about: `Ani's pass 1 on CINDY, rerun on the revived Director${extensions.length ? `, with the revival's extensions ${extensions.join(", ")}` : ""}. Written by tools/run-pass1.mjs --glass-box.`,
    cp29: [...choicesOfItsFile("original/7005017/cp.29").entries()],
    story: collectStory(L),
    attempts,
    choicePoints: collectChoicePoints(L),
  };
  writeFileSync(out.data, JSON.stringify(data));
  console.log(`saved ${out.data} (${attempts.length} attempts, ${data.choicePoints.length} choice points)`);
  console.log("built " + buildGlassBox(".", { data: out.data, out: out.page }));
}

const typed = L ? L.ttyText.join("") : "";
if (typed.trim()) console.log("\nterminal output (last 2500 chars):\n" + typed.slice(-2500));
if (L && L.warnings.length) console.log("\nwarnings:\n  " + L.warnings.slice(-8).join("\n  "));

let asCp29 = false;
if (ok) {
  const entry = fs.find({ dir: "KEN1", fn1: "CP", fn2: "TEST" });
  console.log(`\nwrote KEN1;CP TEST (${entry ? fs.textOf(entry).length : 0} characters)`);
  if (entry && args.includes("--show")) console.log("\n" + fs.textOf(entry).slice(0, 3000));
  if (entry) {
    const ours = choicesOfText(fs.textOf(entry));
    if (args.includes("--save")) {
      writeFileSync(out.choices, fs.textOf(entry));
      console.log(`saved ${out.choices}`);
    }
    const all = fs.find({ dir: "KEN1", fn1: "RUN", fn2: "TEST" });
    if (all) {
      writeFileSync(out.reasons, fs.textOf(all));
      console.log(`saved ${out.reasons} (as RUN24 2 records them)`);
    }
    for (const [label, path] of [["CP 29 (Sep 1978)", "original/7005017/cp.29"], ["RUN24 2 (Dec 1978)", "original/9004336/run24.2"]]) {
      const theirs = choicesOfItsFile(path);
      const c = compareChoices(theirs, ours);
      console.log(`\nagainst ${label}: ${c.same} of ${theirs.size} choices the same; ${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra (we made ${ours.size})`);
      const a = [...theirs.keys()];
      const b = [...ours.keys()];
      const inPlace = a.filter((k, i) => b[i] === k).length;
      console.log(`  in the same place in the file: ${inPlace} of ${a.length}`);
      if (label.startsWith("CP 29")) asCp29 = c.same === theirs.size && ours.size === theirs.size && inPlace === a.length;
      if (args.includes("--diff")) {
        for (const [k, a, b] of c.differ) console.log(`  ${k}: ${a} then, ${b} now`);
        for (const [k, a] of c.onlyA) console.log(`  missing ${k} = ${a}`);
        for (const [k, b] of c.onlyB) console.log(`  extra ${k} = ${b}`);
      }
    }
  }
}
if (ok && !asCp29) console.log("\nFAILED: the choices are not CP 29's");
process.exit(ok && asCp29 ? 0 : 1);
