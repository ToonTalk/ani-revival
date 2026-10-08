// Boot Director with ANINIT, start a scene Ani planned (from reports/pass2/), and
// evaluate Lisp expressions, printing each result: for looking inside a scene run.
// Usage: node tools/scene-repl.mjs [--scene introduction] [--no-start] "(expr)" ...
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const si = args.indexOf("--scene");
const scene = si >= 0 ? args[si + 1] : "introduction";
const fs = makeProjectFileSystem();
mountRunOutputs(fs); // what earlier steps wrote (KEN;INTROD UCTION, ...)
const L = createLisp({ fs });
L.formStack = [];
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = L.formStack.slice(-40).reverse();
  throw e;
};
const show = (src) => {
  try {
    console.log(`${src}\n  => ${L.print(L.evalString(src)).slice(0, 2500)}`);
  } catch (e) {
    console.log(`${src}\n  ERROR ${e.message}`);
    for (const f of (e.lispBacktrace || []).slice(0, 10)) console.log("    " + L.print(f).slice(0, 180));
  }
};
L.load(L.intern("KEN;LISP >"));
L.load(L.intern("KEN;LOAD >"));
for (const s of ["(setq :print-load-messages nil)", "(director '(ani direct))", "(load '|revive;bridge >|)", "(cs)", "(load '|ken;aninit >|)"]) L.evalString(s);
if (!args.includes("--no-start")) L.evalString(`(start '${scene} 4)`);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--scene") { i++; continue; }
  if (!args[i].startsWith("--")) show(args[i]);
}
const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 2000 characters):\n" + out.slice(-2000));
