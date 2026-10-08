// Phase 1 milestone: load Ken's 1979 init and declaration files into the
// interpreter, the way his Lisp started up, and report what happened.
// Usage: node tools/boot.mjs
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";

const fs = makeProjectFileSystem();
const L = createLisp({ fs });

const steps = [
  ["KEN;LISP >", "Ken's Lisp init (KEN LISP loads KEN;LISP)"],
  ["KEN;LOAD >", "Director's loader"],
  ["KEN;DECLAR >", "declarations (only included when compiling)"],
  ["KEN;DECLA2 >", "the compiler declarations for Director"],
];

let ok = true;
for (const [file, what] of steps) {
  try {
    L.load(L.intern(file));
    console.log(`loaded ${file.padEnd(14)} ${what}`);
  } catch (e) {
    ok = false;
    console.log(`FAILED ${file.padEnd(14)} ${e.message}${e.where ? ` (at ${e.where})` : ""}`);
  }
}

console.log("\nfeatures:", [...L.features].join(" "));
console.log("\nfile system:");
for (const line of fs.log) console.log("  " + line);
if (L.warnings.length) {
  console.log("\nwarnings:");
  for (const w of L.warnings) console.log("  " + w);
}
const out = L.ttyText.join("");
if (out.trim()) console.log("\nterminal output:\n" + out);

// A few things those files define, to show they're live.
const check = (expr) => {
  try {
    return L.print(L.evalString(expr));
  } catch (e) {
    return `error: ${e.message}`;
  }
};
console.log("\nchecks:");
console.log("  (status feature director-loader) =>", check("(status feature director-loader)"));
console.log("  (get 'dump-director 'autoload)   =>", check("(get 'dump-director 'autoload)"));
console.log("  :help-storage-place              =>", check(":help-storage-place"));
console.log("  base, ibase, *nopoint            =>", check("(list base ibase *nopoint)"));
console.log("  (fboundp-ish 'director)          =>", check("(car (getl 'director '(expr fexpr macro subr lsubr fsubr)))"));
process.exit(ok ? 0 : 1);
