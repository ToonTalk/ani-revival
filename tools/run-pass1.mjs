// Run Ani's pass 1 the way KEN;DATEST did: load the Cinderella film description,
// make the choices about the characters' dynamics, and save the answers; then
// compare them with CP 29, the file pass 1 wrote in September 1978.
// Usage: node tools/run-pass1.mjs [--trace] [--show] [--diff] [--save] [--save-all] [--glass-box]
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";
import { writeFileSync } from "node:fs";
import { choicesOfText, choicesOfItsFile, compareChoices } from "./choices.mjs";
import { installAttemptLog, collectChoicePoints, collectStory } from "../src/glassbox-pass1.js";
import { buildGlassBox } from "./build-glassbox.mjs";

const trace = process.argv.includes("--trace");
const fs = makeProjectFileSystem();
const L = createLisp({ fs });
L.formStack = process.argv.includes("--no-backtrace") ? null : []; // a backtrace for errors, at some cost in speed
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = L.formStack.slice(-40).reverse();
  throw e;
};

function step(what, src) {
  const t0 = Date.now();
  try {
    const v = L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${L.print(v).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    if (e.lispBacktrace) {
      console.log("  Lisp backtrace (innermost first):");
      for (const f of e.lispBacktrace.slice(0, trace ? 40 : 14)) console.log("    " + L.print(f).slice(0, 160));
    } else if (!(e.message || "").includes("break")) {
      console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    }
    return false;
  }
}

L.load(L.intern("KEN;LISP >"));
L.load(L.intern("KEN;LOAD >"));
L.evalString("(setq :print-load-messages nil)");
const glassBox = process.argv.includes("--glass-box");
let attempts = null;
const ok =
  step("(director '(ani direct))", "(director '(ani direct))") &&
  step("load REVIVE;BRIDGE (the 1978 conventions)", "(load '|revive;bridge >|)") &&
  step("load DATEST", "(load '|ken;datest >|)") &&
  step("(init nil): load CINDY, study descriptor use", "(init nil)") &&
  (glassBox ? (attempts = installAttemptLog(L), true) : true) &&
  step("(z): make the choices", "(z)") &&
  step("(save-answers ...)", "(save-answers '((ken1) cp test))") &&
  (!process.argv.includes("--save-all") || step("(save-it-all ...): every choice point with its reasons", "(save-it-all '((ken1) run test))"));

if (ok && glassBox) {
  const data = {
    about: "Ani's pass 1 on CINDY, rerun on the revived Director. Written by tools/run-pass1.mjs --glass-box.",
    cp29: [...choicesOfItsFile("original/7005017/cp.29").entries()],
    story: collectStory(L),
    attempts,
    choicePoints: collectChoicePoints(L),
  };
  writeFileSync("app/data/pass1.json", JSON.stringify(data));
  console.log(`saved app/data/pass1.json (${attempts.length} attempts, ${data.choicePoints.length} choice points)`);
  console.log("built " + buildGlassBox("."));
}

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 2500 chars):\n" + out.slice(-2500));
if (L.warnings.length) console.log("\nwarnings:\n  " + L.warnings.slice(-8).join("\n  "));

if (ok) {
  const entry = fs.find({ dir: "KEN1", fn1: "CP", fn2: "TEST" });
  console.log(`\nwrote KEN1;CP TEST (${entry ? fs.textOf(entry).length : 0} characters)`);
  if (entry && process.argv.includes("--show")) console.log("\n" + fs.textOf(entry).slice(0, 3000));
  if (entry) {
    const ours = choicesOfText(fs.textOf(entry));
    if (process.argv.includes("--save")) {
      writeFileSync("reports/pass1-choices.txt", fs.textOf(entry));
      console.log("saved reports/pass1-choices.txt");
    }
    const all = fs.find({ dir: "KEN1", fn1: "RUN", fn2: "TEST" });
    if (all) {
      writeFileSync("reports/pass1-reasons.txt", fs.textOf(all));
      console.log("saved reports/pass1-reasons.txt (as RUN24 2 records them)");
    }
    for (const [label, path] of [["CP 29 (Sep 1978)", "original/7005017/cp.29"], ["RUN24 2 (Dec 1978)", "original/9004336/run24.2"]]) {
      const theirs = choicesOfItsFile(path);
      const c = compareChoices(theirs, ours);
      console.log(`\nagainst ${label}: ${c.same} of ${theirs.size} choices the same; ${c.differ.length} differ, ${c.onlyA.length} missing, ${c.onlyB.length} extra (we made ${ours.size})`);
      const a = [...theirs.keys()];
      const b = [...ours.keys()];
      const inPlace = a.filter((k, i) => b[i] === k).length;
      console.log(`  in the same place in the file: ${inPlace} of ${a.length}`);
      if (process.argv.includes("--diff")) {
        for (const [k, a, b] of c.differ) console.log(`  ${k}: ${a} then, ${b} now`);
        for (const [k, a] of c.onlyA) console.log(`  missing ${k} = ${a}`);
        for (const [k, b] of c.onlyB) console.log(`  extra ${k} = ${b}`);
      }
    }
  }
}
process.exit(ok ? 0 : 1);
