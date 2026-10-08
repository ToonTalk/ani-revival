// Run Ani's pass 1 the way KEN;DATEST did: load the Cinderella film description,
// make the choices about the characters' dynamics, and save the answers; then
// compare them with CP 29, the file pass 1 wrote in September 1978.
// Usage: node tools/run-pass1.mjs [--trace]
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";

const trace = process.argv.includes("--trace");
const fs = makeProjectFileSystem();
const L = createLisp({ fs });
L.formStack = [];
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
const ok =
  step("(director '(ani direct))", "(director '(ani direct))") &&
  step("load DATEST", "(load '|ken;datest >|)") &&
  step("(init nil): load CINDY, study descriptor use", "(init nil)") &&
  step("(z): make the choices", "(z)") &&
  step("(save-answers ...)", "(save-answers '((ken1) cp test))");

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 2500 chars):\n" + out.slice(-2500));
if (L.warnings.length) console.log("\nwarnings:\n  " + L.warnings.slice(-8).join("\n  "));

if (ok) {
  const entry = fs.find({ dir: "KEN1", fn1: "CP", fn2: "TEST" });
  console.log(`\nwrote KEN1;CP TEST (${entry ? fs.textOf(entry).length : 0} characters)`);
  if (entry && process.argv.includes("--show")) console.log("\n" + fs.textOf(entry).slice(0, 3000));
}
process.exit(ok ? 0 : 1);
