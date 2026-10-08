// Compare the choices recorded in CP 29 (tape 7005017) and RUN24 2 (tape 9004336).
// Usage: node tools/oracle-compare.mjs
import { readFileSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { makeReader, printForm, Cons, Sym } from "../src/maclisp/reader.js";

function choices(path) {
  const forms = makeReader({ file: path }).readAll(decodeItsText(readFileSync(path)).text);
  const m = new Map();
  for (const { form } of forms) {
    if (!(form instanceof Cons) || form.car.name !== "DEFINE") continue;
    const name = printForm(form.cdr.car);
    let c = form.cdr.cdr.cdr;
    while (c instanceof Cons) {
      const clause = c.car;
      const words = [];
      for (let p = clause; p instanceof Cons; p = p.cdr) words.push(p.car);
      if (words[0] instanceof Sym && words[0].name === "SET" && words[2]?.name === "CURRENT-CHOICE") {
        m.set(name, printForm(words[4]));
      }
      c = c.cdr;
    }
  }
  return m;
}

const a = choices("original/7005017/cp.29");
const b = choices("original/9004336/run24.2");
let same = 0;
const diffs = [];
for (const [k, v] of a) {
  if (!b.has(k)) diffs.push(`only in cp.29: ${k} = ${v}`);
  else if (b.get(k) === v) same++;
  else diffs.push(`${k}: cp.29 ${v}, run24.2 ${b.get(k)}`);
}
for (const k of b.keys()) if (!a.has(k)) diffs.push(`only in run24.2: ${k} = ${b.get(k)}`);
console.log(`cp.29 ${a.size} choices, run24.2 ${b.size} choices, identical ${same}`);
for (const d of diffs) console.log("  " + d);
