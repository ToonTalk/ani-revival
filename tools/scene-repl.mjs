// Boot Director with ANINIT, start a scene Ani planned (from reports/pass2/), and
// evaluate Lisp expressions, printing each result: for looking inside a scene run.
// Usage: node tools/scene-repl.mjs [--scene introduction] [--no-start] [--extensions a,b] "(expr)" ...
//   --extensions  also load the revival's extensions (src/pipeline.js EXTENSIONS), and
//                 read the scene's program from reports/ext/<a+b>/ if it is there
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { join } from "node:path";
import { boot, extensionsFor } from "../src/pipeline.js";

const args = process.argv.slice(2);
const si = args.indexOf("--scene");
const scene = si >= 0 ? args[si + 1] : "introduction";
const extAt = args.indexOf("--extensions");
const extensions = extensionsFor(extAt >= 0 ? (args[extAt + 1] || "").split(",").filter(Boolean) : []).map((e) => e.id);
const fs = makeProjectFileSystem();
mountRunOutputs(fs); // what earlier steps wrote (KEN;INTROD UCTION, ...)
if (extensions.length) mountRunOutputs(fs, join(process.cwd(), `reports/ext/${extensions.join("+")}`));
// Director as each step of the pipeline boots it (src/pipeline.js boot)
const L = boot(fs, { backtrace: true, extensions });
const show = (src) => {
  try {
    console.log(`${src}\n  => ${L.print(L.evalString(src)).slice(0, 2500)}`);
  } catch (e) {
    console.log(`${src}\n  ERROR ${e.message}`);
    for (const f of (e.lispBacktrace || []).slice(0, 10)) console.log("    " + L.print(f).slice(0, 180));
  }
};
for (const s of ["(cs)", "(load '|ken;aninit >|)"]) L.evalString(s);
if (!args.includes("--no-start")) L.evalString(`(start '${scene} 4)`);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scene" || args[i] === "--extensions") { i++; continue; }
  if (!args[i].startsWith("--")) show(args[i]);
}
const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 2000 characters):\n" + out.slice(-2000));
