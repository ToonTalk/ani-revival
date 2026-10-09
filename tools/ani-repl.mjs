// Boot Director and Ani's pass 1 setup, then evaluate Lisp expressions given on
// the command line (or read them from a file with --file), printing each result.
// Usage: node tools/ani-repl.mjs [--no-init] [--z] [--extensions a,b] "(expr)" ...
//        node tools/ani-repl.mjs --pass2 "(run 'kept-apart)" "(expr)" ...
//   --pass2 sets up as pass 2 does (TV display, KEN;RUN, the files earlier runs wrote).
//   --extensions  also load the revival's extensions (src/pipeline.js EXTENSIONS)
//   --no-bridge   Director without REVIVE;BRIDGE, the 1978 conventions (nor extensions)
import { readFileSync } from "node:fs";
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem, mountRunOutputs } from "../src/its/node-fs.js";
import { boot } from "../src/pipeline.js";

const args = process.argv.slice(2);
const fs = makeProjectFileSystem();
const pass2 = args.includes("--pass2");
if (pass2) mountRunOutputs(fs);
const extAt = args.indexOf("--extensions");
const extensions = extAt >= 0 ? (args[extAt + 1] || "").split(",").filter(Boolean) : [];
// Director as each step of the pipeline boots it (src/pipeline.js boot), or without the bridge
function withoutBridge() {
  const L = createLisp({ fs });
  L.formStack = [];
  L.breakHandler = (tag) => {
    const e = new Error(`break ${L.print(tag)}`);
    e.lispBacktrace = L.formStack.slice(-25).reverse();
    throw e;
  };
  L.load(L.intern("KEN;LISP >"));
  L.load(L.intern("KEN;LOAD >"));
  L.evalString("(setq :print-load-messages nil)");
  L.evalString("(director '(ani direct))");
  return L;
}
const L = args.includes("--no-bridge") ? withoutBridge() : boot(fs, { backtrace: true, extensions });
const show = (src) => {
  try {
    const v = L.evalString(src);
    console.log(`${src}\n  => ${L.print(v).slice(0, 2000)}`);
  } catch (e) {
    console.log(`${src}\n  ERROR ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    if (e.lispBacktrace) for (const f of e.lispBacktrace.slice(0, 12)) console.log("    " + L.print(f).slice(0, 150));
  }
};

if (pass2) {
  L.evalString("(cs)");
  L.evalString("(load '|ken;run >|)");
} else {
  L.evalString("(load '|ken;datest >|)");
  if (!args.includes("--no-init")) L.evalString("(init nil)");
}
if (args.includes("--z")) L.evalString("(z)");
const exprs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--file") exprs.push(...readFileSync(args[++i], "utf8").split("\n").filter((l) => l.trim() && !l.startsWith(";")));
  else if (args[i] === "--extensions") i++;
  else if (!args[i].startsWith("--")) exprs.push(args[i]);
}
for (const e of exprs) show(e);
const out = L.ttyText.join("");
if (args.includes("--tty") && out.trim()) console.log("\nterminal output (last 3000 chars):\n" + out.slice(-3000));
