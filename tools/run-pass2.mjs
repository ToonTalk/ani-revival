// Run Ani's pass 2 the way KEN;RUN did: for a scene, collect the suggestions for
// its tasks, choose its subscenes and values, plan the subscenes, and save the
// Director program that will show it (KEN;INTROD UCTION and so on), with its
// summary (KEN1;INTROD MINI) and printout (KEN1;INTROD PRINT). Each file is also
// copied to reports/pass2/.
// Usage: node tools/run-pass2.mjs [scene] [--no-backtrace] [--glass-box] [--extensions a,b]
//   scene is introduction (the default), kept-apart, no-longer-kept-apart,
//   meeting or justice.
//   --glass-box  also write reports/pass2/<scene>.glass.json for the web app: every
//   actor of the scene's plan as Ani left it (the scene, its tasks with the methods
//   suggested, rejected and scored, its subscenes, activities and special dynamics),
//   each as its variables and what it memorized, printed as Lisp (src/pipeline.js
//   glassBox).
//   --extensions  also load the revival's extensions (src/pipeline.js EXTENSIONS).
//   The files go to reports/ext/<a+b>/ instead, so the 1978 ones stay as they are;
//   the files of earlier scenes are read from there, or else from reports/pass2/.
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { printString } from "../src/maclisp/printer.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FILE_NAMES, extensionsFor, boot, glassBox } from "../src/pipeline.js";

const args = process.argv.slice(2);
const scene = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--extensions") || "introduction";
const extAt = args.indexOf("--extensions");
const extensions = extensionsFor(extAt >= 0 ? (args[extAt + 1] || "").split(",").filter(Boolean) : []).map((e) => e.id);
const outDir = extensions.length ? `reports/ext/${extensions.join("+")}` : "reports/pass2";
// Each scene's file names (KEN;RUN's defprops): the program is KEN;<fn1> <fn2>, the
// summary KEN1;<fn1> MINI and the printout KEN1;<fn1> PRINT.
const ownFn1 = (FILE_NAMES[scene] || "").split(" ")[0];
const fs = makeProjectFileSystem();
// positions saved by earlier scenes (KEN1;INTRO POSIT, ...), but not what this run writes
const writes = [`KEN;${FILE_NAMES[scene]}`, `KEN1;${ownFn1} MINI`, `KEN1;${ownFn1} PRINT`];
mountRunOutputs(fs, undefined, writes);
if (extensions.length) mountRunOutputs(fs, join(process.cwd(), outDir), writes);
let L = null;

// The sends in a backtrace, innermost first: what was asked of whom.
const isSend = (f) => /^\((ASK|ASK1|ASK-EACH|DO-AS-IF-YOU-WERE|DEFINE|DEFINE-FUNCTION) /.test(printString(f));

function step(what, src) {
  const t0 = Date.now();
  try {
    const v = typeof src === "function" ? src() : L.evalString(src);
    console.log(`ok     ${what} (${((Date.now() - t0) / 1000).toFixed(1)}s)  => ${(Array.isArray(v) ? v.join(" ") : L.print(v)).slice(0, 120)}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    const bt = e.lispBacktrace || [];
    if (bt.length) {
      console.log("  innermost forms:");
      for (const f of bt.slice(0, 6)) console.log("    " + printString(f).slice(0, 200));
      console.log("  the sends that led there, innermost first:");
      for (const f of bt.filter(isSend).slice(0, 30)) console.log("    " + printString(f).slice(0, 220));
    } else if (!(e.message || "").startsWith("break")) console.log(e.stack.split("\n").slice(0, 6).join("\n"));
    return false;
  }
}

const ok =
  // Director with the 1978 conventions (REVIVE;BRIDGE), as each step of the pipeline boots it
  step(`boot Director and REVIVE;BRIDGE${extensions.length ? `, with the extensions ${extensions.join(", ")}` : ""}`,
    () => { L = boot(fs, { backtrace: !args.includes("--no-backtrace"), extensions }); return []; }) &&
  // Ken's Director was a saved job with the TV display already started (KEN;DUMP
  // clears the screen before saving it); pass 2 measures places on that screen.
  step("(cs): start the TV display", "(cs)") &&
  step("load RUN", "(load '|ken;run >|)") &&
  step(`(run '${scene})`, `(run '${scene})`) &&
  step(`(save '${scene} t)`, `(save '${scene} t)`);
if (!L) process.exit(1);

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 3000 characters):\n" + out.slice(-3000));

// what was written
mkdirSync(outDir, { recursive: true });
const fileName = L.evalString(`(get '${scene} 'file-name)`);
const [fn1, fn2] = [L.print(fileName.car), L.print(fileName.cdr.car)];
for (const name of [{ dir: "KEN", fn1, fn2 }, { dir: "KEN1", fn1, fn2: "MINI" }, { dir: "KEN1", fn1, fn2: "PRINT" }]) {
  const e = fs.find(name);
  const label = `${name.dir};${name.fn1} ${name.fn2}`;
  if (!e) { console.log(`${label}: not written`); continue; }
  const text = fs.textOf(e);
  const path = `${outDir}/${name.dir.toLowerCase()}-${name.fn1.toLowerCase()}.${name.fn2.toLowerCase()}`;
  writeFileSync(path, text);
  console.log(`${label}: ${text.length} characters, copied to ${path}`);
}
// The glass box: each actor of the plan, as its own variables (recalled as print-all
// recalls them) and the items it memorized, and any notes the revival's repairs left.
if (ok && args.includes("--glass-box")) {
  const glass = glassBox(L, scene);
  writeFileSync(`${outDir}/${scene}.glass.json`, JSON.stringify(glass, null, 1));
  console.log(`glass box: ${glass.tasks.length} tasks, ${glass.subscenes.length} subscenes, ${glass.plans.length} activities, ${glass.dynamics.length} special dynamics${glass.repairs ? `, ${glass.repairs.length} repair notes` : ""} in ${outDir}/${scene}.glass.json`);
}
process.exit(ok ? 0 : 1);
