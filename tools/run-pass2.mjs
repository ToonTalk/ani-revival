// Run Ani's pass 2 the way KEN;RUN did: for a scene, collect the suggestions for
// its tasks, choose its subscenes and values, plan the subscenes, and save the
// Director program that will show it (KEN;INTROD UCTION and so on), with its
// summary (KEN1;INTROD MINI) and printout (KEN1;INTROD PRINT). Each file is also
// copied to reports/pass2/.
// Usage: node tools/run-pass2.mjs [scene] [--no-backtrace]
//   scene is introduction (the default), kept-apart, no-longer-kept-apart,
//   meeting or justice.
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { mkdirSync, writeFileSync } from "node:fs";

const scene = process.argv.slice(2).find((a) => !a.startsWith("--")) || "introduction";
// Each scene's file names (KEN;RUN's defprops): the program is KEN;<fn1> <fn2>, the
// summary KEN1;<fn1> MINI and the printout KEN1;<fn1> PRINT.
const fileNames = { introduction: "INTROD UCTION", "kept-apart": "KEPT APART", "no-longer-kept-apart": "NO LONGER", meeting: "MEET ING", justice: "JUST ICE" };
const ownFn1 = (fileNames[scene] || "").split(" ")[0];
const fs = makeProjectFileSystem();
// positions saved by earlier scenes (KEN1;INTRO POSIT, ...), but not what this run writes
mountRunOutputs(fs, undefined, [`KEN;${fileNames[scene]}`, `KEN1;${ownFn1} MINI`, `KEN1;${ownFn1} PRINT`]);
const L = createLisp({ fs });
L.formStack = process.argv.includes("--no-backtrace") ? null : [];
L.backtraceDepth = 4000;
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = (L.formStack || []).slice(-4000).reverse();
  throw e;
};

// The sends in a backtrace, innermost first: what was asked of whom.
const isSend = (f) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE|DEFINE-FUNCTION) /.test(L.print(f));

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
      for (const f of bt.filter(isSend).slice(0, 30)) console.log("    " + L.print(f).slice(0, 220));
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
  // Ken's Director was a saved job with the TV display already started (KEN;DUMP
  // clears the screen before saving it); pass 2 measures places on that screen.
  step("(cs): start the TV display", "(cs)") &&
  step("load RUN", "(load '|ken;run >|)") &&
  step(`(run '${scene})`, `(run '${scene})`) &&
  step(`(save '${scene} t)`, `(save '${scene} t)`);

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 3000 characters):\n" + out.slice(-3000));

// what was written
mkdirSync("reports/pass2", { recursive: true });
const fileName = L.evalString(`(get '${scene} 'file-name)`);
const [fn1, fn2] = [L.print(fileName.car), L.print(fileName.cdr.car)];
for (const name of [{ dir: "KEN", fn1, fn2 }, { dir: "KEN1", fn1, fn2: "MINI" }, { dir: "KEN1", fn1, fn2: "PRINT" }]) {
  const e = fs.find(name);
  const label = `${name.dir};${name.fn1} ${name.fn2}`;
  if (!e) { console.log(`${label}: not written`); continue; }
  const text = fs.textOf(e);
  const path = `reports/pass2/${name.dir.toLowerCase()}-${name.fn1.toLowerCase()}.${name.fn2.toLowerCase()}`;
  writeFileSync(path, text);
  console.log(`${label}: ${text.length} characters, copied to ${path}`);
}
process.exit(ok ? 0 : 1);
