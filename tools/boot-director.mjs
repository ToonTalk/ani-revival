// Start Director the way Ken's KEN;LOAD did, then load more of it, reporting the
// first problem at each step.
// Usage: node tools/boot-director.mjs [extra Lisp to evaluate afterwards]
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";

const fs = makeProjectFileSystem();
const L = createLisp({ fs });
L.formStack = []; // keep a backtrace of Lisp forms
L.breakHandler = (tag) => {
  const e = new Error(`break ${L.print(tag)}`);
  e.lispBacktrace = L.formStack.slice(-60).reverse();
  throw e;
};

function step(what, fn) {
  const before = fs.log.length;
  try {
    const v = fn();
    console.log(`ok     ${what}${v !== undefined ? "  => " + L.print(v).slice(0, 100) : ""}`);
    return true;
  } catch (e) {
    console.log(`FAILED ${what}: ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
    if (e.lispBacktrace) {
      console.log("       Lisp backtrace (innermost first):");
      for (const f of e.lispBacktrace) console.log("         " + L.print(f).slice(0, 150));
    }
    const loads = fs.log.slice(before).filter((l) => l.startsWith("load")).slice(-4);
    if (loads.length) console.log("       recent loads: " + loads.join(" | "));
    return false;
  }
}

const ok =
  step("load KEN;LISP (Ken's init, which loads the macro files)", () => L.load(L.intern("KEN;LISP >"))) &&
  step("load KEN;LOAD", () => L.load(L.intern("KEN;LOAD >"))) &&
  step("(director '(ani direct))", () => L.evalString("(director '(ani direct))")) &&
  step("(actor-of 'something)  [autoloads KEN;SOME]", () => L.evalString("(name-of (actor-of 'something))")) &&
  step("(ask something recall your name)", () => L.evalString("(ask something recall your name)"));

for (const extra of process.argv.slice(2)) step(extra, () => L.evalString(extra));

const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output (last 1500 chars):\n" + out.slice(-1500));
if (L.warnings.length) console.log("\nwarnings:\n  " + L.warnings.slice(-10).join("\n  "));
if (L.lenientCarCdr) console.log(`\nlenient car/cdr of atoms: ${L.lenientCarCdr}`);
process.exit(ok ? 0 : 1);
