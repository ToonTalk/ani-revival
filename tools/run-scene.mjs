// Run a scene Ani planned, in Director, the way KEN;ANINIT did: load the scene's
// program (written by tools/run-pass2.mjs into reports/pass2/), film it, and save
// where each character ended up (KEN1;INTRO POSIT and so on, which pass 2 loads to
// plan the next scene). The position file is copied to reports/pass2/.
// Usage: node tools/run-scene.mjs [scene] [--frames n] [--fps n] [--no-backtrace]
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const scene = args.find((a, i) => !a.startsWith("--") && !/^--/.test(args[i - 1] || "")) || "introduction";
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : dflt; };
const frames = opt("--frames", 1000);
const fps = opt("--fps", 4);

const fs = makeProjectFileSystem();
// Files the earlier steps wrote: every scene program and position file so far.
mountRunOutputs(fs); // what earlier steps wrote (KEN;INTROD UCTION, ...)

const L = createLisp({ fs });
L.formStack = args.includes("--no-backtrace") ? null : [];
L.backtraceDepth = 4000;
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = (L.formStack || []).slice(-4000).reverse();
  throw e;
};
const isSend = (f) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE) /.test(L.print(f));
function step(what, src) {
  const t0 = Date.now();
  try {
    const v = L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${L.print(v).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    const bt = e.lispBacktrace || [];
    if (bt.length) {
      console.log("  innermost forms:");
      for (const f of bt.slice(0, 6)) console.log("    " + L.print(f).slice(0, 200));
      console.log("  the sends that led there, innermost first:");
      for (const f of bt.filter(isSend).slice(0, 25)) console.log("    " + L.print(f).slice(0, 220));
    } else if (!(e.message || "").startsWith("break")) console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    return false;
  }
}

L.load(L.intern("KEN;LISP >"));
L.load(L.intern("KEN;LOAD >"));
L.evalString("(setq :print-load-messages nil)");
const ok =
  step("(director '(ani direct))", "(director '(ani direct))") &&
  step("load REVIVE;BRIDGE (the 1978 conventions)", "(load '|revive;bridge >|)") &&
  step("(cs): start the TV display", "(cs)") &&
  step("load ANINIT (Director extended to run Ani's scenes)", "(load '|ken;aninit >|)") &&
  step(`(start '${scene} ${fps})`, `(start '${scene} ${fps})`) &&
  step(`(m ${frames}): film the scene`, `(m ${frames})`) &&
  step("save the positions", `(save-positions '${scene} '((ken1) ,(get '${scene} 'movie-name) posit))`);

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 3000 characters):\n" + out.slice(-3000));
if (ok) {
  const name = L.print(L.evalString(`(get '${scene} 'movie-name)`)).toLowerCase();
  const e = fs.find({ dir: "KEN1", fn1: name.toUpperCase(), fn2: "POSIT" });
  if (e) {
    writeFileSync(`reports/pass2/ken1-${name}.posit`, fs.textOf(e));
    console.log(`KEN1;${name.toUpperCase()} POSIT: copied to reports/pass2/ken1-${name}.posit\n` + fs.textOf(e));
  }
}
process.exit(ok ? 0 : 1);
